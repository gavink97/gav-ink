package middleware

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"strings"

	"github.com/a-h/templ"
	"github.com/didip/tollbooth/v8"
	"github.com/didip/tollbooth/v8/limiter"
	"github.com/patrickmn/go-cache"
)

type Middleware struct {
	Cache   cache.Cache
	Limiter *limiter.Limiter
}

type MiddlewareParams struct {
	Cache   cache.Cache
	Limiter *limiter.Limiter
}

func NewMiddlewareHandler(params MiddlewareParams) *Middleware {
	return &Middleware{
		Cache:   params.Cache,
		Limiter: params.Limiter,
	}
}

func generateRandomString(length int) string {
	bytes := make([]byte, length)
	_, err := rand.Read(bytes)
	if err != nil {
		return ""
	}
	return hex.EncodeToString(bytes)
}

func (m *Middleware) CSP(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		nonce := generateRandomString(24)
		ctx := templ.WithNonce(r.Context(), nonce)
		cspHeader := fmt.Sprintf(
			"default-src 'none'; "+
				"script-src 'self' 'nonce-%[1]s' ; "+
				"script-src-elem 'self' 'nonce-%[1]s' ; "+
				"connect-src 'self';"+
				"img-src 'self';"+
				// "style-src 'self' 'nonce-%[1]s' fonts.googleapis.com ; " +
				"style-src 'self' 'unsafe-inline'; "+
				"font-src 'self' fonts.gstatic.com; ",
			nonce)

		//if os.Getenv("env") == "prod" {
		w.Header().Add("Content-Security-Policy", cspHeader)
		//}
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (m *Middleware) ContentTypeHTML(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		next.ServeHTTP(w, r)
	})
}

func GetNonce(ctx context.Context) string {
	nonce := templ.GetNonce(ctx)

	/*
		if nonce == "" {
			slog.Warn("Nonce not set")
		}
	*/

	return nonce
}

func (m *Middleware) RemoveTrailingSlash(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" && strings.HasSuffix(r.URL.Path, "/") {
			http.Redirect(w, r, strings.TrimSuffix(r.URL.Path, "/"), http.StatusMovedPermanently)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (m *Middleware) Limiting(next http.Handler) http.Handler {
	if os.Getenv("env") == "dev" {
		return next
	}

	return tollbooth.LimitFuncHandler(m.Limiter, next.ServeHTTP)
}

type cachedResponseWriter struct {
	originalWriter http.ResponseWriter
	statusCode     int
	body           *bytes.Buffer
	headers        http.Header
}

func newCachedResponseWriter(w http.ResponseWriter) *cachedResponseWriter {
	return &cachedResponseWriter{
		originalWriter: w,
		body:           bytes.NewBuffer(nil),
		headers:        make(http.Header),
		statusCode:     http.StatusOK,
	}
}

func (crw *cachedResponseWriter) Header() http.Header {
	return crw.headers
}

func (crw *cachedResponseWriter) Write(b []byte) (int, error) {
	return crw.body.Write(b)
}

func (crw *cachedResponseWriter) WriteHeader(statusCode int) {
	crw.statusCode = statusCode
}

func (m *Middleware) Caching(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			next.ServeHTTP(w, r)
			return
		}

		cacheKey := fmt.Sprint("v1-", r.URL.String())

		cached, found := m.Cache.Get(cacheKey)
		if found {
			w.Header().Set("Cache-Status", "HIT")
			w.Header().Set("Content-Type", "text/html; charset=utf-8")
			_, err := w.Write(cached.([]byte))
			if err != nil {
				slog.Error("An error occured when rendering cache")
				return
			}

			return
		}

		crw := newCachedResponseWriter(w)
		next.ServeHTTP(crw, r)

		//fmt.Println(crw.statusCode)
		if crw.statusCode == http.StatusOK {
			responseBytes := crw.body.Bytes()
			m.Cache.Set(cacheKey, responseBytes, cache.DefaultExpiration)
			w.Header().Set("Cache-Status", "MISS")
			w.Header().Set("Cache-Control", "public, max-age=3600")
			_, err := w.Write(responseBytes)
			if err != nil {
				slog.Error("An error occured when rendering response")
				return
			}
		}
	})
}
