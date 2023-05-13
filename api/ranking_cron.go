package main

import (
	"log"
	"time"

	"context"
	"database/sql"

	"github.com/uptrace/bun"
)

// SetupRankingCron is a simple minute cron that
// updates the ranking
func (api *Api) SetupRankingCron() {
	for range time.Tick(time.Minute) {
		go api.RankingCron()
	}
}

// RankingCron is a function that updates the ranking atomically
func (api *Api) RankingCron() {
	api.db.RunInTx(context.Background(), &sql.TxOptions{}, func(ctx context.Context, tx bun.Tx) error {
		var g2u []*GameToUser = []*GameToUser{}

		if err := api.db.NewSelect().Model(&g2u).Column("g2u.game_id", "g2u.username", "g2u.rank", "g.created_at").Join("JOIN games AS g ON g2u.game_id = g.id").Scan(ctx); err != nil {
			log.Printf("[WARN] Could not get games to users: %v\n", err)
			return err
		}

		log.Println("We have", len(g2u), "G2Us")

		// for i, g2u := range g2u {
		// 	fmt.Println(i, g2u.Game.ID, g2u.Game.CreatedAt, g2u.Username, g2u.Rank)
		// }

		return nil
	})
}
