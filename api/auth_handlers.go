package main

import (
	"context"
	"encoding/json"
	"log"
	"strings"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

func (api *Api) PublicLoginHandler(c *fiber.Ctx) error {
	b := c.Body()

	var login AuthLogin

	if err := json.Unmarshal(b, &login); err != nil {
		log.Printf("Could not unmarhsal: %v\n", err)
		return c.SendStatus(fiber.StatusBadRequest)
	}

	user := new(User)

	if err := api.db.NewSelect().Model(user).Where("username = ?", login.Username).Scan(c.Context()); err != nil {
		log.Printf("Could not query DB: %v\n", err)
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

func (api *Api) PublicRegisterHandler(c *fiber.Ctx) error {
	b := c.Body()

	var register AuthRegister

	if err := json.Unmarshal(b, &register); err != nil {
		log.Printf("Could not unmarhsal: %v\n", err)
		return c.SendStatus(fiber.StatusBadRequest)
	}

	if register.Password != register.Password2 {
		return c.SendStatus(fiber.StatusBadRequest)
	}

	pass, err := bcrypt.GenerateFromPassword(
		[]byte(register.Password),
		bcrypt.DefaultCost,
	)

	if err != nil {
		log.Printf("[ERROR] Could not generate hash: %v\n", err)
		return c.SendStatus(fiber.StatusInternalServerError)
	}

	user := &User{
		Username:     register.Username,
		PasswordHash: string(pass),
	}

	if _, err := api.db.NewInsert().Model(user).Exec(c.Context()); err != nil {
		log.Printf("[WARN] Could not register new user %s: %v\n", user.Username, err)
		return c.SendStatus(fiber.StatusBadRequest)
	}

	token, err := user.NewToken()

	if err != nil {
		log.Printf("[ERROR] Could not generate token for user %s: %v\n", register.Username, err)
		return c.SendStatus(fiber.StatusInternalServerError)
	}

	return c.JSON(map[string]string{
		"token": token,
	})
}

func (*Api) VerifyJwtHandler(c *fiber.Ctx) error {
	auth, ok := c.GetReqHeaders()["Authorization"]

	if !ok {
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	s := strings.Split(auth, "Bearer ")

	if len(s) != 2 {
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	username, err := ParseToken(s[1])

	if err != nil {
		log.Printf("[WARN] Could not parse token: %v\n", err)
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	c.SetUserContext(
		context.WithValue(
			context.Background(),
			"username",
			username,
		),
	)

	return c.Next()
}
