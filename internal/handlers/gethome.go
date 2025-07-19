package handlers

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	l "github.com/gavink97/gav-ink/internal/layouts"
	l_nogl "github.com/gavink97/gav-ink/internal/layouts/nogl"
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

	gl := r.URL.Query().Get("nogl")
	if gl != "" {
		nogl, err := strconv.ParseBool(gl)
		if err != nil {
			http.Error(w, "Error rendering template", http.StatusInternalServerError)
			return
		}

		if nogl {
			c := v_nogl.Index()
			err := l_nogl.Layout(c, "gav.ink • where design meets innovation").Render(r.Context(), w)

			if err != nil {
				http.Error(w, "Error rendering template", http.StatusInternalServerError)
				return
			}
		} else {
			c := v.Index()
			err := l.Layout(c, "gav.ink • where design meets innovation").Render(r.Context(), w)

			if err != nil {
				http.Error(w, "Error rendering template", http.StatusInternalServerError)
				return
			}
		}
	} else {
		c := v.Index()
		err := l.Layout(c, "gav.ink • where design meets innovation").Render(r.Context(), w)

		if err != nil {
			http.Error(w, "Error rendering template", http.StatusInternalServerError)
			return
		}
	}
}
