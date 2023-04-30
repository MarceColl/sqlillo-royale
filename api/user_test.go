package main

import (
	"testing"
)

func TestParseToken(t *testing.T) {
	token, err := ParseToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpc3MiOiJzcWxpbGxvIiwiZXhwIjoxNjgyOTgyMjI0fQ.NODqvvRRVw5SCo9fTYLrQEIyETkomqFTGASturvFLOc")

	if err != nil {
		t.Errorf("Error should be nil")
	}

	if token != "test" {
		t.Errorf("Token should be 'test', but %s", token)
	}
}
