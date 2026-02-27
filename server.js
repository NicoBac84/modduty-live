const express = require("express");
const WebSocket = require("ws");
const http = require("http");

const app = express();
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = new Set();

// WebSocket connexion dashboard
wss.on("connection", (ws) => {
  console.log("Dashboard connected");
  clients.add(ws);

  ws.on("close", () => {
    clients.delete(ws);
  });
});

// Broadcast vers tous les dashboards connectés
function broadcast(data) {
  const message = JSON.stringify(data);

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

// Endpoint utilisé par ton bot Nexus
app.post("/push", (req, res) => {
  console.log("Incoming push:", req.body);
  broadcast(req.body);
  res.json({ status: "ok" });
});

// Route test
app.get("/", (req, res) => {
  res.send("ModDuty Live WebSocket Server Running");
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});