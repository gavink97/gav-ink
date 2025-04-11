package routes

import (
	"net/http"
	"os"

	h "github.com/gavink97/gav-ink/internal/handlers"
	"github.com/gavink97/gav-ink/internal/hash/passwordhash"
	m "github.com/gavink97/gav-ink/internal/middleware"
	"github.com/gavink97/gav-ink/internal/store/db"
	"github.com/gavink97/gav-ink/internal/store/dbstore"
	"github.com/justinas/alice"
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

	publicFiles := http.FileServer(http.Dir("./dist"))
	mux.Handle("/public/", http.StripPrefix("/public/", publicFiles))

	authChain := alice.New(
		loggingMiddleware(),
		m.RemoveTrailingSlashMiddleware,
		m.Limiter,
		m.TextHTMLMiddleware,
		m.CSPMiddleware,
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
