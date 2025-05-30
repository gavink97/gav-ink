package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/gavink97/gav-ink/internal/components"
	"github.com/gavink97/gav-ink/internal/layouts"
	"github.com/gavink97/gav-ink/internal/views"
	z "github.com/gavink97/gav-ink/internal/zoho"
)

type ContactHandLer struct {
}

type InsertRequest struct {
	Data []*ContactForm `json:"data"`
}

type ContactForm struct {
	Source string `json:"Lead_Source"`
	Name   string `json:"Last_Name"`
	Email  string `json:"Email"`
	About  string `json:"Project_Details"`
	Budget string `json:"Project_Budget"`
}

type ContactFormParams struct {
	Name   string
	Email  string
	About  string
	Budget string
}

func NewContact(params ContactFormParams) *ContactForm {
	return &ContactForm{
		Source: "gav-ink",
		Name:   params.Name,
		Email:  params.Email,
		About:  params.About,
		Budget: params.Budget,
	}
}

func NewContactHandler() *ContactHandLer {
	return &ContactHandLer{}
}

func crmInsertLead(data []byte) error {
	crm := "https://www.zohoapis.com"
	uri := fmt.Sprintf("%s/crm/v7/Leads", crm)

	reqBody := bytes.NewReader(data)
	req, err := http.NewRequest("POST", uri, reqBody)
	if err != nil {
		slog.Error(err.Error())
		return err
	}

	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Add("Authorization", fmt.Sprintf("Zoho-oauthtoken %s", z.AccessToken))

	client := &http.Client{}

	resp, err := client.Do(req)
	if err != nil {
		slog.Error(err.Error())
		return err
	}

	defer func() {
		err := resp.Body.Close()

		if err != nil {
			slog.Error(err.Error())
		}
	}()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		slog.Error(err.Error())
		return err
	}

	fmt.Println(string(respBody))

	return nil
}

func (h *ContactHandLer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		getContact(w, r)
		return

	case http.MethodPost:
		postContact(w, r)
		return

	default:
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

}

func getContact(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	component := r.URL.Query().Get("component")
	if component != "" {
		cbool, err := strconv.ParseBool(component)
		if err != nil {
			c := views.Contact2()
			err := layouts.Layout(c, "Contact Us").Render(r.Context(), w)
			if err != nil {
				http.Error(w, "Error rendering template", http.StatusInternalServerError)
				return
			}
			return
		}

		if cbool {
			err := views.Contact2().Render(r.Context(), w)
			if err != nil {
				http.Error(w, "Error rendering template", http.StatusInternalServerError)
				return
			}

			return
		}
	}

	c := views.Contact2()
	err := layouts.Layout(c, "Contact Us").Render(r.Context(), w)
	if err != nil {
		http.Error(w, "Error rendering template", http.StatusInternalServerError)
		return
	}
}

func postContact(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	err := r.ParseForm()
	if err != nil {
		slog.Error(err.Error())
		http.Error(w, "An internal server error occured", http.StatusInternalServerError)
		return
	}

	fields := map[string]string{
		"name":            r.PostFormValue("name"),
		"email":           r.PostFormValue("email"),
		"project details": r.PostFormValue("about"),
		"budget":          r.PostFormValue("budget"),
	}

	var missingFields []string
	for fieldName, value := range fields {
		if value == "" {
			missingFields = append(missingFields, fieldName)
		}
	}

	if len(missingFields) > 0 {
		w.WriteHeader(http.StatusAccepted)
		c := views.ContactUnsuccessful(missingFields[0])
		if err = c.Render(r.Context(), w); err != nil {
			http.Error(w, "Failed to render content", http.StatusInternalServerError)
		}

		return
	}

	contact := NewContact(ContactFormParams{
		Name:   fields["name"],
		Email:  fields["email"],
		About:  fields["project details"],
		Budget: fields["budget"],
	})

	contactreq := InsertRequest{
		Data: []*ContactForm{contact},
	}

	data, err := json.Marshal(contactreq)
	if err != nil {
		slog.Error("JSON marshal error", "error", err)
		http.Error(w, "An internal server error occured", http.StatusInternalServerError)
		return
	}

	err = crmInsertLead(data)
	if err != nil {
		c := components.SubscribeError()
		if err = c.Render(r.Context(), w); err != nil {
			http.Error(w, "An internal server error occured", http.StatusInternalServerError)
		}

		return
	}

	w.WriteHeader(http.StatusAccepted)
	c := views.ContactSuccess()
	if err = c.Render(r.Context(), w); err != nil {
		http.Error(w, "Failed to render content", http.StatusInternalServerError)
	}
}
