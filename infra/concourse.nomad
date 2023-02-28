job "concourse"{
	datacenters = ["dc1"]
	type = "service"

	group "concourse" {
		count = 1

		volume "postgres_concourse" {
			type = "host"
			read_only = false
			source = "postgres_concourse"
		}

		task "web" {
			driver = "docker"

			env = {
				CONCOURSE_ADD_LOCAL_USER = "admin:1234asdf1234"
				CONCOURSE_MAIN_TEAM_LOCAL_USER = "admin"
				CONCOURSE_EXTERNAL_URL = "http://100.98.149.54:8080/"
			}

			template {
				data = <<EOF
{{- range nomadService "postgres-concourse" }}
CONCOURSE_POSTGRES_HOST={{ .Address }}
CONCOURSE_POSTGRES_PORT={{ .Port }}
{{- end }}
{{- with nomadVar "nomad/jobs/concourse" }}
CONCOURSE_POSTGRES_DATABASE={{- .dbname }}
CONCOURSE_POSTGRES_USER={{- .dbuser }}
CONCOURSE_POSTGRES_PASSWORD={{ .dbpassword }}
{{- end }}
EOF
				destination = "file.env"
				env = true
			}

			config {
				image = "registry.digitalocean.com/dziban/concourse-web:latest"
				force_pull = true

				auth {
				  username = "dop_v1_f52f933c8c9724ea38c6505bddc0c8245a0ba4eb0b3c9ff2891f4e432c179ef9"
				  password = "dop_v1_f52f933c8c9724ea38c6505bddc0c8245a0ba4eb0b3c9ff2891f4e432c179ef9"
				}

				ports = ["ui"]
			}

			service {
				name = "concourse"
				provider = "nomad"
				port = "ui"

				check {
					type = "http"
					name = "concourse-web-probe"
					path = "/"
					interval = "10s"
					timeout = "1s"
				}
			}

			service {
				name = "concourse-ssh"
				provider = "nomad"
				port = "tsa"
			}

			resources {
				cpu = 500
				memory = 1024
			}
		}

		task "postgres" {
			driver = "docker"

			volume_mount {
				volume = "postgres_concourse"
				destination = "/var/lib/postgresql/data"
				read_only = false
			}

			config {
				image = "postgres:14.7"
				ports = ["db"]
			}

			resources {
				cpu = 500
				memory = 1024
			}

			service {
				name = "postgres-concourse"
				provider = "nomad"
				port = "db"
			}

			template {
				data = <<EOF
{{- with nomadVar "nomad/jobs/concourse" }}
POSTGRES_DB={{- .dbname }}
POSTGRES_USER={{- .dbuser }}
POSTGRES_PASSWORD={{ .dbpassword }}
{{- end }}
EOF
				destination = "file.env"
				env = true
			}

			env = {
				PGDATA="/var/lib/postgresql/data"
			}
		}

		network {
			mode = "bridge"

			port "db" {
				to = 5432
			}

			port "ui" {
				static = 8080
				to = 8080
			}

			port "tsa" {
				static = "2222"
				to = "2222"
			}
		}
	}

	group "concourse-worker" {
		count = 2

		task "worker" {
			driver = "docker"

			config {
				image = "registry.digitalocean.com/dziban/concourse-worker:latest"
				force_pull = true

				ports = ["bc"]

				auth {
				  username = "dop_v1_f52f933c8c9724ea38c6505bddc0c8245a0ba4eb0b3c9ff2891f4e432c179ef9"
				  password = "dop_v1_f52f933c8c9724ea38c6505bddc0c8245a0ba4eb0b3c9ff2891f4e432c179ef9"
				}

				privileged = true
			}

			template {
				data = <<EOF
{{- range nomadService "concourse-ssh" }}
CONCOURSE_TSA_HOST={{- .Address -}}:{{- .Port }}
{{- end }}
EOF
				destination = "file.env"
				env = true
			}

			env = {
				CONCOURSE_WORK_DIR = "/opt/concourse/worker"
				CONCOURSE_BAGGAGECLAIM_BIND_IP = "0.0.0.0"
				CONCOURSE_RUNTIME = "containerd"
				CONCOURSE_WORK_DIR = "/worker-state"
				CONCOURSE_WORKER_WORK_DIR = "/worker-state"
				CONCOURSE_BAGGAGECLAIM_DRIVER = "overlay"
			}

			service {
				name = "concourse-worker"
				provider = "nomad"
				port = "bc"

			}

			service {
				name = "concourse-worker-healthcheck"
				provider = "nomad"
				port = "healthcheck"

				check {
					name = "worker-probe"
					type = "http"
					path = "/"
					interval = "10s"
					timeout = "1s"
				}
			}

			resources {
				cpu = 1000
				memory = 1024
			}
		}

		network {
			mode = "bridge"

			port "bc" {
				to = "7788"
			}

			port "healthcheck" {
				to = "8888"
			}
		}
	}
}

