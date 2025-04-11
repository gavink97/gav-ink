package handlers

import (
	"net/http"
	"sort"

	"github.com/gavink97/gav-ink/internal/views"

	gh "github.com/gavink97/gav-ink/internal/github"
)

func (h *ComponentHandler) GetOpenSourceTable(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// its possible that gh stats are nil so we should make a placeholder.
	stats := gh.Stats

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
				asc = stats[i].StargazersCount < stats[j].StargazersCount
			case "date":
				asc = stats[i].TimeCreated.Before(stats[j].TimeCreated)
			case "name":
				asc = stats[i].Name < stats[j].Name
			default:
				asc = stats[i].TimeCreated.Before(stats[j].TimeCreated)
			}

			if order == "asc" {
				return !asc
			}

			return asc
		})
	}

	err := views.PortfolioTable(stats).Render(r.Context(), w)
	if err != nil {
		http.Error(w, "Error rendering template", http.StatusInternalServerError)
		return
	}
}
