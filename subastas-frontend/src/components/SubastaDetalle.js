import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "../styles.css";

const SubastaDetalle = () => {
    const { id } = useParams(); // Obtiene el ID de la subasta desde la URL
    const [subasta, setSubasta] = useState(null);
    const [nombre, setNombre] = useState("");
    const [oferta, setOferta] = useState("");
    const [subastaActiva, setSubastaActiva] = useState(false);
    const [tiempoRestante, setTiempoRestante] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const MANEJADOR_URL = "http://localhost:8080"; // URL base del manejador
    // Imagen de respaldo cuando falla la carga
    const imagenRespaldo = "https://via.placeholder.com/600x400?text=Imagen+no+disponible";

    // Función para manejar errores de carga de imágenes
    const manejarErrorImagen = (e) => {
        console.log("Error al cargar imagen, usando imagen de respaldo");
        e.target.src = imagenRespaldo;
    };

    // Función para construir la URL completa de la imagen
    const obtenerUrlImagen = (rutaRelativa) => {
        // Si la ruta ya es una URL completa, devolverla tal cual
        if (rutaRelativa && (rutaRelativa.startsWith('http://') || rutaRelativa.startsWith('https://'))) {
            return rutaRelativa;
        }
        // Si es una ruta relativa, combinarla con la URL base
        return rutaRelativa ? `${MANEJADOR_URL}${rutaRelativa}` : imagenRespaldo;
    };

    // Cargar la información de la subasta al montar el componente
    useEffect(() => {
        const fetchSubasta = async () => {
            try {
                setLoading(true);
                console.log(`Intentando obtener subasta con ID: ${id}`);
                
                const response = await fetch(`${MANEJADOR_URL}/subastas/${id}`);
                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }
                
                const data = await response.json();
                console.log("Datos de subasta recibidos:", data);
                setSubasta(data);
                setSubastaActiva(data.activa);
                setLoading(false);
            } catch (err) {
                console.error("Error al cargar subasta:", err);
                setError(err.message);
                setLoading(false);
            }
        };
        
        fetchSubasta();
    }, [id]);

    // Actualizar el tiempo restante cada segundo si la subasta está activa
    useEffect(() => {
        if (!subastaActiva) return;

        const interval = setInterval(async () => {
            try {
                const response = await fetch(`${MANEJADOR_URL}/subastas/${id}/tiempo-restante`);
                const data = await response.json();
                
                if (response.ok) {
                    setTiempoRestante(data.tiempoRestante);
                    
                    // Si el tiempo llega a cero, actualizar el estado de la subasta
                    if (data.tiempoRestante <= 0) {
                        const subastaResponse = await fetch(`${MANEJADOR_URL}/subastas/${id}`);
                        const subastaData = await subastaResponse.json();
                        if (subastaResponse.ok) {
                            setSubasta(subastaData);
                            setSubastaActiva(subastaData.activa);
                        }
                    }
                }
            } catch (err) {
                console.error("Error al actualizar tiempo restante:", err);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [id, subastaActiva]);

    // Formato para tiempo restante
    const formatoTiempo = (segundos) => {
        if (!segundos || segundos <= 0) return "00:00";
        const minutos = Math.floor(segundos / 60);
        const segs = segundos % 60;
        return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    };

    // Obtener subastas activas antes de registrar el postor
    const obtenerSubastasActivas = async () => {
        try {
            const response = await fetch(`${MANEJADOR_URL}/subastas/activas`);
            if (!response.ok) throw new Error("No se encontraron subastas activas.");

            const data = await response.json();
            if (!Array.isArray(data)) throw new Error("La respuesta de subastas activas no es válida.");

            console.log("📡 Subastas activas obtenidas:", data);
            return data;
        } catch (error) {
            console.error("⚠️ Error obteniendo subastas activas:", error);
            return [];
        }
    };

    // Manejar el registro y la oferta en un solo botón
    const manejarRegistroYOferta = async () => {
        if (!nombre || !oferta) {
            alert("Por favor, ingresa tu nombre y una oferta válida.");
            return;
        }

        try {
            // Verificar si la subasta está activa
            const subastasActivas = await obtenerSubastasActivas();
            const subastaActiva = subastasActivas.find(s => s.id === parseInt(id));

            if (!subastaActiva) {
                alert("Error: La subasta no está activa. No puedes participar.");
                return;
            }

            // Registrar al postor
            const registroResponse = await fetch("http://localhost:8081/registrar-postor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre, subastaId: id })
            });
            const registroData = await registroResponse.json();

            if (!registroResponse.ok) {
                alert(`Error al registrar: ${registroData.error}`);
                return;
            }

            // Realizar la oferta
            const ofertaResponse = await fetch("http://localhost:8081/ofertar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subastaId: id, nombre, monto: parseFloat(oferta) })
            });
            const ofertaData = await ofertaResponse.json();

            if (!ofertaResponse.ok) {
                alert(`Error al ofertar: ${ofertaData.error}`);
                return;
            }

            alert(`✅ ¡Oferta registrada con éxito! Nuevo precio: $${ofertaData.subasta.precio}`);
            setOferta(""); // Limpiar el campo de oferta después de una oferta exitosa
            
            // Actualizar los datos de la subasta después de ofertar
            const subastaResponse = await fetch(`${MANEJADOR_URL}/subastas/${id}`);
            if (subastaResponse.ok) {
                const subastaData = await subastaResponse.json();
                setSubasta(subastaData);
            }
        } catch (error) {
            alert("Error en la solicitud. Inténtalo de nuevo.");
            console.error("Error:", error);
        }
    };

    if (loading) return <p>⏳ Cargando subasta...</p>;
    if (error) return <p>❌ Error al cargar la subasta: {error}</p>;
    if (!subasta) return <p>⚠️ No se encontró la subasta</p>;

    // Ordenar ofertas de mayor a menor
    const ofertasOrdenadas = subasta.ofertas ? [...subasta.ofertas].sort((a, b) => b.monto - a.monto) : [];
    
    // Determinar si hay un ganador (subasta cerrada y hay ofertas)
    const hayGanador = !subastaActiva && ofertasOrdenadas.length > 0;
    const ganador = hayGanador ? ofertasOrdenadas[0] : null;
    
    // Precio base de la subasta (si no hay ofertas, es el precio actual)
    const precioInicial = subasta.precio - (ofertasOrdenadas.reduce((total, oferta) => total + oferta.monto, 0) - (ganador ? ganador.monto : 0));

    return (
        <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ position: "relative" }}>
                <img 
                    src={obtenerUrlImagen(subasta.imagen)}
                    alt={subasta.titulo}
                    onError={manejarErrorImagen}
                    className="imagen-subasta-detalle"
                />
                {!subastaActiva && (
                    <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "2rem",
                        textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
                        borderRadius: "8px"
                    }}>
                        SUBASTA CERRADA
                    </div>
                )}
                
                {/* Timer de tiempo restante */}
                {subastaActiva && (
                    <div style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        backgroundColor: "#007bff",
                        color: "white",
                        padding: "10px 15px",
                        borderRadius: "20px",
                        fontWeight: "bold",
                        fontSize: "1.2rem",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
                    }}>
                        ⏳ {formatoTiempo(tiempoRestante)}
                    </div>
                )}
            </div>
            
            <h1>{subasta.titulo}</h1>
            <p><strong>Artista:</strong> {subasta.artista}</p>
            <p><strong>Año:</strong> {subasta.anio}</p>
            <div style={{ 
                backgroundColor: "#f8f9fa", 
                padding: "15px", 
                borderRadius: "8px",
                marginBottom: "20px" 
            }}>
                <p style={{ margin: 0 }}><strong>Precio Inicial:</strong> ${precioInicial.toLocaleString()}</p>
                <p style={{ margin: "10px 0 0 0" }}><strong>Precio Actual:</strong> ${subasta.precio.toLocaleString()}</p>
                <p style={{ margin: "10px 0 0 0" }}><strong>Incremento mínimo:</strong> ${subasta.incremento.toLocaleString()}</p>
            </div>
            
            {/* Mostrar ganador si la subasta está cerrada y hay ofertas */}
            {hayGanador && (
                <div style={{
                    backgroundColor: "#d4edda",
                    borderColor: "#c3e6cb",
                    color: "#155724",
                    padding: "15px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                    textAlign: "center"
                }}>
                    <h3 style={{ margin: "0 0 10px 0" }}>🏆 GANADOR DE LA SUBASTA</h3>
                    <p style={{ fontWeight: "bold", fontSize: "1.2rem", margin: 0 }}>{ganador.nombre}</p>
                    <p style={{ fontSize: "1.5rem", margin: "5px 0 0 0" }}>${ganador.monto.toLocaleString()}</p>
                </div>
            )}
            
            {/* Lista de ofertas */}
            <div style={{ marginBottom: "30px" }}>
                <h2 style={{ borderBottom: "2px solid #dee2e6", paddingBottom: "10px" }}>
                    Historial de Ofertas
                </h2>
                
                {ofertasOrdenadas.length > 0 ? (
                    <div style={{ maxHeight: "300px", overflowY: "auto", padding: "10px" }}>
                        {ofertasOrdenadas.map((oferta, index) => (
                            <div 
                                key={index}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    padding: "10px 15px",
                                    marginBottom: "10px",
                                    backgroundColor: index === 0 && !subastaActiva ? "#d4edda" : "#f8f9fa",
                                    borderLeft: `4px solid ${index === 0 ? "#28a745" : "#6c757d"}`,
                                    borderRadius: "4px"
                                }}
                            >
                                <div style={{ fontWeight: index === 0 ? "bold" : "normal" }}>
                                    {oferta.nombre} 
                                    {index === 0 && <span style={{ marginLeft: "10px", color: "#28a745" }}>
                                        {subastaActiva ? "(Mejor oferta actual)" : "(Ganador)"}
                                    </span>}
                                </div>
                                <div style={{ fontWeight: "bold" }}>
                                    ${oferta.monto.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ textAlign: "center", color: "#6c757d", padding: "20px" }}>
                        Aún no hay ofertas para esta subasta.
                    </p>
                )}
            </div>
            
            {subastaActiva ? (
                <div>
                    <div style={{
                        backgroundColor: "#e9f7ef",
                        borderLeft: "5px solid #28a745",
                        padding: "10px 15px",
                        marginBottom: "20px",
                        borderRadius: "2px"
                    }}>
                        <p style={{ margin: 0, fontWeight: "bold", color: "#28a745" }}>
                            Subasta en progreso - Tiempo restante: {formatoTiempo(tiempoRestante)}
                        </p>
                    </div>
                
                    <h2>Participar en la Subasta</h2>
                    <div style={{ marginBottom: "1rem" }}>
                        <input
                            type="text"
                            placeholder="Tu nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            style={{ padding: "0.5rem", marginRight: "0.5rem" }}
                        />
                        <input
                            type="number"
                            placeholder="Tu oferta"
                            value={oferta}
                            onChange={(e) => setOferta(e.target.value)}
                            style={{ padding: "0.5rem", marginRight: "0.5rem" }}
                        />
                        <button 
                            onClick={manejarRegistroYOferta}
                            style={{ 
                                padding: "0.5rem 1rem", 
                                backgroundColor: "#4CAF50", 
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer" 
                            }}
                        >
                            Registrar y Ofertar
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ 
                    backgroundColor: "#f8d7da", 
                    color: "#721c24", 
                    padding: "1rem", 
                    borderRadius: "4px",
                    marginTop: "1rem" 
                }}>
                    <h3>Esta subasta no está activa actualmente</h3>
                    <p>La subasta para "{subasta.titulo}" no está disponible en este momento. Por favor, espera a que el administrador inicie la subasta para poder participar.</p>
                </div>
            )}
            
            <div style={{ marginTop: "2rem" }}>
                <Link 
                    to="/"
                    style={{ 
                        padding: "0.5rem 1rem", 
                        backgroundColor: "#6c757d", 
                        color: "white",
                        textDecoration: "none",
                        borderRadius: "4px"
                    }}
                >
                    Volver a la lista de subastas
                </Link>
            </div>
        </div>
    );
};

export default SubastaDetalle;
