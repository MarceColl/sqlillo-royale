package main

import "time"

var users map[string]*User = map[string]*User{
	"test": {
		Username:     "test",
		PasswordHash: "test",
		CreatedAt:    time.Now(),
	},
}
