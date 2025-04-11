package blog

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"os"
	"path"
	"sort"
	"strings"

	"github.com/a-h/templ"
	g "github.com/gavink97/gav-ink/internal/globals"
	"github.com/gavink97/gav-ink/internal/types"
)

func Unsafe(html string) templ.Component {
	return templ.ComponentFunc(func(ctx context.Context, w io.Writer) (err error) {
		_, err = io.WriteString(w, html)
		return
	})
}

func GetPosts() []*types.Post {
	root := "./assets/studies"
	files, err := os.ReadDir(root)
	if err != nil {
		slog.Error(fmt.Sprintf("An error occured %v", err))
	}

	for _, file := range files {
		if !strings.HasSuffix(file.Name(), ".adoc") {
			continue
		}

		filePath := path.Join(root, file.Name())

		f, err := os.ReadFile(filePath)
		if err != nil {
			slog.Error(fmt.Sprintf("An error occured %v", err))
		}

		post := ParseDocuemntHead(string(f))
		g.Posts = append(g.Posts, post)
	}

	sort.Slice(g.Posts, func(i, j int) bool {
		return g.Posts[i].Id > g.Posts[j].Id
	})

	return g.Posts
}

func GetPostByTitle(title string) (*types.Post, error) {
	for i := range g.Posts {
		if strings.EqualFold(g.Posts[i].Title, title) {
			return g.Posts[i], nil
		}
	}
	return nil, fmt.Errorf("post with title '%s' not found", title)
}
