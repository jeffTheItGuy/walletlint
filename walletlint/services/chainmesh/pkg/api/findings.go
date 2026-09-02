package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/your-org/walletlint/services/chainmesh/internal/storage"
)

func FindingsRoutes(store *storage.Store) chi.Router {
	r := chi.NewRouter()

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		tenantID := r.URL.Query().Get("tenant")
		if tenantID == "" {
			tenantID = "default"
		}

		limitStr := r.URL.Query().Get("limit")
		limit := 50
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}

		findings, err := store.GetFindingsByTenant(r.Context(), tenantID, limit)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(findings)
	})

	r.Get("/{txHash}", func(w http.ResponseWriter, r *http.Request) {
		txHash := chi.URLParam(r, "txHash")

		findings, err := store.GetFindingsByTx(r.Context(), txHash)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(findings)
	})

	return r
}

func ProxyUpstream(upstreamURL string) http.HandlerFunc {
	if upstreamURL == "" {
		upstreamURL = "https://eth.llamarpc.com"
	}

	return func(w http.ResponseWriter, r *http.Request) {
		// TODO: implement reverse proxy to upstream RPC
		// For now, return a placeholder
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"jsonrpc":"2.0","result":null,"id":1}`))
	}
}
