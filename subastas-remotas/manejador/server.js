const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 8080;

// Base de datos simulada de subastas
let subastas = [
    {
        id: 1,
        titulo: "The Mona Lisa",
        artista: "Leonardo da Vinci",
        anio: 1503,
        precio: 200000000,
        incremento: 5000000,
        duracion: 60,
        imagen: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Mona_Lisa.jpg",
        activa: false,
        postores: [],
        ofertas: []
    },
    {
        id: 2,
        titulo: "The Dance Class",
        artista: "Edgar Degas",
        anio: 1874,
        precio: 10000000,
        incremento: 250000,
        duracion: 45,
        imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Edgar_Degas_The_Dance_Class.jpg/1280px-Edgar_Degas_The_Dance_Class.jpg",
        activa: false,
        postores: [],
        ofertas: []
    }
];

// Obtener todas las subastas
app.get("/subastas", (req, res) => {
    res.json(subastas);
});


// Obtener subastas activas
app.get("/subastas/activas", (req, res) => {
    const activas = subastas.filter(subasta => subasta.activa);
    res.json(activas); // ← NO usar res.status(404)
});
// Obtener una subasta específica
app.get("/subastas/:id", (req, res) => {
    const { id } = req.params;
    const subasta = subastas.find(s => s.id === parseInt(id));
    if (!subasta) return res.status(404).json({ error: "Subasta no encontrada" });
    res.json(subasta);
});

// Iniciar una subasta
app.post("/iniciar-subasta", (req, res) => {
    const { subastaId } = req.body;
    const subasta = subastas.find(s => s.id === parseInt(subastaId));

    if (!subasta) return res.status(404).json({ error: "Subasta no encontrada." });
    if (subasta.activa) return res.status(400).json({ error: "La subasta ya está activa." });

    subasta.activa = true;
    subasta.ofertas = [];
    subasta.postores = [];

    console.log(`🟢 Subasta iniciada: ${subasta.titulo} (Duración: ${subasta.duracion} segundos)`);
    res.json({ message: "Subasta iniciada.", subasta });

    // Mostrar cuenta regresiva
    let tiempoRestante = subasta.duracion;
    const intervalo = setInterval(() => {
        tiempoRestante -= 5;
        if (tiempoRestante > 0) {
            console.log(`⏳ Tiempo restante para ${subasta.titulo}: ${tiempoRestante} segundos`);
        }
    }, 5000);

    // Finalizar subasta
    setTimeout(() => {
        clearInterval(intervalo);
        subasta.activa = false;

        console.log(`🔴 Subasta finalizada: ${subasta.titulo}`);

        if (subasta.ofertas.length > 0) {
            const mejorOferta = subasta.ofertas.reduce((max, oferta) =>
                oferta.monto > max.monto ? oferta : max, subasta.ofertas[0]);
            console.log(`🏆 Ganador: ${mejorOferta.nombre} con $${mejorOferta.monto}`);
        } else {
            console.log("❌ No hubo ofertas.");
        }
    }, subasta.duracion * 1000);
});

// Registrar oferta
app.post("/subastas/ofertar", (req, res) => {
    const { subastaId, nombre, monto } = req.body;
    const subasta = subastas.find(s => s.id === parseInt(subastaId));

    if (!subasta || !subasta.activa) {
        return res.status(400).json({ error: "Subasta no encontrada o no está activa." });
    }

    subasta.ofertas.push({ nombre, monto });
    subasta.precio += monto;

    console.log(`💰 ${nombre} ofreció $${monto} por "${subasta.titulo}" → nuevo precio: $${subasta.precio}`);
    res.json({ message: "Oferta registrada", subasta });
});

app.listen(PORT, () => {
    console.log(`🚀 Manejador de subastas corriendo en puerto ${PORT}`);
});
