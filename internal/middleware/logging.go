package middleware

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"runtime/debug"
	"time"
)

type responseWriter struct {
	http.ResponseWriter
	status      int
	wroteHeader bool
}

func wrapResponseWriter(w http.ResponseWriter) *responseWriter {
	return &responseWriter{ResponseWriter: w}
}

func (rw *responseWriter) Status() int {
	return rw.status
}

func (rw *responseWriter) WriteHeader(code int) {
	if rw.wroteHeader {
		return
	}

	rw.status = code
	rw.ResponseWriter.WriteHeader(code)
	rw.wroteHeader = true
}

func (m *Middleware) LoggingMiddleware(next http.Handler) http.Handler {
	logger := slog.Default()

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				logger.LogAttrs(
					context.Background(),
					slog.LevelError,
					"internal server error",
					slog.String("err", fmt.Sprintf("%v", err)),
					slog.String("trace", string(debug.Stack())),
				)
			}
		}()

		start := time.Now()
		ms := time.Since(start).Milliseconds()
		wrapped := wrapResponseWriter(w)

		next.ServeHTTP(wrapped, r)

		logger.LogAttrs(
			context.Background(),
			slog.LevelInfo,
			"incoming request",
			slog.Int("status", wrapped.status),
			slog.String("method", r.Method),
			slog.String("path", r.URL.EscapedPath()),
			slog.String("host", r.Host),
			slog.String("user_agent", r.UserAgent()),
			slog.Int64("duration", ms),
		)
	})
}
