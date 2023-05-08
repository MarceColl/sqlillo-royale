package main

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

// AuthLogin
type AuthLogin struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// AuthRegister
type AuthRegister struct {
	Username  string `json:"username"`
	Password  string `json:"password"`
	Password2 string `json:"password2"`
}

// User is the main struct for users XD
type User struct {
	bun.BaseModel `bun:"table:users,alias:u"`

	// Username of the User, and it's also its ID
	Username     string `json:"username" bun:",pk"`
	PasswordHash string `json:"-" bun:",notnull"`

	Codes []*Code `json:"-" bun:"rel:has-many,join:username=username"`
	Games []*Game `json:"-" bun:"m2m:games_to_users,join:Game=User"`

	CreatedAt time.Time `json:"created_at" bun:"default:now(),notnull"`
	UpdatedAt time.Time `json:"updated_at" bun:"default:now(),notnull"`
	DeletedAt time.Time `json:"-" bun:",soft_delete,nullzero"`
}

// Code is the main struct for the code versions
// of the user
type Code struct {
	bun.BaseModel `bun:"table:codes,alias:c"`

	ID       uuid.UUID `json:"id" bun:"type:uuid,pk,default:uuid_generate_v4()"`
	Username string    `json:"username" bun:",notnull"`
	User     User      `json:"-" bun:"rel:belongs-to,join:username=username"`
	Code     string    `json:"code" bun:",notnull"`

	CreatedAt time.Time `json:"created_at" bun:"default:now(),notnull"`
	UpdatedAt time.Time `json:"updated_at" bun:"default:now(),notnull"`
	DeletedAt time.Time `json:"-" bun:",soft_delete,nullzero"`
}

// Game
type Game struct {
	bun.BaseModel `bun:"table:games,alias:g"`

	ID   uuid.UUID `json:"id" bun:"type:uuid,pk,default:uuid_generate_v4()"`
	Data []byte    `json:"-" bun:",notnull"`

	// TODO: Define all needed data here

	Users []*User `json:"-" bun:"m2m:games_to_users,join:Game=User"`

	CreatedAt time.Time `json:"created_at" bun:"default:now(),notnull"`
	UpdatedAt time.Time `json:"updated_at" bun:"default:now(),notnull"`
	DeletedAt time.Time `json:"-" bun:",soft_delete,nullzero"`
}

// GameToUser defines the many to many relationship between
// the Game and User models
type GameToUser struct {
	bun.BaseModel `bun:"table:games_to_users,alias:g2u"`

	Username string    `bun:",pk"`
	User     *User     `bun:"rel:belongs-to,join:username=username"`
	GameID   uuid.UUID `bun:"type:uuid,pk"`
	Game     *Game     `bun:"rel:belongs-to,join:game_id=id"`
}

// GameConfig is the high level definition
// of a SQLillo game
type GameConfig struct {
	Width      int  `json:"width"`
	Heigth     int  `json:"heigth"`
	Duration   int  `json:"duration"`
	NumPlayers int  `json:"num_players"`
	DcActive   bool `json:"dc_active"`
}

// GameOutcomeItem is the outcome of a game, for a specific player
type GameOutcomeItem struct {
	Ranking     int       `json:"ranking"`
	Username    string    `json:"username"`
	CodeVersion uuid.UUID `json:"code_version"`
}
