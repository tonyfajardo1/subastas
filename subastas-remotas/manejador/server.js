const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

let auctions = [
    { id: 1, title: "The Mona Lisa", artist: "Leonardo da Vinci", year: 1503, price: 200000000, minIncrement: 1000000, duration: 60, active: false, bids: [] },
    { id: 2, title: "The Dance Class", artist: "Edgar Degas", year: 1874, price: 10000000, minIncrement: 500000, duration: 60, active: false, bids: [] }
];
let activeAuctionIndex = 0;

// WebSocket para notificar cambios en las subastas
dispatchUpdate = () => {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "update", auctions }));
        }
    });
};

app.post('/start-auction', (req, res) => {
    if (activeAuctionIndex < auctions.length) {
        auctions[activeAuctionIndex].active = true;
        dispatchUpdate();
        setTimeout(() => {
            auctions[activeAuctionIndex].active = false;
            activeAuctionIndex++;
            dispatchUpdate();
        }, auctions[activeAuctionIndex].duration * 1000);
        res.json({ message: "Subasta iniciada" });
    } else {
        res.status(400).json({ message: "No hay más subastas" });
    }
});

server.listen(8080, () => console.log('Manejador de subastas en 8080'));