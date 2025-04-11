package handlers

import (
	"net/http"

	"github.com/gavink97/gav-ink/internal/layouts"
	"github.com/gavink97/gav-ink/internal/views"
)

type AboutHandLer struct {
}

func NewAboutHandler() *AboutHandLer {
	return &AboutHandLer{}
}

func (h *AboutHandLer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	c := views.About()

	err := layouts.Layout(c, "My website").Render(r.Context(), w)

	if err != nil {
		http.Error(w, "Error rendering template", http.StatusInternalServerError)
		return
	}
}
