package utils

import (
	"net/http"
	"time"

	"github.com/gavink97/gav-ink/internal/globals"
)

func CheckGLCookie(w http.ResponseWriter, r *http.Request) bool {
	if !globals.WebGLMode {
		http.SetCookie(w, &http.Cookie{
			Name:    "nogl",
			Value:   "true",
			Expires: time.Now().Add(24 * time.Hour),
			Path:    "/",
		})

		return false
	}

	prefnogl, err := r.Cookie("prefnogl")
	if err == nil {
		if prefnogl.Value == "true" {
			return false
		}
	}

	nogl, err := r.Cookie("nogl")
	if err != nil {
		return true
	}

	if nogl.Value == "true" {
		return false
	} else {
		return true
	}
}
