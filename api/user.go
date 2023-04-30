package main

import (
	jwt "github.com/golang-jwt/jwt/v5"
	"time"
)

var SIGN_KEY []byte = []byte("AllYourBase")

type JWTClaims struct {
	User *User `json:"user"`
	jwt.RegisteredClaims
}

// CheckPass of the user
func (u *User) CheckPass(pass string) bool {
	// TODO: Validate hash
	if pass == u.PasswordHash {
		return true
	}

	return false
}

// ParseToken tries to parse a JWT string into
// the custom JWT claim
func ParseToken(tokenString string) (*User, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		return SIGN_KEY, nil
	})

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims.User, nil
	} else {
		return nil, err
	}
}

// NewToken generates a new JWT for the given user.
// The default expiration is 24 hours, because why not
func (u *User) NewToken() (string, error) {
	claims := JWTClaims{
		u,
		jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			Issuer:    "sqlillo",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString(SIGN_KEY)
}
