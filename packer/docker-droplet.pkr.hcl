packer {
  required_plugins {
    digitalocean = {
      version = ">= 1.0.0"
      source  = "github.com/hashicorp/digitalocean"
    }
  }
}

source "digitalocean" "docker_droplet" {
  api_token     = var.do_token
  image         = var.do_image
  region        = var.do_region
  size          = var.do_size
  ssh_username  = var.ssh_username
  droplet_name  = var.droplet_name
  snapshot_name = "${var.droplet_name}-snapshot-${formatdate("YYYYMMDD-hhmm", timestamp())}"
}

build {
  name = "docker-droplet"
  sources = ["source.digitalocean.docker_droplet"]

  provisioner "shell" {
    environment_vars = ["DEBIAN_FRONTEND=noninteractive"]
    inline = [
      # Wait for and clear any stuck apt/dpkg locks
      "for i in {1..30}; do if ! fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1; then break; fi; echo 'Waiting for dpkg lock release...'; sleep 2; done",
      "if fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1; then echo 'Force clearing stuck lock...'; kill -9 $(fuser /var/lib/dpkg/lock-frontend 2>/dev/null) || true; rm -f /var/lib/dpkg/lock-frontend; dpkg --configure -a; fi",
      # Disable command-not-found to prevent database update errors
      "apt-get remove -y --purge command-not-found || true",
      "rm -f /etc/apt/apt.conf.d/*command-not-found*",
      # Clean apt cache to avoid stale lists
      "apt-get clean",
      "rm -rf /var/lib/apt/lists/*",
      "apt-get update -y",
      "apt-get upgrade -y",
      "apt-get install -y apt-transport-https ca-certificates curl gnupg",
      "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg",
      "echo \"deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable\" > /etc/apt/sources.list.d/docker.list",
      "apt-get update -y",
      "apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin",
      "systemctl enable --now docker",
      "usermod -aG docker ${var.ssh_username}",
      "mkdir -p /etc/docker",
      "echo '{\"log-driver\":\"json-file\",\"log-opts\":{\"max-size\":\"10m\",\"max-file\":\"3\"}}' > /etc/docker/daemon.json",
      "systemctl restart docker",
      "ufw allow ssh && ufw allow 80/tcp && ufw allow 443/tcp && ufw --force enable",
      "mkdir -p /opt/ticketflow && chown ${var.ssh_username}:${var.ssh_username} /opt/ticketflow",
      "apt-get autoremove -y && apt-get autoclean",
      "docker run --rm hello-world"
    ]
  }
}