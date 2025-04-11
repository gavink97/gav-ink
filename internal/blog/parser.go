package blog

import (
	"fmt"
	"path"
	"strconv"
	"strings"
	"time"
	"unicode"

	"github.com/gavink97/gav-ink/internal/types"
	"github.com/gosimple/slug"
)

// add author, revision version, and other things to parser
func ParseDocuemntHead(document string) *types.Post {
	title := ParseTitle(document)
	id := ParseId(document)
	keywords := ParseKeywords(document)
	revisionDate := ParseRevisionDate(document)

	url := path.Join("/", "studies", slug.Make(title), "/")

	return types.NewPost(types.NewPostParams{
		Id:           id,
		Title:        title,
		Tags:         keywords,
		LastModified: revisionDate,
		Url:          url,
	})
}

func ParseTitle(document string) string {
	s := strings.TrimFunc(document, func(r rune) bool {
		return !unicode.IsLetter(r)
	})
	return strings.TrimSpace(strings.SplitAfter(s, "\n")[0])
}

func ParseRevisionDate(document string) time.Time {
	s := strings.TrimFunc(document, func(r rune) bool {
		return !unicode.IsNumber(r)
	})
	r := strings.SplitAfter(s, "\n")[0]
	t := strings.TrimSpace(strings.SplitAfter(r, ",")[1])

	date, err := time.Parse("2006-01-02", t)
	if err != nil {
		fmt.Println(err)
		return time.Time{}
	}

	return date
}

func ParseEmail(document string) string {
	s := strings.TrimFunc(document, func(r rune) bool {
		return r != '<' && r != '>'
	})
	i := len(s)
	return s[1 : i-1]
}

func ParseId(document string) int {
	s := strings.TrimFunc(document, func(r rune) bool {
		return r != ':'
	})

	for split := range strings.SplitAfterSeq(s, "\n") {
		if strings.ContainsAny("id", split) {
			i, err := strconv.Atoi(strings.TrimFunc(split, func(r rune) bool {
				return !unicode.IsNumber(r)
			}))

			if err != nil {
				return -1
			}

			return i
		}
	}

	return -1
}

func ParseKeywords(document string) []string {
	var strs []string

	s := strings.TrimFunc(document, func(r rune) bool {
		return r != ':'
	})

	for split := range strings.SplitAfterSeq(s, "\n") {
		if strings.ContainsAny("key", split) {

			keys := strings.SplitAfter(split, ":")[2]

			for key := range strings.SplitSeq(keys, ",") {
				strs = append(strs, strings.TrimSpace(key))
			}
			return strs
		}
	}

	return nil
}
