package main

import (
	"os"
	"time"

	jwt "github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// SIGN_KEY is a singleton that will be set
// by the `GetSignKey` func on the first request
// i.e. lazy loaded
var SIGN_KEY []byte

// GetSignKey returns the sign key
func GetSignKey() []byte {
	if len(SIGN_KEY) > 0 {
		return SIGN_KEY
	}

	// Default for testing purposes
	signKey := []byte("KmJ6#pX4bTDf##Oy7lA7Iogj*#JhDBthW(WOSKiUJU")

	if signKeyFromEnv := os.Getenv("SIGN_KEY"); signKeyFromEnv != "" {
		signKey = []byte(signKeyFromEnv)
	}

	SIGN_KEY = signKey

	return SIGN_KEY
}

type JWTClaims struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

// CheckPass of the user password
func (u *User) CheckPass(pass string) bool {
	if err := bcrypt.CompareHashAndPassword(
		[]byte(u.PasswordHash),
		[]byte(pass),
	); err != nil {
		return false
	}

	return true
}

// ParseToken tries to parse a JWT string into
// the custom JWT claim
func ParseToken(tokenString string) (string, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		return GetSignKey(), nil
	})

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims.Username, nil
	} else {
		return "", err
	}
}

// NewToken generates a new JWT for the given user.
// The default expiration is 24 hours, because why not
func (u *User) NewToken() (string, error) {
	claims := JWTClaims{
		u.Username,
		jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			Issuer:    "sqlillo",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString(GetSignKey())
}
