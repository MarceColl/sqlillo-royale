package main

import (
	"log"
	"time"
	"math"

	"context"
	"database/sql"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

// SetupRankingCron is a simple minute cron that
// updates the ranking
func (api *Api) SetupRankingCron() {
	for range time.Tick(time.Minute) {
		go api.RankingCron()
	}
}

type RankingData struct {
	GameID uuid.UUID `json:"game_id"`
	Username string `json:"username"`
	Rank int `json:"rank"`
	CreatedAt time.Time `json:"created_at"`
}

type RankingGrouped struct {
	GameID uuid.UUID `json:"game_id"`
	CreatedAt time.Time `json:"created_at"`
	Ranks []*RankingData `json:"ranks"`
}

// RankingCron is a function that updates the ranking atomically
func (api *Api) RankingCron() (map[string]float64, error) {
	ranking := map[string]float64{}

	if err := api.db.RunInTx(context.Background(), &sql.TxOptions{}, func(ctx context.Context, tx bun.Tx) error {
		var g2u []RankingData

		if err := api.db.NewRaw(
			`SELECT g2u.game_id, g2u.username, g2u.rank, g.created_at 
			FROM games_to_users as g2u JOIN games AS g ON g2u.game_id = g.id
			WHERE g.created_at > (NOW() - INTERVAL '1 hour')
			ORDER BY g.created_at ASC`,
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
					GameID: game_id,
					CreatedAt: curr.CreatedAt,
					Ranks: make([]*RankingData, 0),
				}

				ids = append(ids, game_id)
			}

			grouped[game_id].Ranks = append(grouped[game_id].Ranks, &curr)
			ranking[curr.Username] = 0.0
		}

		// if b, err := json.MarshalIndent(grouped, "", "  "); err == nil {
		// 	log.Println(string(b))
		// }

		for _, id := range ids {
			UpdateRatings(grouped[id].Ranks, ranking, 32)
		}

		return nil
	}); err != nil {
		return nil, err
	}

	return ranking, nil
}

/* Python code from the Latest!

def calculate_expected_scores(ratings):
total_rating = sum(ratings)
expected_scores = []
for rating in ratings:
expected_score = 1 / (1 + math.pow(10, (total_rating - rating) / 400))
expected_scores.append(expected_score)
return expected_scores
*/
func CalculateExpectedScore(datas []*RankingData, ranks map[string]float64) {
	totalRating := 0.0
	for _, r := range datas {
		totalRating += float64(r.Rank)
	}

	for _, r := range datas {
		expectedScore := 1 / (1 + math.Pow(10, (totalRating - float64(r.Rank)) / 400))
		ranks[r.Username] = expectedScore
	}
}


/* Python code from the Latest!

def update_ratings(ratings, scores, k_factor=32):
expected_scores = calculate_expected_scores(ratings)
new_ratings = []
for i in range(len(ratings)):
new_rating = ratings[i] + k_factor * (scores[i] - expected_scores[i])
new_ratings.append(new_rating)
return new_ratings
*/
func UpdateRatings(data []*RankingData, ranks map[string]float64, kFactor int) {
	lastRanks := map[string]float64{}

	for key, val := range ranks {
		lastRanks[key] = val
	}

	CalculateExpectedScore(data, ranks)

	// log.Println(ranks)

	for _, r := range data {
		newRating := float64(r.Rank) + float64(kFactor) * (lastRanks[r.Username] - ranks[r.Username])
		ranks[r.Username] = newRating
	}
}
