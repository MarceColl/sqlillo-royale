package main

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/uptrace/bun"
)

func (api *Api) PublicGamesHandler(c *fiber.Ctx) error {
	var games []*Game = []*Game{}

	q := api.db.NewSelect().Model(&games).Column("id", "config", "outcome", "created_at", "updated_at").OrderExpr("created_at DESC")

	if round := c.Query("round"); round != "" {
		q = q.Where("round = ?", round)
	}

	if err := q.Scan(c.Context()); err != nil {
		log.Printf("[WARN] Could not list games: %v\n", err)
		return c.SendStatus(fiber.StatusBadRequest)
	}

	return c.JSON(games)
}

func (api *Api) PublicGameInfoByIdHandler(c *fiber.Ctx) error {
	game := new(Game)

	id := c.Params("id", "")

	if id == "" {
		return c.SendStatus(fiber.StatusBadRequest)
	}

	if err := api.db.NewSelect().Model(game).Where("id = ?", id).Scan(c.Context()); err != nil {
		log.Printf("[WARN] Could not get game info for %s: %v\n", id, err)
		return c.SendStatus(fiber.StatusBadRequest)
	}

	return c.JSON(game)
}

func (api *Api) PublicGameByIdHandler(c *fiber.Ctx) error {
	var data []byte

	id := c.Params("id", "")

	if id == "" {
		return c.SendStatus(fiber.StatusBadRequest)
	}

	if err := api.db.NewSelect().Model(&data).Column("data").Table("games").Where("id = ?", id).Scan(c.Context()); err != nil {
		log.Printf("[WARN] Could not get game data for %s: %v\n", id, err)
		return c.SendStatus(fiber.StatusBadRequest)
	}

	return c.Send(data)
}

func (api *Api) PublicCarouselleHandler(c *fiber.Ctx) error {
	data := new(Game)

	bot := time.Now().Add(-time.Hour * 2)

	if err := api.db.NewSelect().Model(data).Column("id", "config", "outcome", "created_at", "updated_at").Where("created_at > ?", bot).OrderExpr("RANDOM()").Limit(1).Scan(c.Context()); err != nil {
		log.Printf("[WARN] Could not get random game for carouselle: %v\n", err)
		return c.SendStatus(fiber.StatusBadRequest)
	}

	c.Set("X-Game-Id", data.ID.String())
	return c.JSON(data)
}

func (api *Api) PublicGameByIdWsHandler(c *websocket.Conn) {
	defer func() {
		c.Close()
	}()

	ctx := context.Background()

	id := c.Params("id", "")

	if id == "" {
		return
	}

	var dataBytes []byte

	if err := api.db.NewSelect().Model(&dataBytes).Column("data").Table("games").Where("id = ?", id).Scan(ctx); err != nil {
		log.Printf("[ERROR] Could not get game data for %s: %v\n", id, err)
		return
	}

	var data []map[string]interface{}

	if err := json.Unmarshal(dataBytes, &data); err != nil {
		log.Printf("[ERROR] Could not unmarshal bytes of game data for %s: %v\n", id, err)
		return
	}

	for i, trace := range data {
		if bb, err := json.Marshal(trace); err != nil {
			log.Printf("[ERROR] Could not unmarshal bytes for the trace %d for game %s: %v\n", i, id, err)
		} else {
			if err := c.WriteMessage(
				websocket.BinaryMessage,
				bb,
			); err != nil {
				log.Printf("[ERROR] Could to send messgae for trace %d and game %s: %v\n", i, id, err)
			}
		}

	}

	return
}

func (api *Api) PublicUpdateRankingHandler(c *fiber.Ctx) error {
	auth, ok := c.GetReqHeaders()["X-Sqlillo"]

	if !ok || auth != "sqlillo" {
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	if ranking, err := api.RankingCron(); err != nil {
		log.Printf("[ERROR] Could not update ranking: %v\n", err)

		return c.SendStatus(fiber.StatusInternalServerError)
	} else {
		return c.JSON(ranking)
	}
}

func (api *Api) PublicRankingHandler(c *fiber.Ctx) error {
	var ranking []*Ranking = []*Ranking{}
	var lastCreatedAt time.Time

	q := api.db.NewSelect().Model(&lastCreatedAt).ColumnExpr("max(?)", bun.Ident("created_at")).Table("rankings")

	if round := c.Query("round"); round != "" {
		q = q.Where("round = ?", round)

		log.Println("ranking round", round)
	} else {
		q = q.Where("round IS NULL")
	}

	if err := q.Scan(c.Context()); err != nil {
		log.Printf("[WARN] Could not get last ranking created_at: %v\n", err)
		return c.SendStatus(fiber.StatusBadRequest)
	}

	if err := api.db.NewSelect().Model(&ranking).OrderExpr("rank DESC").Where("created_at = ?", lastCreatedAt).Scan(c.Context()); err != nil {
		log.Printf("[WARN] Could not get ranking: %v\n", err)
		return c.SendStatus(fiber.StatusBadRequest)
	}

	return c.JSON(ranking)
}
