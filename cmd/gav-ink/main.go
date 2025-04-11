package main

import (
	"fmt"
	"log/slog"

	"github.com/gavink97/gav-ink/internal/blog"
	"github.com/gavink97/gav-ink/internal/github"
	"github.com/gavink97/gav-ink/internal/routes"
	"github.com/gavink97/gav-ink/internal/zoho"
	"github.com/joho/godotenv"
)

func main() {
	routes.SetDefaultLogger()

	err := godotenv.Load()
	if err != nil {
		slog.Error(fmt.Sprintf("Error loading .env file: %v", err))
	}

	zoho.RotatingAccessToken()
	github.GenerateGithubStats()
	blog.GetPosts()
	routes.Serve()
}
