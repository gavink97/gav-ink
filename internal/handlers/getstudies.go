package handlers

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"path"

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

	for _, route := range routes {
		rt := path.Join("/", studies, route.Name())

		if r.URL.String() == rt {
			post, err := blog.GetPostByTitle(route.Name())
			if err != nil {
				slog.Error(fmt.Sprintf("An error occured: %s", err))
			}

			file := path.Join(dist, studies, route.Name(), "index.html")
			html, err := os.ReadFile(file)
			if err != nil {
				slog.Error(fmt.Sprintf("An error occured: %v", err))
			}

			content := blog.Unsafe(string(html))

			comp := c.ContentComponent(*post, content)
			err = layouts.Layout(comp, post.Title).Render(r.Context(), w)
			if err != nil {
				slog.Error(fmt.Sprintf("failed to convert markdown to HTML: %v", err))
			}

			return
		}
	}

	c := views.NotFound()
	err = layouts.Layout(c, "Not Found").Render(r.Context(), w)
	if err != nil {
		slog.Error(fmt.Sprintf("An error occured: %v", err))
	}
}
