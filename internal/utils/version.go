package utils

import (
	"encoding/json"
	"log"
	"os"
)

func PrintVersion() string {
	version := ""

	packageJson := "package.json"

	_, err := os.Stat(packageJson)
	if err != nil {
		log.Fatal(err)
		return ""
	}

	pkg, err := os.ReadFile(packageJson)
	if err != nil {
		log.Fatal(err)
		return ""
	}

	var result map[string]any
	err = json.Unmarshal([]byte(pkg), &result)
	if err != nil {
		log.Fatal(err)
		return ""
	}

	version = result["version"].(string)

	return version
}
