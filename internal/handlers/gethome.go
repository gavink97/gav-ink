package handlers

import (
	"net/http"
	"strconv"

	"github.com/a-h/templ"
	"github.com/gavink97/gav-ink/internal/layouts"
	"github.com/gavink97/gav-ink/internal/views"
)

type HomeHandler struct{}

func NewHomeHandler() *HomeHandler {
	return &HomeHandler{}
}

func (h *HomeHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var c templ.Component

	gl := r.URL.Query().Get("nogl")
	if gl != "" {
		nogl, err := strconv.ParseBool(gl)
		if err != nil {
			http.Error(w, "Error rendering template", http.StatusInternalServerError)
			return
		}

		if nogl {
			c = views.IndexNoGL()
		} else {
			c = views.Index()
		}
	} else {
		c = views.Index()
	}

	//c = views.IndexNoGL()
	err := layouts.Layout(c, "gav.ink • where design meets innovation").Render(r.Context(), w)

	if err != nil {
		http.Error(w, "Error rendering template", http.StatusInternalServerError)
		return
	}
}
