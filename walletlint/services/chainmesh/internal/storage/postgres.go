package storage

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Finding struct {
	ID        int64     `json:"id"`
	TenantID  string    `json:"tenant_id"`
	TxHash    string    `json:"tx_hash"`
	RuleID    string    `json:"rule_id"`
	Severity  string    `json:"severity"`
	Message   string    `json:"message"`
	Metadata  []byte    `json:"metadata,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

type Store struct {
	pool *pgxpool.Pool
}

func New(ctx context.Context, connString string) (*Store, error) {
	pool, err := pgxpool.New(ctx, connString)
	if err != nil {
		return nil, fmt.Errorf("pgxpool.New: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("ping: %w", err)
	}

	s := &Store{pool: pool}
	if err := s.migrate(ctx); err != nil {
		return nil, fmt.Errorf("migrate: %w", err)
	}

	return s, nil
}

func (s *Store) Close() {
	s.pool.Close()
}

func (s *Store) migrate(ctx context.Context) error {
	_, err := s.pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS findings (
			id SERIAL PRIMARY KEY,
			tenant_id TEXT NOT NULL,
			tx_hash TEXT NOT NULL,
			rule_id TEXT NOT NULL,
			severity TEXT NOT NULL,
			message TEXT NOT NULL,
			metadata JSONB,
			created_at TIMESTAMPTZ DEFAULT NOW()
		);
		CREATE INDEX IF NOT EXISTS idx_findings_tenant ON findings(tenant_id);
		CREATE INDEX IF NOT EXISTS idx_findings_tx ON findings(tx_hash);
	`)
	return err
}

func (s *Store) SaveFinding(ctx context.Context, f Finding) error {
	_, err := s.pool.Exec(ctx, `
		INSERT INTO findings (tenant_id, tx_hash, rule_id, severity, message, metadata, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, f.TenantID, f.TxHash, f.RuleID, f.Severity, f.Message, f.Metadata, f.CreatedAt)
	return err
}

func (s *Store) GetFindingsByTenant(ctx context.Context, tenantID string, limit int) ([]Finding, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT id, tenant_id, tx_hash, rule_id, severity, message, metadata, created_at
		FROM findings
		WHERE tenant_id = $1
		ORDER BY created_at DESC
		LIMIT $2
	`, tenantID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return pgx.CollectRows(rows, pgx.RowToStructByName[Finding])
}

func (s *Store) GetFindingsByTx(ctx context.Context, txHash string) ([]Finding, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT id, tenant_id, tx_hash, rule_id, severity, message, metadata, created_at
		FROM findings
		WHERE tx_hash = $1
		ORDER BY created_at DESC
	`, txHash)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return pgx.CollectRows(rows, pgx.RowToStructByName[Finding])
}
