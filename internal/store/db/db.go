package db

import (
	"errors"
	"fmt"
	"io/fs"
	"log/slog"
	"os"
	"path"

	"github.com/gavink97/gav-ink/internal/store"

	"gorm.io/driver/sqlite" // Sqlite driver based on CGO
	// "github.com/glebarez/sqlite" // Pure go SQLite driver, checkout https://github.com/glebarez/sqlite for details
	"gorm.io/gorm"
)

func open(dbName string) (*gorm.DB, error) {

	// make the temp directory if it doesn't exist
	err := os.MkdirAll("/tmp", 0755)
	if err != nil {
		return nil, err
	}

	return gorm.Open(sqlite.Open(dbName), &gorm.Config{})
}

func MustOpen(dbName string) *gorm.DB {
	if dbName == "" {
		dbName = "data/gavink/users.db"
	}

	_, err := os.Stat(dbName)
	if errors.Is(err, fs.ErrNotExist) {
		if err := os.MkdirAll(path.Dir(dbName), os.ModePerm); err != nil {
			slog.Error(fmt.Sprintf("An unexpected error occured when creating %s directory", path.Dir(dbName)), "Error", err)
		}
	}

	db, err := open(dbName)
	if err != nil {
		panic(err)
	}

	err = db.AutoMigrate(&store.User{})

	if err != nil {
		panic(err)
	}

	return db
}
