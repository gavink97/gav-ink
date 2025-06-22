package handlers

import (
	"net/http"

	"github.com/gavink97/gav-ink/internal/layouts"
	"github.com/gavink97/gav-ink/internal/views"
)

type ServicesHandLer struct {
}

func NewServicesHandler() *ServicesHandLer {
	return &ServicesHandLer{}
}

func (h *ServicesHandLer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	c := views.Services2()

	err := layouts.Layout(c, "My website").Render(r.Context(), w)

	if err != nil {
		http.Error(w, "Error rendering template", http.StatusInternalServerError)
		return
	}
}
