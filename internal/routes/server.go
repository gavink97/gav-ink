package routes

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func Serve() {
	serverLog := slog.NewLogLogger(slog.NewJSONHandler(os.Stdout, nil), slog.LevelWarn)

	var host string
	env := os.Getenv("env")
	if env == "prod" {
		host = os.Getenv("HOST")
	} else {
		host = "localhost"
	}

	port := os.Getenv("PORT")
	addr := fmt.Sprintf("%s:%s", host, port)

	router := newRouter()

	killSig := make(chan os.Signal, 1)
	signal.Notify(killSig, os.Interrupt, syscall.SIGTERM)

	srv := &http.Server{
		Addr:     addr,
		Handler:  router,
		ErrorLog: serverLog, // maybe use default logger here too idk
	}

	go func() {
		err := srv.ListenAndServe()

		if errors.Is(err, http.ErrServerClosed) {
			slog.Info("Server shutdown complete")
		} else if err != nil {
			slog.Error("Server error", slog.Any("err", err))
			os.Exit(1)
		}
	}()

	slog.Info("Server started", slog.String("host", host), slog.String("port", port), slog.String("env", env))
	<-killSig

	slog.Info("Shutting down server")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		slog.Error("Server shutdown failed", slog.Any("err", err))
		os.Exit(1)
	}

	slog.Info("Server shutdown complete")
}
