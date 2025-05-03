package routes

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/didip/tollbooth/v8"
	"github.com/didip/tollbooth/v8/limiter"
	h "github.com/gavink97/gav-ink/internal/handlers"
	"github.com/gavink97/gav-ink/internal/hash/passwordhash"
	"github.com/gavink97/gav-ink/internal/middleware"
	m "github.com/gavink97/gav-ink/internal/middleware"
	"github.com/gavink97/gav-ink/internal/store/db"
	"github.com/gavink97/gav-ink/internal/store/dbstore"
	"github.com/justinas/alice"
	"github.com/patrickmn/go-cache"
)

func newRouter() http.Handler {
	mux := http.NewServeMux()

	databaseName := os.Getenv("DATABASE_NAME")
	db := db.MustOpen(databaseName)
	passwordhash := passwordhash.NewHPasswordHash()

	userStore := dbstore.NewUserStore(
		dbstore.NewUserStoreParams{
			DB:           db,
			PasswordHash: passwordhash,
		})

	cache := cache.New(10*time.Minute, 20*time.Minute)

	lmt := tollbooth.NewLimiter(2, &limiter.ExpirableOptions{DefaultExpirationTTL: time.Hour})

	lmt.SetIPLookup(limiter.IPLookup{
		Name:           "RemoteAddr",
		IndexFromRight: 0,
	})

	lmt.SetMessage("You have reached maximum request limit.")

	lmt.SetMessageContentType("text/plain; charset=utf-8")

	lmt.SetOnLimitReached(func(w http.ResponseWriter, r *http.Request) {
		slog.Warn(fmt.Sprintf("A request was rejected by the server from remote address: %s", r.RemoteAddr))
	})

	middleware := m.NewMiddlewareHandler(m.MiddlewareParams{
		Cache:        *cache,
		CacheVersion: middleware.GenerateRandomString(12),
		Limiter:      lmt,
	})

	pkg, err := os.ReadFile("./package.json")
	if err != nil {
		slog.Error(err.Error())
	}

	var payload map[string]string
	err = json.Unmarshal(pkg, &payload)
	if err != nil {
		slog.Error(err.Error())
	}

	verString := payload["version"]

	publicFiles := http.FileServer(http.Dir("./dist"))
	mux.Handle("/public/", http.StripPrefix("/public/",
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if strings.Contains(r.Header.Get("Accept-Encoding"), "br") {
				if strings.HasSuffix(r.URL.Path, ".js") {
					r.URL.Path += ".br"
					w.Header().Set("Content-Encoding", "br")
					w.Header().Set("Content-Type", "application/javascript")
				} else if strings.HasSuffix(r.URL.Path, ".css") {
					r.URL.Path += ".br"
					w.Header().Set("Content-Encoding", "br")
					w.Header().Set("Content-Type", "text/css")
				}
			} else if strings.Contains(r.Header.Get("Accept-Encoding"), "gzip") {
				if strings.HasSuffix(r.URL.Path, ".js") {
					r.URL.Path += ".gz"
					w.Header().Set("Content-Encoding", "gzip")
					w.Header().Set("Content-Type", "application/javascript")
				} else if strings.HasSuffix(r.URL.Path, ".css") {
					r.URL.Path += ".gz"
					w.Header().Set("Content-Encoding", "gzip")
					w.Header().Set("Content-Type", "text/css")
				}
			}

			for _, suffix := range []string{".gz", ".br"} {
				if strings.HasSuffix(r.URL.Path, suffix) {
					splts := strings.SplitAfter(r.URL.Path, ".")
					r.URL.Path = fmt.Sprintf("%s%s.%v", splts[0], verString, strings.Join(splts[1:], ""))
				}
			}

			w.Header().Set("Cache-Control", "public, max-age=604800, immutable")
			publicFiles.ServeHTTP(w, r)
		})))

	authChain := alice.New(
		loggingMiddleware(),
		middleware.RemoveTrailingSlash,
		middleware.Caching,
		middleware.Limiting,
		middleware.ContentTypeHTML,
		//middleware.CSP,
	)

	if os.Getenv("env") == "dev" {
		mux.Handle("GET /test", authChain.Then(http.HandlerFunc(h.NewTestHandler().ServeHTTP)))
	}

	mux.Handle("GET /contact", authChain.Then(http.HandlerFunc(h.NewContactHandler().ServeHTTP)))

	mux.Handle("POST /contact", authChain.Then(http.HandlerFunc(h.NewContactHandler().ServeHTTP)))

	mux.Handle("GET /component/burger-modal", authChain.Then(http.HandlerFunc(h.NewComponentHandler().GetBurgerModal)))

	mux.Handle("GET /component/open-source-table", authChain.Then(http.HandlerFunc(h.NewComponentHandler().GetOpenSourceTable)))

	mux.Handle("POST /subscribe", authChain.Then(http.HandlerFunc(h.NewSubscribeHandler(h.SubscribeHandlerParams{
		UserStore: userStore,
	}).PostSubscribeUser)))

	mux.Handle("GET /studies/", authChain.Then(http.HandlerFunc(h.NewStudyHandler().ServeHTTP)))

	mux.Handle("GET /studies", authChain.Then(http.HandlerFunc(h.NewStudyHandler().ServeHTTP)))

	mux.Handle("/", authChain.Then(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			notFound := h.NewNotFoundHandler()
			notFound.ServeHTTP(w, r)
			return
		}
		h.NewHomeHandler().ServeHTTP(w, r)
	})))

	return mux
}
