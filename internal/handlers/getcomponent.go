package handlers

import (
	"net/http"

	c "github.com/gavink97/gav-ink/internal/components"
	"github.com/gavink97/gav-ink/internal/utils"
)

type ComponentHandler struct{}

func NewComponentHandler() *ComponentHandler {
	return &ComponentHandler{}
}

func (h *ComponentHandler) GetMobileMenuModal(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	gl := utils.CheckGLCookie(w, r)

	err := c.MobileMenuModal(gl).Render(r.Context(), w)
	if err != nil {
		http.Error(w, "Error rendering template", http.StatusInternalServerError)
		return
	}
}
