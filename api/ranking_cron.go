package main

import (
	"fmt"
	"log"
	"math"
	"time"

	"context"
	"database/sql"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

// SetupRankingCron is a simple minute cron that
// updates the ranking
func (api *Api) SetupRankingCron() {
	for range time.Tick(time.Minute) {
		go api.RankingCron(nil)
	}
}

type NewRankingData struct {
	Username string `json:"username"`
	Rank     int    `json:"rank"`
}

type RankingData struct {
	GameID    uuid.UUID `json:"game_id"`
	Username  string    `json:"username"`
	Rank      int       `json:"rank"`
	CreatedAt time.Time `json:"created_at"`
}

type RankingGrouped struct {
	GameID    uuid.UUID     `json:"game_id"`
	CreatedAt time.Time     `json:"created_at"`
	Ranks     []RankingData `json:"ranks"`
}

func (api *Api) RankingCron(round *string) (bool, error) {
	if err := api.db.RunInTx(context.Background(), &sql.TxOptions{}, func(ctx context.Context, tx bun.Tx) error {
		var xd []NewRankingData

		s := "g.created_at > (NOW() - INTERVAL '120 minutes')"

		if round != nil {
			s = fmt.Sprintf("g.round = '%s'", *round)
		}

		if err := api.db.NewRaw(
			fmt.Sprintf(
				`WITH max_pollas AS (
					SELECT game_id, MAX(rank) AS m 
					FROM games_to_users gtp 
					JOIN games g 
					ON (g.id = gtp.game_id) 
					WHERE %s
					GROUP BY game_id
				) 
				SELECT 
					username,
					((SUM(rank) / NULLIF(AVG(mp.m), 0)) * 100) :: bigint as rank
				FROM games_to_users gtu 
				JOIN max_pollas mp 
				ON (
					mp.game_id = gtu.game_id
				) 
				GROUP BY username 
				ORDER BY 2 DESC`,
				s,
			),
		).Scan(ctx, &xd); err != nil {
			log.Printf("[WARN] Could not get pollas: %v\n", err)
			return err
		}

		now := time.Now()

		for _, wow := range xd {
			if _, err := api.db.NewInsert().Model(&Ranking{
				Username:  wow.Username,
				Rank:      uint(wow.Rank),
				CreatedAt: now,
				Round:     round,
			}).Exec(ctx); err != nil {
				log.Printf("[ERROR] Could not store new ranking: %v\n", err)

				return err
			}
		}

		return nil
	}); err != nil {
		return false, err
	}

	return true, nil
}

// RankingCron is a function that updates the ranking atomically
func (api *Api) RankingCronOld(round *string) (map[string]float64, error) {
	ranking := map[string]float64{}

	if err := api.db.RunInTx(context.Background(), &sql.TxOptions{}, func(ctx context.Context, tx bun.Tx) error {
		var g2u []RankingData

		s := "g.created_at > (NOW() - INTERVAL '30 minutes')"

		if round != nil {
			s = fmt.Sprintf("g.round = '%s'", *round)
		}

		if err := api.db.NewRaw(
			fmt.Sprintf(
				`SELECT g2u.game_id, g2u.username, g2u.rank, g.created_at 
				FROM games_to_users as g2u JOIN games AS g ON g2u.game_id = g.id
				WHERE %s ORDER BY g.created_at ASC`,
				s,
			),
		).Scan(ctx, &g2u); err != nil {
			log.Printf("[WARN] Could not get games to users: %v\n", err)
			return err
		}

		log.Println("We have", len(g2u), "G2Us")

		grouped := map[uuid.UUID]*RankingGrouped{}
		ids := make([]uuid.UUID, 0)

		for _, curr := range g2u {
			game_id := curr.GameID

			if _, ok := grouped[game_id]; !ok {
				grouped[game_id] = &RankingGrouped{
					GameID:    game_id,
					CreatedAt: curr.CreatedAt,
					Ranks:     make([]RankingData, 0),
				}

				ids = append(ids, game_id)
			}

			grouped[game_id].Ranks = append(grouped[game_id].Ranks, curr)
			ranking[curr.Username] = 0.0
		}

		// if b, err := json.MarshalIndent(grouped, "", "  "); err == nil {
		// 	log.Println(string(b))
		// }

		for _, id := range ids {
			newRank := UpdateRatings(grouped[id].Ranks, ranking, 0)

			for username, rank := range newRank {
				ranking[username] = rank
			}

			// log.Println(id)

			// for username, rank := range ranking {
			// 	log.Println(username, rank)
			// }
		}

		// if err := api.db.NewRaw(
		// 	`DELETE FROM rankings`,
		// ).Scan(ctx, &g2u); err != nil {
		// 	log.Printf("[ERROR] Could not reset ranking: %v\n", err)
		// 	return err
		// }

		now := time.Now()

		for username, rank := range ranking {
			log.Println(username, rank)

			if _, err := api.db.NewInsert().Model(&Ranking{
				Username:  username,
				Rank:      uint(math.Round(rank)),
				CreatedAt: now,
				Round:     round,
			}).Exec(ctx); err != nil {
				log.Printf("[ERROR] Could not store ranking for %v and %f: %v\n", username, rank, err)
				return err
			}
		}

		return nil
	}); err != nil {
		return nil, err
	}

	return ranking, nil
}

/*
	Python code from the Latest!

def calculate_expected_scores(ratings):
total_rating = sum(ratings)
expected_scores = []
for rating in ratings:
expected_score = 1 / (1 + math.pow(10, (total_rating - rating) / 400))
expected_scores.append(expected_score)
return expected_scores
*/
func CalculateExpectedScore(datas []RankingData) map[string]float64 {
	newRanks := map[string]float64{}

	totalRating := 0.0
	for _, r := range datas {
		totalRating += float64(r.Rank)
	}

	for _, r := range datas {
		expectedScore := 1 / (1 + math.Pow(10, (totalRating-float64(r.Rank))/400))
		newRanks[r.Username] = expectedScore
	}

	return newRanks
}

/*
	Python code from the Latest!

def update_ratings(ratings, scores, k_factor=32):
expected_scores = calculate_expected_scores(ratings)
new_ratings = []
for i in range(len(ratings)):
new_rating = ratings[i] + k_factor * (scores[i] - expected_scores[i])
new_ratings.append(new_rating)
return new_ratings
*/
func UpdateRatings(data []RankingData, ranks map[string]float64, kFactor int) map[string]float64 {
	newRanks := map[string]float64{}
	calcRanks := CalculateExpectedScore(data)

	for _, r := range data {
		newRating := float64(r.Rank) + float64(kFactor)*(ranks[r.Username]-calcRanks[r.Username])
		newRanks[r.Username] = newRating
	}

	return newRanks
}
