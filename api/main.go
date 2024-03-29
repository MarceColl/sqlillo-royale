package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/websocket/v2"
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

	apiRoutes.Get("/ranking", api.PublicRankingHandler)
	apiRoutes.Post("/_update-ranking", api.PublicUpdateRankingHandler)

	apiRoutes.Get("/carouselle", api.PublicCarouselleHandler)
	apiRoutes.Get("/games/:id", api.PublicGameInfoByIdHandler)
	apiRoutes.Get("/games", api.PublicGamesHandler)
	apiRoutes.Get("/games-data/:id", api.PublicGameByIdHandler)

	private := apiRoutes.Group("/private")

	// JWT auth middleware
	private.Use(api.VerifyJwtHandler)

	private.Get("/user", api.WithUser(api.PrivateUserHandler))

	private.Get("/codes", api.WithUser(api.PrivateCodeHandler))
	private.Post("/codes", api.WithUser(api.PrivateCreateCodeHandler))

	private.Get("/games", api.WithUser(api.PrivateGamesHandler))

	apiRoutes.Get("/games/:id/ws", websocket.New(api.PublicGameByIdWsHandler))
	go api.SetupRankingCron()

	port := os.Getenv("PORT")

	if port == "" {
		port = "8000"
	}

	log.Fatalln(app.Listen(fmt.Sprintf(":%v", port)))
}
