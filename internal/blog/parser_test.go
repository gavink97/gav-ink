package blog_test

import (
	"testing"

	"github.com/gavink97/gav-ink/internal/blog"
)

var documentHeader = `
    = Gridt
    Gavin Kondrath <gavin@gav.ink>
    1.0, 2025-03-23

    :id: 2
    :keywords: Browser Extension, CSS Grid, Developer Tool
    :url-website: https://gav.ink/studies/gridt
    `

func TestParseTitle(t *testing.T) {
	expected := "Gridt"
	result := blog.ParseTitle(documentHeader)

	if expected != result {
		t.Errorf("Bad Result: result: %s expected: %s", result, expected)
	}
}

func TestParseRevisionDate(t *testing.T) {
	expected := "2025-03-23"
	result := blog.ParseRevisionDate(documentHeader)

	if expected != result.Format("2006-01-02") {
		t.Errorf("Bad Result: result: %s expected: %s", result, expected)
	}
}

func TestParseEmail(t *testing.T) {
	expected := "gavin@gav.ink"
	result := blog.ParseEmail(documentHeader)

	if expected != result {
		t.Errorf("Bad Result: result: %s expected: %s", result, expected)
	}
}

func TestParseId(t *testing.T) {
	expected := 2
	result := blog.ParseId(documentHeader)

	if expected != result {
		t.Errorf("Bad Result: result: %d expected: %d", result, expected)
	}
}

func TestParseKeywords(t *testing.T) {
	expected := []string{"Browser Extension", "CSS Grid", "Developer Tool"}
	result := blog.ParseKeywords(documentHeader)

	for index := range result {
		if result[index] != expected[index] {
			t.Errorf("Bad Result: result: %s expected: %s", result, expected)
		}
	}
}
