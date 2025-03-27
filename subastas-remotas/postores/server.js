const http = require('http');
const express = require('express');
const cors = require('cors');
const appBidders = express();
const httpServer = http.createServer(appBidders);
const WebSocket = require('ws');
const wssBidders = new WebSocket.Server({ server: httpServer });

// Variable para determinar si la configuración de las subastas está definida
let auctionsConfigured = false;
let auctions = [];

// Función simulada para establecer la configuración de las subastas.
// En un escenario real, esta configuración vendría del servicio del manejador.

appBidders.use(cors());
appBidders.use(express.json());

// Endpoint para obtener las subastas.
// Si la configuración aún no está definida, se notifica al postor que intente más tarde.
appBidders.get('/auctions', (req, res) => {
  if (!auctionsConfigured) {
    return res.status(400).json({ message: "La configuración de subastas aún no está disponible. Por favor, inténtelo más tarde." });
  }
  res.json(auctions);
});

// Endpoint para realizar una oferta.
// Se verifica primero si la configuración está definida.
appBidders.post('/bid', (req, res) => {
  if (!auctionsConfigured) {
    return res.status(400).json({ message: "La configuración de subastas aún no está disponible. Por favor, inténtelo más tarde." });
  }
  const { auctionId, bidder, amount } = req.body;
  const auction = auctions.find(a => a.id === auctionId);
  if (!auction || !auction.active) {
    return res.status(400).json({ message: "Subasta no activa" });
  }
  if (amount < auction.price + auction.minIncrement) {
    return res.status(400).json({ message: "Oferta demasiado baja" });
  }
  auction.price = amount;
  auction.bids.push({ bidder, amount });
  dispatchUpdate();
  res.json({ message: "Oferta registrada" });
});

// Función para enviar actualizaciones en tiempo real a través de WebSockets.
function dispatchUpdate() {
  const update = JSON.stringify(auctions);
  wssBidders.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(update);
    }
  });
}

// Inicia el servidor en el puerto 8081
httpServer.listen(8081, () => console.log('Servicio de postores en 8081'));