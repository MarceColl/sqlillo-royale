package main

import (
	"encoding/json"
	"log"

	"github.com/gofiber/fiber/v2"
)

func (*Api) PrivateUserHandler(c *fiber.Ctx, user User) error {
	return c.JSON(user)
}

func (api *Api) PrivateCodeHandler(c *fiber.Ctx, user User) error {
	var codes []*Code = []*Code{}

	if err := api.db.NewSelect().Model(&codes).Where("username = ?", user.Username).Scan(c.Context()); err != nil {
		log.Printf("[WARN] Could not list codes of user %s: %v\n", user.Username, err)
		return c.SendStatus(fiber.StatusBadRequest)
	}

	return c.JSON(codes)
}

func (api *Api) PrivateCreateCodeHandler(c *fiber.Ctx, user User) error {
	var codeBody struct {
		Code string `json:"code"`
	}

	if err := json.Unmarshal(c.Body(), &codeBody); err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}

	code := &Code{
		Username: user.Username,
		Code:     codeBody.Code,
	}

	if _, err := api.db.NewInsert().Model(code).Exec(c.Context()); err != nil {
		log.Printf("[WARN] Could not create new code for user %s: %v\n", user.Username, err)
		return c.SendStatus(fiber.StatusBadRequest)
	}

	return c.JSON(code)
}

func (api *Api) PrivateGamesHandler(c *fiber.Ctx, user User) error {
	var games []*Game = []*Game{}

	if err := api.db.NewSelect().Model(&games).Column("id", "config", "outcome", "created_at", "updated_at").Join("JOIN games_to_users AS g2u ON g.id = g2u.game_id").Where("g2u.username = ?", user.Username).OrderExpr("created_at DESC").Scan(c.Context()); err != nil {
		log.Printf("[WARN] Could not list games of user %s: %v\n", user.Username, err)
		return c.SendStatus(fiber.StatusBadRequest)
	}

	return c.JSON(games)
}
