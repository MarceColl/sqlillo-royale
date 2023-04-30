package main

import (
	"time"

	jwt "github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// TODO: From env
var SIGN_KEY []byte = []byte("AllYourBase")

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
		return SIGN_KEY, nil
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

	return token.SignedString(SIGN_KEY)
}
