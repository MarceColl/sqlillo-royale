package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
)

func (api *Api) PublicGamesHandler(c *fiber.Ctx) error {
	var games []*Game = []*Game{}

	if err := api.db.NewSelect().Model(&games).Column("id", "config", "outcome", "created_at", "updated_at").OrderExpr("created_at DESC").Scan(c.Context()); err != nil {
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

	if err := api.db.NewSelect().Model(data).Column("id", "config", "outcome", "created_at", "updated_at").OrderExpr("RANDOM()").Limit(1).Scan(c.Context()); err != nil {
		log.Printf("[WARN] Could not get random game for carouselle: %v\n", err)
		return c.SendStatus(fiber.StatusBadRequest)
	}

	c.Set("X-Game-Id", data.ID.String())
	return c.JSON(data)
}
