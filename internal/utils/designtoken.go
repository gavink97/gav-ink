package utils

import (
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"os"

	"github.com/gavink97/gav-ink/internal/globals"
)

func LoadDesignToken() {
	tokenPath := os.Getenv("DESIGN_TOKEN")
	if tokenPath == "" {
		tokenPath = "token.json"
	}

	data, err := os.Open(tokenPath)
	if err != nil {
		slog.Error(fmt.Sprintf("An error occured when opening token path: %s", tokenPath), "Error", err)
		return
	}

	defer func() {
		err := data.Close()

		if err != nil {
			slog.Error(fmt.Sprintf("An error occured when closing token json: %s", tokenPath), "Error", err)
		}
	}()

	token, err := io.ReadAll(data)
	if err != nil {
		slog.Error(fmt.Sprintf("An error occured while reading: %s", tokenPath), "Error", err)
	}

	err = json.Unmarshal(token, &globals.DesignToken)
	if err != nil {
		slog.Error(fmt.Sprintf("An error occured while unmarshalling token: %s", tokenPath), "Error", err)
	}
}
