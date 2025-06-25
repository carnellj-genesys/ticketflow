terraform {
  required_providers {
    genesyscloud = {
      source = "mypurecloud/genesyscloud"
    }
    
    http = {
      source  = "hashicorp/http"
      version = "~> 3.4"
    }
  }
}

provider "genesyscloud" {
    sdk_debug = true
}