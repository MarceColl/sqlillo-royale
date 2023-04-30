package main

import "time"

// AuthLogin
type AuthLogin struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// User is the main struct for users XD
type User struct {
	// Username of the User, and it's also its ID
	Username     string    `json:"username"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
}

// Code is the main struct for the code versions
// of the user
type Code struct {
	Username  string    `json:"username"`
	Code      string    `json:"code"`
	CreatedAt time.Time `json:"created_at"`
}
