package main

import (
	"context"
	"database/sql"

	"log"

	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/driver/pgdriver"
	"github.com/uptrace/bun/extra/bundebug"
)

type Api struct {
	db *bun.DB
}

// NewAPI tries to create a new Api instance, if some step
// fails it panics
func NewAPI() *Api {
	// TODO: From env
	dsn := "postgresql://mmz:mmz@localhost:5432/sqlillo?sslmode=disable"

	sqldb := sql.OpenDB(pgdriver.NewConnector(pgdriver.WithDSN(dsn)))

	db := bun.NewDB(sqldb, pgdialect.New())
	db.AddQueryHook(bundebug.NewQueryHook(bundebug.WithVerbose(true)))

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
	}

	db.RegisterModel((*GameToUser)(nil))

	for i, model := range models {
		log.Printf("Created model %d\n", i)

		if _, err := db.NewCreateTable().Model(model).IfNotExists().WithForeignKeys().Exec(ctx); err != nil {
			return err
		}
	}

	log.Printf("%d tables created!\n", len(models))
	return nil
}
