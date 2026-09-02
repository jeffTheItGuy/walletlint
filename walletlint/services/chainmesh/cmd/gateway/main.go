package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/your-org/walletlint/services/chainmesh/internal/cache"
	"github.com/your-org/walletlint/services/chainmesh/internal/middleware/analysis"
	"github.com/your-org/walletlint/services/chainmesh/internal/storage"
	"github.com/your-org/walletlint/services/chainmesh/pkg/api"
)

func main() {
	ctx := context.Background()

	// Initialize storage
	pgConn := os.Getenv("DATABASE_URL")
	if pgConn == "" {
		pgConn = "postgres://walletlint:walletlint@localhost:5432/walletlint?sslmode=disable"
	}
	store, err := storage.New(ctx, pgConn)
	if err != nil {
		log.Fatalf("failed to connect to postgres: %v", err)
	}
	defer store.Close()

	// Initialize cache
	redisAddr := os.Getenv("REDIS_URL")
	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}
	cacheClient := cache.New(redisAddr)

	// Setup router
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(30 * time.Second))

	// RPC proxy middleware — intercepts transactions for async analysis
	r.Use(analysis.Middleware(store, cacheClient))

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	})

	// Findings API
	r.Mount("/analysis", api.FindingsRoutes(store))

	// Proxy all other requests upstream
	r.HandleFunc("/*", api.ProxyUpstream(os.Getenv("UPSTREAM_RPC")))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}

	go func() {
		log.Printf("ChainMesh gateway listening on :%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen error: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	shutdownCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("server shutdown failed: %v", err)
	}
	log.Println("server stopped")
}
