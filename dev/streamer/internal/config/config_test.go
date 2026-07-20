package config_test

import (
	"testing"

	"github.com/quickchat/streamer/internal/config"
)

func TestLoad(t *testing.T) {
	tests := []struct {
		name    string
		env     map[string]string
		want    config.Config
		wantErr bool
	}{
		{
			name:    "missing VALKEY_ADDR",
			env:     map[string]string{},
			wantErr: true,
		},
		{
			name:    "blank VALKEY_ADDR",
			env:     map[string]string{"VALKEY_ADDR": "   "},
			wantErr: true,
		},
		{
			name: "defaults applied with only VALKEY_ADDR",
			env:  map[string]string{"VALKEY_ADDR": "valkey:6379"},
			want: config.Config{
				ValkeyAddr:     "valkey:6379",
				ValkeyPassword: "",
				ValkeyDB:       0,
				HTTPAddr:       ":8080",
			},
		},
		{
			name: "all values set",
			env: map[string]string{
				"VALKEY_ADDR":     "10.0.0.5:6379",
				"VALKEY_PASSWORD": "secret",
				"VALKEY_DB":       "3",
				"STREAMER_ADDR":   ":9090",
			},
			want: config.Config{
				ValkeyAddr:     "10.0.0.5:6379",
				ValkeyPassword: "secret",
				ValkeyDB:       3,
				HTTPAddr:       ":9090",
			},
		},
		{
			name:    "non-integer VALKEY_DB",
			env:     map[string]string{"VALKEY_ADDR": "valkey:6379", "VALKEY_DB": "abc"},
			wantErr: true,
		},
		{
			name:    "negative VALKEY_DB",
			env:     map[string]string{"VALKEY_ADDR": "valkey:6379", "VALKEY_DB": "-1"},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Clear the variables this test cares about, then set the case's values.
			for _, k := range []string{"VALKEY_ADDR", "VALKEY_PASSWORD", "VALKEY_DB", "STREAMER_ADDR"} {
				t.Setenv(k, "")
			}
			for k, v := range tt.env {
				t.Setenv(k, v)
			}

			got, err := config.Load()
			if tt.wantErr {
				if err == nil {
					t.Fatalf("Load() expected error, got nil")
				}
				return
			}
			if err != nil {
				t.Fatalf("Load() unexpected error: %v", err)
			}
			if got != tt.want {
				t.Fatalf("Load() = %+v, want %+v", got, tt.want)
			}
		})
	}
}
