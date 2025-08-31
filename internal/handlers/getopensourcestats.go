package handlers

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"sort"

	"github.com/gavink97/gav-ink/internal/components"

	gh "github.com/gavink97/gav-ink/internal/github"
)

func (h *ComponentHandler) GetOpenSourceTable(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	stats := gh.Stats
	if stats == nil {
		statsDump := "github-stats.json"
		file, err := os.ReadFile(statsDump)
		if err != nil {
			slog.Error(fmt.Sprintf("An Error occured reading: %s", statsDump), "Error", err)
		}

		var r []gh.Repository
		err = json.Unmarshal(file, &r)
		if err != nil {
			slog.Error(fmt.Sprintf("An Error occured unmarshalling: %s", statsDump), "Error", err)
		}

		stats = r
	}

	key := r.URL.Query().Get("primary")

	order := r.URL.Query().Get("order")
	if order != "dsc" {
		order = "asc"
	}

	if order == "asc" || order == "dsc" {
		sort.Slice(stats, func(i, j int) bool {
			var asc bool

			switch key {
			case "stargazers":
				if stats[i].Fork && stats[j].Fork {
					asc = stats[i].Parent.StargazersCount < stats[j].Parent.StargazersCount
				} else {
					asc = stats[i].StargazersCount < stats[j].StargazersCount
				}
			case "date":
				asc = stats[i].TimeCreated.Before(stats[j].TimeCreated)
			case "name":
				asc = stats[i].Name > stats[j].Name
			default:
				asc = stats[i].TimeCreated.Before(stats[j].TimeCreated)
			}

			if order == "asc" {
				return !asc
			}

			return asc
		})
	}

	err := components.OpenSourceTable(stats).Render(r.Context(), w)
	if err != nil {
		http.Error(w, "Error rendering template", http.StatusInternalServerError)
		return
	}
}
