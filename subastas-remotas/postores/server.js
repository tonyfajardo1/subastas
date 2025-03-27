const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 8081;
const MANEJADOR_URL = "http://localhost:8080";

// ✅ Obtener subastas activas desde el manejador
async function obtenerSubastasActivas() {
    try {
        const response = await fetch(`${MANEJADOR_URL}/subastas/activas`);
        if (!response.ok) throw new Error("No se pudo obtener subastas activas");

        const data = await response.json();

        if (!Array.isArray(data)) {
            console.error("❌ Respuesta no válida:", data);
            return [];
        }

        return data;
    } catch (error) {
        console.error("❌ Error al obtener subastas activas:", error.message);
        return [];
    }
}

// 📌 Registrar postor (lógica simulada local)
app.post("/registrar-postor", async (req, res) => {
    const { nombre, subastaId } = req.body;

    const subastas = await obtenerSubastasActivas();
    const subasta = subastas.find(s => s.id === parseInt(subastaId));

    if (!subasta) {
        return res.status(400).json({ error: "Subasta no encontrada o no activa." });
    }

    if (!subasta.postores.includes(nombre)) {
        subasta.postores.push(nombre);
        console.log(`✅ ${nombre} registrado en subasta "${subasta.titulo}"`);
    }

    res.json({ message: "Postor registrado con éxito", subasta });
});

// 💰 Realizar oferta llamando al manejador
app.post("/ofertar", async (req, res) => {
    const { subastaId, nombre, monto } = req.body;

    try {
        const response = await fetch(`${MANEJADOR_URL}/subastas/ofertar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subastaId, nombre, monto }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("❌ Error al ofertar:", data.error);
            return res.status(400).json({ error: data.error });
        }

        console.log(`💸 Oferta enviada por ${nombre}: $${monto}`);
        res.json(data);
    } catch (error) {
        console.error("❌ Error al enviar oferta:", error.message);
        res.status(500).json({ error: "Error interno al enviar oferta" });
    }
});

// 🚀 Arrancar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servicio de postores corriendo en puerto ${PORT}`);
});
