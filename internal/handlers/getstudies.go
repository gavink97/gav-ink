package handlers

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"path"
	"strconv"

	c "github.com/gavink97/gav-ink/internal/components"
	"github.com/gavink97/gav-ink/internal/layouts"
	"github.com/gavink97/gav-ink/internal/studies"
	v "github.com/gavink97/gav-ink/internal/views"
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

	public := "dist"
	dirName := "studies"

	// use posts instead of routes
	routes, err := os.ReadDir(path.Join(public, dirName))
	if err != nil {
		http.Error(w, "An Internal Server Error Occured", http.StatusMethodNotAllowed)
		return
	}

	var connect bool

	for _, route := range routes {
		rt := path.Join("/", dirName, route.Name())

		if r.URL.Path == rt {
			post, err := studies.GetPostByTitle(route.Name())
			if err != nil {
				slog.Error(fmt.Sprintf("An error occured: %s", err))
				return
			}

			file := path.Join(public, dirName, route.Name(), "index.html")
			html, err := os.ReadFile(file)
			if err != nil {
				slog.Error(fmt.Sprintf("An error occured: %v", err))
				return
			}

			content := studies.Unsafe(string(html))

			component := r.URL.Query().Get("component")
			if component != "" {
				cbool, err := strconv.ParseBool(component)
				if err != nil {
					c := c.ContentComponent(content, *post, false)
					err = layouts.Layout(c, post.Title).Render(r.Context(), w)
					if err != nil {
						http.Error(w, "Error rendering template", http.StatusInternalServerError)
						return
					}

					return
				}

				if cbool {
					err := c.ContentComponent(content, *post, true).Render(r.Context(), w)
					if err != nil {
						http.Error(w, "Error rendering template", http.StatusInternalServerError)
						return
					}

					return
				}
			}

			c := c.ContentComponent(content, *post, false)
			err = layouts.Layout(c, post.Title).Render(r.Context(), w)
			if err != nil {
				http.Error(w, "Error rendering template", http.StatusInternalServerError)
			}

			return
		}
	}

	if !connect {
		c := v.NotFound()
		err = layouts.Layout(c, "Not Found").Render(r.Context(), w)
		if err != nil {
			slog.Error(fmt.Sprintf("An error occured: %v", err))
		}
	}
}
