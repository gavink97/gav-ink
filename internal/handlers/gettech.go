package handlers

import (
	"net/http"

	"github.com/gavink97/gav-ink/internal/layouts"
	"github.com/gavink97/gav-ink/internal/views"
)

type TechHandLer struct {
}

func NewTechHandler() *TechHandLer {
	return &TechHandLer{}
}

func (h *TechHandLer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	c := views.Tech()

	err := layouts.Layout(c, "My website").Render(r.Context(), w)

	if err != nil {
		http.Error(w, "Error rendering template", http.StatusInternalServerError)
		return
	}
}
