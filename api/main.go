package main

import (
	"context"
	"encoding/json"
	"log"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func PublicAuthHandler(c *fiber.Ctx) error {
	b := c.Body()

	var login AuthLogin

	if err := json.Unmarshal(b, &login); err != nil {
		log.Printf("Could not unmarhsal: %v\n", err)
		return c.SendStatus(fiber.StatusBadRequest)
	}

	user, ok := users[login.Username]

	if !ok {
		log.Printf("User %s does not exist\n", login.Username)
		return c.SendStatus(fiber.StatusBadRequest)
	}

	if !user.CheckPass(login.Password) {
		log.Printf("[WARN] User %s tried to login with wrong password\n", login.Username)
		return c.SendStatus(fiber.StatusBadRequest)
	}

	token, err := user.NewToken()

	if err != nil {
		log.Printf("[ERROR] Could not generate token for user %s: %v\n", login.Username, err)
		return c.SendStatus(fiber.StatusInternalServerError)
	}

	return c.JSON(map[string]string{
		"token": token,
	})
}

func verifyJwtHandler(c *fiber.Ctx) error {
	auth, ok := c.GetReqHeaders()["Authorization"]

	if !ok {
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	s := strings.Split(auth, "Bearer ")

	if len(s) != 2 {
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	user, err := ParseToken(s[1])

	if err != nil {
		log.Printf("[WARN] Could not parse token: %v\n", err)
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	c.SetUserContext(
		context.WithValue(
			context.Background(),
			"user",
			user,
		),
	)

	return c.Next()
}

func WithUser(handler func(c *fiber.Ctx, u User) error) func(c *fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		user := c.UserContext().Value("user").(*User)

		if user == nil {
			return c.SendStatus(fiber.StatusUnauthorized)
		}

		return handler(c, *user)
	}
}

func PrivateUserHandler(c *fiber.Ctx, user User) error {
	return c.JSON(user)
}

func PrivateCodeHandler(c *fiber.Ctx, user User) error {
	return c.JSON([]*Code{
		{
			Username:  user.Username,
			Code:      "fn some_code() {}",
			CreatedAt: time.Now(),
		},
	})
}

func PrivateCreateCodeHandler(c *fiber.Ctx, user User) error {
	return c.JSON(&Code{
		Username:  user.Username,
		Code:      "fn some_code() {}",
		CreatedAt: time.Now(),
	})
}

func main() {
	app := fiber.New()

	app.Use(logger.New(logger.Config{
		Format: "[${ip}]:${port} ${status} - ${method} ${path}\n",
	}))

	app.Get("/healthcheck", HealthHandler)

	api := app.Group("/api")

	api.Post("/login", PublicAuthHandler)
	api.Post("/register", PublicAuthHandler)

	// TODO: Carouselle equivalent of the games
	// TODO: Ranking
	// TODO: Games will be public
	api.Get("/carouselle", NotImplementedHandler)
	api.Get("/ranking", NotImplementedHandler)
	api.Get("/games", NotImplementedHandler)

	private := api.Group("/private")

	// JWT auth middleware
	private.Use(verifyJwtHandler)

	private.Get("/user", WithUser(PrivateUserHandler))

	private.Get("/codes", WithUser(PrivateCodeHandler))
	private.Post("/codes", WithUser(PrivateCreateCodeHandler))

	private.Get("/games", NotImplementedHandler)
	private.Get("/games/:id", NotImplementedHandler)

	app.Listen(":3000")
}
