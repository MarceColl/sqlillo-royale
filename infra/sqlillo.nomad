job "sqlillo-royale" {
	datacenters = ["dc1"]
	type = "service"

	group "sqlillo-royale" {
		count = 1

		volume "postgres_sqlillo" {
			type = "host"
			read_only = false
			source = "postgres_sqlillo"
		}

		restart {
			attempts = 10
			interval = "10m"
			delay = "25s"
			mode = "delay"
		}

		task "postgres" {
			driver = "podman"

			volume_mount {
				volume = "postgres_sqlillo"
				destination = "/var/lib/postgresql/data"
				read_only = false
			}

			config {
				image = "docker://postgres:14.7"
				ports = ["db"]
			}

			resources {
				cpu = 500
				memory = 1024
			}

			service {
				name = "postgres-sqlillo"
				provider = "nomad"
				port = "db"
			}

			env = {
				POSTGRES_USER="sqlillo"
				POSTGRES_DB="sqlillo"
				POSTGRES_PASSWORD="sqlillo"
				PGDATA="/var/lib/postgresql/data"
			}
		}

		task "web" {
			driver = "podman"

			template {
				data = <<EOF
{{- range nomadService "postgres-sqlillo" }}
DATABASE_URL="postgresql://sqlillo:sqlillo@{{- .Address -}}:{{- .Port -}}/sqlillo
{{- end }}
EOF
				destination = "env/secrets.env"
				env = true
			}

			config {
					image = "registry.digitalocean.com/dziban/sqlillo-server:latest"
					force_pull = true

					  auth {
						username = "dop_v1_f52f933c8c9724ea38c6505bddc0c8245a0ba4eb0b3c9ff2891f4e432c179ef9"
						password = "dop_v1_f52f933c8c9724ea38c6505bddc0c8245a0ba4eb0b3c9ff2891f4e432c179ef9"
					  }
			}
		}

		network {
			mode = "bridge"

			port "db" {
				to = 5432
			}

			port "web" {
				to = 8080
			}
		}
	}
}
