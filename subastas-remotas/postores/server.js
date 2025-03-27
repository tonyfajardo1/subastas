const http = require('http');
const express = require('express');
const appBidders = express();
const serverBidders = http.createServer(appBidders);
const wssBidders = new WebSocket.Server({ server: serverBidders });
const WebSocket = require('ws');

appBidders.use(cors());
appBidders.use(express.json());

appBidders.get('/auctions', (req, res) => {
    res.json(auctions);
});

appBidders.post('/bid', (req, res) => {
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

serverBidders.listen(8081, () => console.log('Servicio de postores en 8081'));