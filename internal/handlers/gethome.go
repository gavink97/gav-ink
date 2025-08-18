package handlers

import (
	"fmt"
	"net/http"
	"os"
	"time"

	l "github.com/gavink97/gav-ink/internal/layouts"
	"github.com/gavink97/gav-ink/internal/utils"
	v "github.com/gavink97/gav-ink/internal/views"
	v_nogl "github.com/gavink97/gav-ink/internal/views/nogl"
)

type HomeHandler struct{}

func NewHomeHandler() *HomeHandler {
	return &HomeHandler{}
}

func (h *HomeHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if os.Getenv("env") == "dev" {
		start := time.Now()
		defer func() {
			fmt.Printf("Handler took: %v\n", time.Since(start))
		}()
	}

	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	title := "gav.ink • where design meets sustainable innovation"

	gl := utils.CheckGLCookie(w, r)

	if gl {
		c := v.Index()
		err := l.Layout(c, title).Render(r.Context(), w)

		if err != nil {
			http.Error(w, "Error rendering template", http.StatusInternalServerError)
			return
		}

	} else {
		c := v_nogl.Index()
		err := l.Layout(c, title).Render(r.Context(), w)

		if err != nil {
			http.Error(w, "Error rendering template", http.StatusInternalServerError)
			return
		}
	}
}
