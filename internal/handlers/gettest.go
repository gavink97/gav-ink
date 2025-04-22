package handlers

import (
	"net/http"

	"github.com/gavink97/gav-ink/internal/components"
	"github.com/gavink97/gav-ink/internal/layouts"
)

type TestHandler struct{}

func NewTestHandler() *TestHandler {
	return &TestHandler{}
}

func (h *TestHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	err := layouts.Head("test").Render(r.Context(), w)
	if err != nil {
		http.Error(w, "Error rendering template", http.StatusInternalServerError)
		return
	}

	err = components.Loader().Render(r.Context(), w)
	if err != nil {
		http.Error(w, "Error rendering template", http.StatusInternalServerError)
		return
	}
}
