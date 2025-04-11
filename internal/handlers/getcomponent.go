package handlers

import (
	"net/http"

	c "github.com/gavink97/gav-ink/internal/components"
)

type ComponentHandler struct{}

func NewComponentHandler() *ComponentHandler {
	return &ComponentHandler{}
}

func (h *ComponentHandler) GetBurgerModal(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	err := c.BurgerModal().Render(r.Context(), w)
	if err != nil {
		http.Error(w, "Error rendering template", http.StatusInternalServerError)
		return
	}
}
