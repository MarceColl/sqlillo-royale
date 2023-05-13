package main

import (
	"context"
	"database/sql"
	"os"

	"log"

	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/driver/pgdriver"
)

type Api struct {
	db *bun.DB
}

// NewAPI tries to create a new Api instance, if some step
// fails it panics
func NewAPI() *Api {
	dsn := "postgresql://mmz:mmz@localhost:5432/sqlillo?sslmode=disable"

	if dsnFromEnv := os.Getenv("DATABASE_URL"); dsnFromEnv != "" {
		dsn = dsnFromEnv
	}

	sqldb := sql.OpenDB(pgdriver.NewConnector(pgdriver.WithDSN(dsn)))

	db := bun.NewDB(sqldb, pgdialect.New())

	// For logging purposes
	// db.AddQueryHook(bundebug.NewQueryHook(bundebug.WithVerbose(true)))

	ctx := context.Background()

	if _, err := db.Exec("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"", ctx); err != nil {
		log.Fatalf("Could not create UUID extension: %v", err)
	}

	if err := CreateSchema(ctx, db); err != nil {
		log.Fatalf("Could not create models: %v", err)
	}

	return &Api{
		db: db,
	}
}

// CreateSchema creates database schema
func CreateSchema(ctx context.Context, db *bun.DB) error {
	models := []interface{}{
		(*User)(nil),
		(*Game)(nil),
		(*GameToUser)(nil),
		(*Code)(nil),
		(*Ranking)(nil),
	}

	// Needed for the many-to-many relationship
	// between users and games
	db.RegisterModel((*GameToUser)(nil))

	for i, model := range models {
		_, err := db.NewCreateTable().Model(model).IfNotExists().WithForeignKeys().Exec(ctx)

		if err != nil {
			return err
		}

		log.Printf("Created model '%v'\n", i)
	}

	log.Printf("%d tables created!\n", len(models))
	return nil
}
