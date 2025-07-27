package utils

import (
	"fmt"
	"io"
	"log"
	"log/slog"
	"os"
	"path"
	"sync"
	"time"
)

type RotatingWriter struct {
	currentFile *os.File
	currentDate string
	mu          sync.Mutex
}

func (w *RotatingWriter) Write(p []byte) (n int, err error) {
	environment := "TZ"
	tz, ok := os.LookupEnv(environment)
	if !ok {
		slog.Warn("Missing Environment Variable", "Output", environment)
	}

	localTZ, err := time.LoadLocation(tz)
	if err != nil {
		slog.Warn("Unable to recognize Time zone", "Output", tz, "Error", err)
		slog.Debug("Defaulting to UTC")
		localTZ = time.UTC
	}

	today := time.Now().In(localTZ).Format("2006-01-02")

	w.mu.Lock()
	defer w.mu.Unlock()

	if today != w.currentDate {
		if w.currentFile != nil {
			err = w.currentFile.Close()
			if err != nil {
				slog.Error("Unable to close log file", "Error", err)
				return 0, err
			}
		}

		if err := os.MkdirAll("logs", os.ModePerm); err != nil && !os.IsExist(err) {
			slog.Error("An unexpected error occured when creating the logs directory", "Output", "logs", "Error", err)
			return 0, fmt.Errorf("failed to create logs directory: %w", err)
		}

		filename := path.Join("logs", fmt.Sprintf("%s.log", today))
		f, err := os.OpenFile(filename, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
		if err != nil {
			slog.Error("An unexpected error occured when creating a log file", "Output", filename, "Error", err)
			return 0, fmt.Errorf("failed to open log file: %w", err)
		}

		w.currentFile = f
		w.currentDate = today
	}

	return w.currentFile.Write(p)
}

// expand multiwriter
func SetDefaultLogger(verbose bool) {
	environment := "env"
	env, ok := os.LookupEnv(environment)
	if !ok {
		err := os.Setenv(environment, "dev")
		if err != nil {
			log.Fatal(err)
		}
		log.Printf("Warning: Missing Environment Variable: %s", environment)
	}

	rotatingWriter := new(RotatingWriter)
	output := io.MultiWriter(os.Stdout, rotatingWriter)

	var programLevel = new(slog.LevelVar)

	h := slog.NewJSONHandler(output, &slog.HandlerOptions{Level: programLevel})
	logHandler := slog.New(h)

	if env == "prod" {
		programLevel.Set(slog.LevelWarn)
	} else {
		programLevel.Set(slog.LevelInfo)
	}

	if verbose {
		programLevel.Set(slog.LevelDebug)
	}

	slog.SetDefault(logHandler)
}
