package middleware

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/a-h/templ"
	"github.com/didip/tollbooth/v8"
	"github.com/didip/tollbooth/v8/limiter"
)

func generateRandomString(length int) string {
	bytes := make([]byte, length)
	_, err := rand.Read(bytes)
	if err != nil {
		return ""
	}
	return hex.EncodeToString(bytes)
}

func CSPMiddleware(next http.Handler) http.Handler {
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

		if os.Getenv("env") == "prod" {
			w.Header().Add("Content-Security-Policy", cspHeader)
		}
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func TextHTMLMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		next.ServeHTTP(w, r)
	})
}

func GetNonce(ctx context.Context) string {
	nonce := templ.GetNonce(ctx)

	if nonce == "" {
		slog.Warn("Nonce not set")
	}

	return nonce
}

func RemoveTrailingSlashMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" && strings.HasSuffix(r.URL.Path, "/") {
			http.Redirect(w, r, strings.TrimSuffix(r.URL.Path, "/"), http.StatusMovedPermanently)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func Limiter(next http.Handler) http.Handler {
	if os.Getenv("env") == "dev" {
		return next
	}

	lmt := tollbooth.NewLimiter(2, &limiter.ExpirableOptions{DefaultExpirationTTL: time.Hour})

	lmt.SetIPLookup(limiter.IPLookup{
		Name:           "RemoteAddr",
		IndexFromRight: 0,
	})

	lmt.SetMessage("You have reached maximum request limit.")

	lmt.SetMessageContentType("text/plain; charset=utf-8")

	lmt.SetOnLimitReached(func(w http.ResponseWriter, r *http.Request) {
		slog.Warn(fmt.Sprintf("A request was rejected by the server from remote address: %s", r.RemoteAddr))
	})

	return tollbooth.LimitFuncHandler(lmt, next.ServeHTTP)
}
