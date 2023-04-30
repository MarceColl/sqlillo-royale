package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
)

func (api *Api) WithUser(handler func(c *fiber.Ctx, u User) error) func(c *fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		username := c.UserContext().Value("username").(string)

		user := new(User)

		if err := api.db.NewSelect().Model(user).Where("username = ?", username).Scan(c.Context()); err != nil {
			log.Printf("[ERROR] Could not get user from %s: %v\n", username, err)
			return c.SendStatus(fiber.StatusForbidden)
		}

		return handler(c, *user)
	}
}
