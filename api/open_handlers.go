package main

import (
	"github.com/gofiber/fiber/v2"
)

// HealthHandler is a simpel handler for
// healthcheck purposes
func HealthHandler(c *fiber.Ctx) error {
	return c.SendString("SQLillo Royale!")
}

// NotImplementedHandler is the default
// handler to be used when an endpoint is not implemented.
//
// It returns a 501 HTTP status code
func NotImplementedHandler(c *fiber.Ctx) error {
	return c.SendStatus(fiber.StatusNotImplemented)
}
