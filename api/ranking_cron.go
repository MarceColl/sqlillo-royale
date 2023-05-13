package main

import (
	"fmt"
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

		if err := api.db.NewSelect().Model(&g2u).Scan(ctx); err != nil {
			log.Printf("[WARN] Could not get games to users: %v\n", err)
			return err
		}

		fmt.Println(len(g2u))

		return nil
	})
}
