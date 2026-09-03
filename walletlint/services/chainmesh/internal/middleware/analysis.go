package analysis

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/your-org/walletlint/services/chainmesh/internal/cache"
	"github.com/your-org/walletlint/services/chainmesh/internal/storage"
)

func Middleware(store *storage.Store, cache *cache.Client) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Method != http.MethodPost {
				next.ServeHTTP(w, r)
				return
			}

			body, err := io.ReadAll(r.Body)
			if err != nil {
				next.ServeHTTP(w, r)
				return
			}
			r.Body = io.NopCloser(bytes.NewBuffer(body))

			var req rpcRequest
			if err := json.Unmarshal(body, &req); err == nil {
				if isTransactionMethod(req.Method) {
					go analyzeTransaction(r.Context(), req, store, cache)
				}
			}

			next.ServeHTTP(w, r)
		})
	}
}

type rpcRequest struct {
	JSONRPC string          `json:"jsonrpc"`
	Method  string          `json:"method"`
	Params  json.RawMessage `json:"params"`
	ID      interface{}     `json:"id"`
}

func isTransactionMethod(method string) bool {
	return method == "eth_sendRawTransaction" ||
		method == "eth_sendTransaction" ||
		method == "sendTransaction" ||
		method == "sendRawTransaction"
}

func analyzeTransaction(ctx context.Context, req rpcRequest, store *storage.Store, cache *cache.Client) {
	tenantID := "default"
	txHash := extractTxHash(req.Params)

	if cache.Has(ctx, txHash) {
		return
	}

	finding := storage.Finding{
		TenantID:  tenantID,
		TxHash:    txHash,
		RuleID:    "pending-analysis",
		Severity:  "INFO",
		Message:   "Transaction queued for WalletLint analysis",
		CreatedAt: time.Now().UTC(),
	}

	_ = store.SaveFinding(ctx, finding)
	_ = cache.Set(ctx, txHash, "analyzed", 24*time.Hour)
}

func extractTxHash(params json.RawMessage) string {
	var p []string
	if err := json.Unmarshal(params, &p); err == nil && len(p) > 0 {
		return strings.ToLower(p[0])
	}
	return "unknown"
}