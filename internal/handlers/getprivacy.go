package handlers

import (
	"net/http"

	"github.com/gavink97/gav-ink/internal/layouts"
	"github.com/gavink97/gav-ink/internal/views"
)

type PrivacyHandLer struct {
}

func NewPrivacyHandler() *PrivacyHandLer {
	return &PrivacyHandLer{}
}

func (h *PrivacyHandLer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	c := views.Privacy()

	err := layouts.Layout(c, "My website").Render(r.Context(), w)

	if err != nil {
		http.Error(w, "Error rendering template", http.StatusInternalServerError)
		return
	}
}
