const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
// Configurar la carpeta public para servir imágenes estáticas
app.use('/images', express.static(path.join(__dirname, 'public/images')));

const PORT = 8080;
const SUBASTAS_FILE = path.join(__dirname, "subastas.json");

// Función para cargar subastas desde el archivo JSON
function cargarSubastas() {
    try {
        // Verificar si el archivo existe
        if (fs.existsSync(SUBASTAS_FILE)) {
            const data = fs.readFileSync(SUBASTAS_FILE, 'utf8');
            const subastasJson = JSON.parse(data);
            
            // Asegurar que todas las subastas estén inactivas al iniciar
            const subastas = subastasJson.map(subasta => ({
                ...subasta,
                activa: false,  // Forzar estado inactivo
                postores: [],   // Limpiar postores
                ofertas: []     // Limpiar ofertas
            }));
            
            console.log(`📂 ${subastas.length} subastas cargadas desde archivo JSON (todas inactivas)`);
            return subastas;
        } else {
            console.log(`⚠️ Archivo de subastas no encontrado: ${SUBASTAS_FILE}`);
            return []; // Devolver array vacío en lugar de subastas por defecto
        }
    } catch (error) {
        console.error(`❌ Error al cargar subastas desde archivo:`, error);
        return []; // Devolver array vacío en lugar de subastas por defecto
    }
}

// Base de datos simulada de subastas (respaldo por defecto)
const subastasPorDefecto = [
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

// Cargar subastas al iniciar el servidor
let subastas = cargarSubastas();

// Tiempos restantes para cada subasta (nuevo)
let tiemposRestantes = {};

// Intervalos para cada subasta (nuevo)
let intervalosSubastas = {};

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

    // Buscar la configuración original de la subasta para obtener el precio inicial
    let precioInicial = subasta.precio;
    
    try {
        if (fs.existsSync(SUBASTAS_FILE)) {
            const data = fs.readFileSync(SUBASTAS_FILE, 'utf8');
            const subastasConfig = JSON.parse(data);
            
            // Buscar la subasta en la configuración original
            const subastaOriginal = subastasConfig.find(s => s.id === parseInt(subastaId));
            if (subastaOriginal && subastaOriginal.precio) {
                precioInicial = subastaOriginal.precio;
            }
        }
    } catch (error) {
        console.error(`❌ Error al restaurar precio original:`, error);
        // Si hay error, se mantiene el precio actual 
    }

    // Activar la subasta y resetear sus propiedades
    subasta.activa = true;
    subasta.ofertas = [];
    subasta.postores = [];
    subasta.precio = precioInicial; // Restaurar el precio inicial de la subasta
    
    // Inicializar tiempo restante
    tiemposRestantes[subasta.id] = subasta.duracion;

    console.log(`🟢 Subasta iniciada: ${subasta.titulo} (Duración: ${subasta.duracion} segundos, Precio inicial: $${precioInicial.toLocaleString()})`);
    res.json({ message: "Subasta iniciada.", subasta });

    // Mostrar cuenta regresiva
    intervalosSubastas[subasta.id] = setInterval(() => {
        tiemposRestantes[subasta.id] -= 5;
        if (tiemposRestantes[subasta.id] > 0) {
            console.log(`⏳ Tiempo restante para ${subasta.titulo}: ${tiemposRestantes[subasta.id]} segundos`);
        } else {
            finalizarSubasta(subasta.id);
        }
    }, 5000);

    // Finalizar subasta automáticamente después del tiempo especificado
    setTimeout(() => {
        finalizarSubasta(subasta.id);
    }, subasta.duracion * 1000);
});

// Nuevo endpoint para detener subasta manualmente
app.post("/detener-subasta", (req, res) => {
    const { subastaId } = req.body;
    const subasta = subastas.find(s => s.id === parseInt(subastaId));

    if (!subasta) return res.status(404).json({ error: "Subasta no encontrada." });
    if (!subasta.activa) return res.status(400).json({ error: "La subasta ya está inactiva." });

    finalizarSubasta(subasta.id);
    res.json({ message: "Subasta detenida manualmente.", subasta });
});

// Obtener tiempo restante para una subasta
app.get("/subastas/:id/tiempo-restante", (req, res) => {
    const { id } = req.params;
    const subasta = subastas.find(s => s.id === parseInt(id));
    
    if (!subasta) return res.status(404).json({ error: "Subasta no encontrada." });
    
    // Si la subasta no está activa o no tiene tiempo registrado
    if (!subasta.activa || !(subasta.id in tiemposRestantes)) {
        return res.json({ tiempoRestante: 0 });
    }
    
    res.json({ tiempoRestante: tiemposRestantes[subasta.id] });
});

// Función auxiliar para finalizar una subasta
function finalizarSubasta(subastaId) {
    const subasta = subastas.find(s => s.id === parseInt(subastaId));
    if (!subasta || !subasta.activa) return;
    
    // Limpiar el intervalo si existe
    if (intervalosSubastas[subastaId]) {
        clearInterval(intervalosSubastas[subastaId]);
        delete intervalosSubastas[subastaId];
    }
    
    // Marcar como inactiva
    subasta.activa = false;
    delete tiemposRestantes[subastaId];

    console.log(`🔴 Subasta finalizada: ${subasta.titulo}`);

    if (subasta.ofertas.length > 0) {
        const mejorOferta = subasta.ofertas.reduce((max, oferta) =>
            oferta.monto > max.monto ? oferta : max, subasta.ofertas[0]);
        console.log(`🏆 Ganador: ${mejorOferta.nombre} con $${mejorOferta.monto}`);
    } else {
        console.log("❌ No hubo ofertas.");
    }
}

// Registrar oferta
app.post("/subastas/ofertar", (req, res) => {
    const { subastaId, nombre, monto } = req.body;
    const subasta = subastas.find(s => s.id === parseInt(subastaId));

    if (!subasta || !subasta.activa) {
        return res.status(400).json({ error: "Subasta no encontrada o no está activa." });
    }

    // Convertir el monto a número para comparaciones seguras
    const montoNumerico = Number(monto);

    // Validar que la oferta sea mayor que el precio actual
    if (montoNumerico <= subasta.precio) {
        return res.status(400).json({ 
            error: `La oferta debe ser mayor que el precio actual ($${subasta.precio.toLocaleString()}).`
        });
    }

    // Validar que la oferta cumpla con el incremento mínimo
    const incrementoOfrecido = montoNumerico - subasta.precio;
    if (incrementoOfrecido < subasta.incremento) {
        return res.status(400).json({ 
            error: `La oferta debe incrementar al menos $${subasta.incremento.toLocaleString()} sobre el precio actual.`
        });
    }

    // Registrar la oferta
    subasta.ofertas.push({ nombre, monto: montoNumerico });
    
    // Actualizar el precio de la subasta al valor de la oferta (no sumarlo)
    subasta.precio = montoNumerico;

    console.log(`💰 ${nombre} ofreció $${montoNumerico.toLocaleString()} por "${subasta.titulo}" (incremento de $${incrementoOfrecido.toLocaleString()})`);
    res.json({ message: "Oferta registrada", subasta });
});

app.listen(PORT, () => {
    console.log(`🚀 Manejador de subastas corriendo en puerto ${PORT}`);
});
