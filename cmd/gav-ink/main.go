package main

import (
	"flag"
	"log"
	"os"

	"github.com/gavink97/gav-ink/internal/github"
	"github.com/gavink97/gav-ink/internal/globals"
	"github.com/gavink97/gav-ink/internal/routes"
	"github.com/gavink97/gav-ink/internal/studies"
	"github.com/gavink97/gav-ink/internal/utils"
	"github.com/gavink97/gav-ink/internal/zoho"
	"github.com/joho/godotenv"
)

func main() {
	flag.BoolVar(&globals.AirplaneMode, "airplane", false, "Disables use of external APIs")
	verbosePtr := flag.Bool("verbose", false, "Verbose output")
	versionPtr := flag.Bool("version", false, "Prints version")
	flag.BoolVar(&globals.WebGLMode, "webgl", false, "Enables WebGL")

	flag.Parse()

	if *versionPtr {
		log.Default().Printf("Version: %s", utils.PrintVersion())
		os.Exit(0)
	}

	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	if *verbosePtr {
		log.Default().Print("Verbose Output Enabled")
	}

	utils.SetDefaultLogger(*verbosePtr)

	if !globals.AirplaneMode {
		zoho.RotatingAccessToken()
		github.OpenSourceStats()
	}

	utils.LoadDesignToken()

	studies.GetPosts()
	routes.Serve()
}
