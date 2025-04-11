package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"time"

	"github.com/joho/godotenv"
)

var AccessToken = ""

type ZohoAuthResponse struct {
	AccessToken string        `json:"access_token"`
	Scope       string        `json:"scope"`
	ApiDomain   string        `json:"api_domain"`
	TokenType   string        `json:"token_type"`
	ExpiresIn   time.Duration `json:"expires_in"`
}

func GenerateCredentials(scope string) (ZohoAuthResponse, error) {
	accountServer := "https://accounts.zoho.com"
	uri := fmt.Sprintf("%s/oauth/v2/token", accountServer)

	clientID := os.Getenv("ZOHO_CLIENT_ID")
	clientSecret := os.Getenv("ZOHO_CLIENT_SECRET")

	crmZsoid := os.Getenv("ZOHO_CRM_ZSOID")
	campaignsZsoid := os.Getenv("ZOHO_CRM_ZSOID")

	crm := fmt.Sprintf("ZohoCRM.%s", crmZsoid)
	campaigns := fmt.Sprintf("ZohoCampaigns.%s", campaignsZsoid)

	soid := fmt.Sprintf("%s,%s", crm, campaigns)

	req, err := http.NewRequest("POST", uri, nil)
	if err != nil {
		slog.Error(err.Error())
		return ZohoAuthResponse{}, err
	}

	req.URL.RawQuery = url.Values{
		"client_id":     {clientID},
		"client_secret": {clientSecret},
		"grant_type":    {"client_credentials"},
		"scope":         {scope},
		"soid":          {soid},
	}.Encode()

	client := &http.Client{}

	resp, err := client.Do(req)
	if err != nil {
		slog.Error(err.Error())
		return ZohoAuthResponse{}, err
	}

	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		slog.Error(err.Error())
		return ZohoAuthResponse{}, err
	}

	var r ZohoAuthResponse
	err = json.Unmarshal(body, &r)
	if err != nil {
		slog.Error(err.Error())
		return ZohoAuthResponse{}, err
	}

	return r, nil
}

func main() {
	h := slog.NewJSONHandler(os.Stdout, nil)
	logger := slog.New(h)
	slog.SetLogLoggerLevel(slog.LevelDebug)
	slog.SetDefault(logger)

	err := godotenv.Load()
	if err != nil {
		slog.Error(fmt.Sprintf("Error loading .env file: %v", err))
	}

	crm := "ZohoCRM.modules.leads.ALL"
	settings := "ZohoCRM.settings.ALL"
	campaigns := "ZohoCampaigns.contact.ALL"

	scope := fmt.Sprintf("%s,%s,%s", crm, campaigns, settings)

	for {
		resp, err := GenerateCredentials(scope)
		if err != nil {
			slog.Error(err.Error())
		}

		AccessToken = resp.AccessToken
		expirary := time.Now().Add(resp.ExpiresIn * time.Second)

		slog.Info(fmt.Sprintf("Your new access token is: %s Expires at: %s", AccessToken, expirary))
		time.Sleep(resp.ExpiresIn * time.Second)
		slog.Debug("Access Token has expired")
	}
}
