package handlers

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"path"
	"strconv"

	"github.com/gavink97/gav-ink/internal/blog"
	c "github.com/gavink97/gav-ink/internal/components"
	"github.com/gavink97/gav-ink/internal/layouts"
	"github.com/gavink97/gav-ink/internal/views"
)

type StudyHandler struct{}

func NewStudyHandler() *StudyHandler {
	return &StudyHandler{}
}

func (h *StudyHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	dist := "dist"
	studies := "studies"

	// use posts instead of routes
	routes, err := os.ReadDir(path.Join(dist, studies))
	if err != nil {
		http.Error(w, "An Internal Server Error Occured", http.StatusMethodNotAllowed)
		return
	}

	var connect bool

	for _, route := range routes {
		rt := path.Join("/", studies, route.Name())

		if r.URL.Path == rt {
			post, err := blog.GetPostByTitle(route.Name())
			if err != nil {
				slog.Error(fmt.Sprintf("An error occured: %s", err))
				return
			}

			file := path.Join(dist, studies, route.Name(), "index.html")
			html, err := os.ReadFile(file)
			if err != nil {
				slog.Error(fmt.Sprintf("An error occured: %v", err))
				return
			}

			content := blog.Unsafe(string(html))

			component := r.URL.Query().Get("component")
			if component != "" {
				cbool, err := strconv.ParseBool(component)
				if err != nil {
					c := c.ContentComponent(*post, content)
					err = layouts.Layout(c, post.Title).Render(r.Context(), w)
					if err != nil {
						http.Error(w, "Error rendering template", http.StatusInternalServerError)
						return
					}

					return
				}

				if cbool {
					err := c.ContentComponent(*post, content).Render(r.Context(), w)
					if err != nil {
						http.Error(w, "Error rendering template", http.StatusInternalServerError)
						return
					}

					return
				}
			}

			c := c.ContentComponent(*post, content)
			err = layouts.Layout(c, post.Title).Render(r.Context(), w)
			if err != nil {
				http.Error(w, "Error rendering template", http.StatusInternalServerError)
			}

			return
		}
	}

	if !connect {
		c := views.NotFound()
		err = layouts.Layout(c, "Not Found").Render(r.Context(), w)
		if err != nil {
			slog.Error(fmt.Sprintf("An error occured: %v", err))
		}
	}
}
