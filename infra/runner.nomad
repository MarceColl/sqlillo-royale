job "runner" {
  datacenters = ["dc1"]
  type = "batch"

  periodic {
    cron		     = "0 */30 * * * * *"
	prohibit_overlap = true
  }

  group "runner" {
    task "runner" {
      driver = "podman"

      config {
        image = "registry.digitalocean.com/dziban/runner:latest"
		force_pull = true

		  auth {
			username = "dop_v1_f52f933c8c9724ea38c6505bddc0c8245a0ba4eb0b3c9ff2891f4e432c179ef9"
			password = "dop_v1_f52f933c8c9724ea38c6505bddc0c8245a0ba4eb0b3c9ff2891f4e432c179ef9"
		  }
      }

      resources {
        cores = 10
        memory = 2048 # MB
      }
    }
  }
}
