package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	app := fiber.New()

	api := NewAPI()

	app.Use(logger.New(logger.Config{
		Format: "[${ip}]:${port} ${status} - ${method} ${path}\n",
	}))

	app.Get("/healthcheck", api.HealthHandler)

	apiRoutes := app.Group("/api")

	apiRoutes.Post("/login", api.PublicLoginHandler)
	apiRoutes.Post("/register", api.PublicRegisterHandler)

	// TODO: Carouselle equivalent of the games
	// TODO: Ranking
	// TODO: Games will be public
	apiRoutes.Get("/carouselle", NotImplementedHandler)
	apiRoutes.Get("/ranking", NotImplementedHandler)
	apiRoutes.Get("/games", NotImplementedHandler)

	private := apiRoutes.Group("/private")

	// JWT auth middleware
	private.Use(api.VerifyJwtHandler)

	private.Get("/user", api.WithUser(api.PrivateUserHandler))

	private.Get("/codes", api.WithUser(api.PrivateCodeHandler))
	private.Post("/codes", api.WithUser(api.PrivateCreateCodeHandler))

	private.Get("/games", api.WithUser(api.PrivateGameHandler))
	private.Get("/games/:id", NotImplementedHandler)

	port := os.Getenv("PORT")

	if port == "" {
		port = "3000"
	}

	log.Fatalln(app.Listen(fmt.Sprintf(":%v", port)))
}
