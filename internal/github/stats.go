package github

import (
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

var Stats []Repository

type Repository struct {
	*GitHubResponse
	Parent       *GitHubResponse `json:"parent"`
	Contribution bool
}

type NewRepositoryParams struct {
	Repo         *GitHubResponse
	Parent       *GitHubResponse
	Contribution bool
}

func NewRepository(params NewRepositoryParams) *Repository {
	return &Repository{
		GitHubResponse: params.Repo,
		Parent:         params.Parent,
		Contribution:   params.Contribution,
	}
}

type GitHubResponse struct {
	Name            string    `json:"name"`
	FullName        string    `json:"full_name"`
	Description     string    `json:"description"`
	Url             string    `json:"html_url"`
	Language        string    `json:"language"`
	Fork            bool      `json:"fork"`
	ForkCount       int       `json:"forks_count"`
	StargazersCount int       `json:"stargazers_count"`
	WatchersCount   int       `json:"watchers_count"`
	OpenIssuesCount int       `json:"open_issues"`
	TimeCreated     time.Time `json:"created_at"`
	TimeLastUpdated time.Time `json:"updated_at"`
}

var Access = ""
var Base = "https://api.github.com"

// return dummy data

func GetGithubRepo(name string) (Repository, error) {
	uri := fmt.Sprintf("%s/repos/%s", Base, name)
	req, err := http.NewRequest("GET", uri, nil)
	if err != nil {
		slog.Error(err.Error())
		return Repository{}, err
	}

	req.Header.Add("Accept", "application/vnd.github+json")
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", Access))
	req.Header.Add("X-GitHub-Api-Version", "2022-11-28")

	client := &http.Client{}

	resp, err := client.Do(req)
	if err != nil {
		slog.Error(err.Error())
		return Repository{}, err
	}

	defer func() {
		err := resp.Body.Close()

		if err != nil {
			slog.Error(err.Error())
		}
	}()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		slog.Error(err.Error())
		return Repository{}, err
	}

	var f Repository
	err = json.Unmarshal(body, &f)
	if err != nil {
		slog.Error(err.Error())
		return Repository{}, err
	}

	return f, nil
}

func GetRepoCollaborators(name string) (bool, error) {
	uri := fmt.Sprintf("%s/repos/%s/contributors", Base, name)
	req, err := http.NewRequest("GET", uri, nil)
	if err != nil {
		slog.Error(err.Error())
		return false, err
	}

	req.Header.Add("Accept", "application/vnd.github+json")
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", Access))
	req.Header.Add("X-GitHub-Api-Version", "2022-11-28")

	req.URL.RawQuery = url.Values{
		"anon":     {"false"},
		"per_page": {"100"},
	}.Encode()

	client := &http.Client{}

	resp, err := client.Do(req)
	if err != nil {
		slog.Error(err.Error())
		return false, err
	}

	defer func() {
		err := resp.Body.Close()

		if err != nil {
			slog.Error(err.Error())
		}
	}()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		slog.Error(err.Error())
		return false, err
	}

	username := os.Getenv("GITHUB_USERNAME")
	contributed := strings.Contains(string(body), username)

	return contributed, nil
}

func GetGithubStats() ([]Repository, error) {
	Access = os.Getenv("GITHUB_ACCESS_TOKEN")

	uri := fmt.Sprintf("%s/user/repos", Base)

	req, err := http.NewRequest("GET", uri, nil)
	if err != nil {
		slog.Error(err.Error())
		return []Repository{}, err
	}

	req.Header.Add("Accept", "application/vnd.github+json")
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", Access))
	req.Header.Add("X-GitHub-Api-Version", "2022-11-28")

	req.URL.RawQuery = url.Values{
		"type": {"public"},
	}.Encode()

	client := &http.Client{}

	resp, err := client.Do(req)
	if err != nil {
		slog.Error(err.Error())
		return []Repository{}, err
	}

	defer func() {
		err := resp.Body.Close()

		if err != nil {
			slog.Error(err.Error())
		}
	}()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		slog.Error(err.Error())
		return []Repository{}, err
	}

	var r []Repository
	err = json.Unmarshal(body, &r)
	if err != nil {
		slog.Error(err.Error())
		return []Repository{}, err
	}

	myRepos := []Repository{}

	for _, repo := range r {
		if !repo.Fork {
			myRepos = append(myRepos, repo)
			continue
		}

		fork, err := GetGithubRepo(repo.FullName)
		if err != nil {
			slog.Error(err.Error())
			return []Repository{}, err
		}

		contributed, err := GetRepoCollaborators(fork.Parent.FullName)
		if err != nil {
			slog.Error(err.Error())
			return []Repository{}, err
		}

		if contributed {
			params := NewRepositoryParams{
				Repo:         repo.GitHubResponse,
				Parent:       fork.Parent,
				Contribution: contributed,
			}

			collab := NewRepository(params)
			myRepos = append(myRepos, *collab)
		}
	}

	return myRepos, nil
}

func GenerateGithubStats() {
	for {
		c := make(chan []Repository)

		go func() {
			resp, err := GetGithubStats()
			if err != nil {
				slog.Error("failed to get GitHub stats", "error", err)
				c <- nil
				return
			}
			c <- resp
		}()

		Stats = <-c

		/*
			out, err := os.Create("github-stats.json")
			if err != nil {
				log.Fatal(err)
			}

			defer out.Close()

			stat, err := json.MarshalIndent(Stats, "", "  ")
			if err != nil {
				log.Fatal(err)
			}
			_, err = out.Write(stat)
			if err != nil {
				log.Fatal(err)
			}
		*/

		slog.Debug("Updated GitHub Stats")

		time.Sleep(6 * time.Hour)
	}
}

func OpenSourceStats() {
	go func() {
		GenerateGithubStats()
	}()
}
