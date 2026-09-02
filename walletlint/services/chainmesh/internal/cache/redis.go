package cache

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

type Client struct {
	rdb *redis.Client
}

func New(addr string) *Client {
	rdb := redis.NewClient(&redis.Options{
		Addr: addr,
	})
	return &Client{rdb: rdb}
}

func (c *Client) Has(ctx context.Context, key string) bool {
	val, err := c.rdb.Exists(ctx, key).Result()
	return err == nil && val > 0
}

func (c *Client) Set(ctx context.Context, key string, value string, ttl time.Duration) error {
	return c.rdb.Set(ctx, key, value, ttl).Err()
}

func (c *Client) Get(ctx context.Context, key string) (string, error) {
	return c.rdb.Get(ctx, key).Result()
}
