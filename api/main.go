package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	app := fiber.New()

	api := NewAPI()

	app.Use(logger.New(logger.Config{
		Format: "[${ip}]:${port} ${status} - ${method} ${path}\n",
	}))

	app.Use(cors.New())

	app.Get("/healthcheck", api.HealthHandler)

	apiRoutes := app.Group("/api")

	apiRoutes.Post("/login", api.PublicLoginHandler)
	apiRoutes.Post("/register", api.PublicRegisterHandler)

	// TODO: Ranking
	apiRoutes.Get("/ranking", NotImplementedHandler)

	apiRoutes.Get("/carouselle", api.PublicCarouselleHandler)
	apiRoutes.Get("/games/:id", api.PublicGameByIdHandler)
	apiRoutes.Get("/games", api.PublicGamesHandler)

	private := apiRoutes.Group("/private")

	// JWT auth middleware
	private.Use(api.VerifyJwtHandler)

	private.Get("/user", api.WithUser(api.PrivateUserHandler))

	private.Get("/codes", api.WithUser(api.PrivateCodeHandler))
	private.Post("/codes", api.WithUser(api.PrivateCreateCodeHandler))

	private.Get("/games", api.WithUser(api.PrivateGamesHandler))

	port := os.Getenv("PORT")

	if port == "" {
		port = "8000"
	}

	log.Fatalln(app.Listen(fmt.Sprintf(":%v", port)))
}
