package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"time"

	c "github.com/gavink97/gav-ink/internal/components"
	"github.com/gavink97/gav-ink/internal/store"
	z "github.com/gavink97/gav-ink/internal/zoho"
)

type SubscribeHandler struct {
	userStore store.UserStore
}

type SubscribeHandlerParams struct {
	UserStore store.UserStore
}

func NewSubscribeHandler(params SubscribeHandlerParams) *SubscribeHandler {
	return &SubscribeHandler{
		userStore: params.UserStore,
	}
}

type ZohoResponse struct {
	Message string `json:"message"`
	Status  string `json:"status"`
	Code    string `json:"Code"`
	URI     string `json:"URI"`
	Version string `json:"version"`
}

type SubscribeParams struct {
	AccessToken string
	ListKey     string
	Resfmt      string
	ContactInfo string
	Source      string
	TopicID     string
	Status      string
}

func (p *SubscribeParams) CampaignsSubscribeRequest() error {
	campaignServer := "https://campaigns.zoho.com"
	uri := fmt.Sprintf("%s/api/v1.1/json/listsubscribe", campaignServer)

	req, err := http.NewRequest("POST", uri, nil)
	if err != nil {
		slog.Error(err.Error())
		return err
	}

	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Add("Authorization", fmt.Sprintf("Zoho-oauthtoken %s", p.AccessToken))

	req.URL.RawQuery = url.Values{
		"resfmt":      {p.Resfmt},
		"listkey":     {p.ListKey},
		"contactinfo": {p.ContactInfo},
		"source":      {p.Source},
	}.Encode()

	tr := &http.Transport{
		MaxIdleConns:       10,
		IdleConnTimeout:    10 * time.Second,
		DisableCompression: true,
	}

	client := &http.Client{Transport: tr}

	resp, err := client.Do(req)
	if err != nil {
		slog.Error(err.Error())
		return err
	}

	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		slog.Error(err.Error())
		return err
	}

	var r ZohoResponse
	err = json.Unmarshal(body, &r)
	if err != nil {
		slog.Error(err.Error())
		return err
	}

	if r.Code == "0" || r.Code == "200" {
		slog.Debug(string(r.Message))
		return nil
	}

	// throw an error if user is already subscribed

	err = errors.New(r.Code)
	return err
}

func (h *SubscribeHandler) PostSubscribeUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	email := r.FormValue("email")
	contactInfo := fmt.Sprintf(`{"Contact Email": %s}`, email)
	listKey := os.Getenv("ZOHO_CAMPAIGNS_LIST_KEY")

	s := SubscribeParams{
		AccessToken: z.AccessToken,
		ListKey:     listKey,
		Resfmt:      "JSON",
		ContactInfo: contactInfo,
		Source:      "website",
		TopicID:     "",
	}

	_, err := h.userStore.GetUser(email)
	if err != nil {
		err = s.CampaignsSubscribeRequest()
		if err != nil {
			slog.Error(err.Error())

			w.WriteHeader(http.StatusAccepted)
			c := c.SubscribeError()
			if err := c.Render(r.Context(), w); err != nil {
				http.Error(w, "Failed to render content", http.StatusInternalServerError)
			}
			return
		}

		err := h.userStore.CreateUser(email)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			c := c.SubscribeError()
			if err := c.Render(r.Context(), w); err != nil {
				http.Error(w, "Failed to render content", http.StatusInternalServerError)
			}
			return
		}
	} else {
		c := c.SubscribeExists()
		err = c.Render(r.Context(), w)
		if err != nil {
			http.Error(w, "error rendering template", http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusAccepted)
	c := c.SubscribeSuccess()
	if err := c.Render(r.Context(), w); err != nil {
		http.Error(w, "Failed to render content", http.StatusInternalServerError)
	}
}

// workflow:
// insert entities into zoho crm
// zoho syncs with campaigns
// campaigns adds entity to active list

// syncs userList with local database
// UnsubscribeUser
