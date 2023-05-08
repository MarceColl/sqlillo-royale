package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
)

func (api *Api) PublicGamesHandler(c *fiber.Ctx) error {
	var games []*Game = []*Game{}

	if err := api.db.NewSelect().Model(&games).Scan(c.Context()); err != nil {
		log.Printf("[WARN] Could not list games: %v\n", err)
		return c.SendStatus(fiber.StatusBadRequest)
	}

	return c.JSON(games)
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
	var data []byte

	if err := api.db.NewSelect().Model(&data).Column("data").Table("games").OrderExpr("RANDOM()").Limit(1).Scan(c.Context()); err != nil {
		log.Printf("[WARN] Could not get random game for carouselle: %v\n", err)
		return c.SendStatus(fiber.StatusBadRequest)
	}

	return c.Send(data)
}
