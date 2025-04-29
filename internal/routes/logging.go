package routes

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"path"
	"runtime/debug"
	"sync"
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

// fix repeating log requests
func loggingMiddleware() func(http.Handler) http.Handler {
	rotatingWriter := &RotatingWriter{}
	h := slog.NewJSONHandler(rotatingWriter, nil)
	logger := slog.New(h)

	return func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {
			//fmt.Printf("Connection: %s\n", r.Header.Get("Connection"))
			defer func() {
				if err := recover(); err != nil {
					w.WriteHeader(http.StatusInternalServerError)
					logger.LogAttrs(
						context.Background(),
						slog.LevelWarn,
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
		}

		return http.HandlerFunc(fn)
	}
}

// get debug level to work in dev
func SetDefaultLogger() {
	env, ok := os.LookupEnv("env")
	if !ok {
		env = "dev"
		os.Setenv("env", env)
	}

	rotatingWriter := &RotatingWriter{}
	output := io.MultiWriter(os.Stdout, rotatingWriter)

	h := slog.NewJSONHandler(output, nil)
	logHandler := slog.New(h)

	if env == "prod" {
		slog.SetLogLoggerLevel(slog.LevelWarn)
	} else {
		slog.SetLogLoggerLevel(slog.LevelDebug)
	}

	slog.SetDefault(logHandler)
}

type RotatingWriter struct {
	currentFile *os.File
	currentDate string
	mu          sync.Mutex
}

func (w *RotatingWriter) Write(p []byte) (n int, err error) {
	w.mu.Lock()
	defer w.mu.Unlock()

	today := time.Now().UTC().Format("2006-01-02")

	if today != w.currentDate {
		if w.currentFile != nil {
			w.currentFile.Close()
		}

		if err := os.MkdirAll("logs", os.ModePerm); err != nil && !os.IsExist(err) {
			return 0, fmt.Errorf("failed to create logs directory: %w", err)
		}

		filename := path.Join("logs", fmt.Sprintf("%s.log", today))
		f, err := os.OpenFile(filename, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
		if err != nil {
			return 0, fmt.Errorf("failed to open log file: %w", err)
		}

		w.currentFile = f
		w.currentDate = today
	}

	return w.currentFile.Write(p)
}
