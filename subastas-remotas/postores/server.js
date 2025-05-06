const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 8081;
// Usar el nombre del servicio Docker en lugar de localhost
const MANEJADOR_URL = process.env.MANEJADOR_URL || "http://manejador:8080";
console.log(`🔌 Conectando al manejador en: ${MANEJADOR_URL}`);

// ✅ Obtener subastas activas desde el manejador
async function obtenerSubastasActivas() {
    try {
        console.log("🔍 Solicitando subastas activas al manejador...");
        const response = await fetch(`${MANEJADOR_URL}/subastas/activas`);
        
        if (!response.ok) {
            console.error(`❌ Error al obtener subastas activas: ${response.status} - ${response.statusText}`);
            return [];
        }

        const data = await response.json();
        console.log("📋 Subastas activas recibidas:", data);

        if (!Array.isArray(data)) {
            console.error("❌ Respuesta no válida (no es un array):", data);
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
    console.log(`🔍 Intentando registrar a "${nombre}" en la subasta ID: ${subastaId} (tipo: ${typeof subastaId})`);

    const subastas = await obtenerSubastasActivas();
    console.log(`📋 Subastas activas disponibles: ${subastas.length} - IDs: ${subastas.map(s => s.id).join(', ')}`);

    // Convertir explícitamente a número y comparar
    const numSubastaId = parseInt(subastaId);
    const subasta = subastas.find(s => s.id === numSubastaId);

    if (!subasta) {
        console.error(`❌ No se encontró la subasta activa con ID: ${subastaId}`);
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
    console.log(`💰 Intentando ofertar $${monto} por "${nombre}" en subasta ID: ${subastaId}`);

    try {
        // Verificar primero si la subasta existe y está activa
        const subastas = await obtenerSubastasActivas();
        const subasta = subastas.find(s => s.id === parseInt(subastaId));
        
        if (!subasta) {
            console.error(`❌ Oferta rechazada: No se encontró subasta activa con ID: ${subastaId}`);
            return res.status(400).json({ error: "Subasta no encontrada o no activa." });
        }
        
        const response = await fetch(`${MANEJADOR_URL}/subastas/ofertar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                subastaId: parseInt(subastaId), 
                nombre, 
                monto: Number(monto) 
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(`❌ Error al ofertar: ${data.error}`);
            return res.status(400).json({ error: data.error });
        }

        console.log(`✅ Oferta enviada por ${nombre}: $${monto} para "${subasta.titulo}"`);
        res.json(data);
    } catch (error) {
        console.error(`❌ Error al enviar oferta:`, error.message);
        res.status(500).json({ error: "Error interno al enviar oferta" });
    }
});

// 🚀 Arrancar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servicio de postores corriendo en puerto ${PORT}`);
});
