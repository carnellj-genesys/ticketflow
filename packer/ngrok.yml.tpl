
  authtoken: ${ngrok_auth_token}
tunnels:
  app:
    proto: http
    addr: http://localhost:8080
    hostname: ticketflow.ngrok.io
