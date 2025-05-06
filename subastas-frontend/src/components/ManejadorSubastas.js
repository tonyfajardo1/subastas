import { useState, useEffect } from "react";
import "../styles.css";

export default function ManejadorSubastas() {
    const [subastas, setSubastas] = useState([]);
    const [tiemposRestantes, setTiemposRestantes] = useState({});
    const [cargando, setCargando] = useState(true);

    // Cargar subastas iniciales
    useEffect(() => {
        setCargando(true);
        fetch("http://localhost:8080/subastas")
            .then(res => res.json())
            .then(data => {
                setSubastas(data);
                setCargando(false);
            })
            .catch(err => {
                console.error("Error al cargar subastas:", err);
                setCargando(false);
            });
    }, []);

    // Actualizar lista de subastas y tiempos restantes cada 5 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            // Actualizar lista de subastas
            fetch("http://localhost:8080/subastas")
                .then(res => res.json())
                .then(data => setSubastas(data));
            
            // Actualizar tiempos restantes de subastas activas
            subastas.forEach(subasta => {
                if (subasta.activa) {
                    fetch(`http://localhost:8080/subastas/${subasta.id}/tiempo-restante`)
                        .then(res => res.json())
                        .then(data => {
                            setTiemposRestantes(prev => ({
                                ...prev,
                                [subasta.id]: data.tiempoRestante
                            }));
                        });
                }
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [subastas]);

    const iniciarSubasta = async (id) => {
        try {
            const response = await fetch("http://localhost:8080/iniciar-subasta", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subastaId: id })
            });
            
            if (!response.ok) {
                const data = await response.json();
                alert(`Error al iniciar subasta: ${data.error || 'Error desconocido'}`);
                return;
            }
            
            // Recargar subastas después de iniciar una
            fetch("http://localhost:8080/subastas")
                .then(res => res.json())
                .then(data => setSubastas(data));
                
        } catch (error) {
            alert(`Error de conexión: ${error.message}`);
        }
    };

    const detenerSubasta = async (id) => {
        try {
            const response = await fetch("http://localhost:8080/detener-subasta", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subastaId: id })
            });
            
            if (!response.ok) {
                const data = await response.json();
                alert(`Error al detener subasta: ${data.error || 'Error desconocido'}`);
                return;
            }
            
            // Recargar subastas después de detener una
            fetch("http://localhost:8080/subastas")
                .then(res => res.json())
                .then(data => setSubastas(data));
                
        } catch (error) {
            alert(`Error de conexión: ${error.message}`);
        }
    };

    // Formato para tiempo restante
    const formatoTiempo = (segundos) => {
        if (!segundos || segundos <= 0) return "00:00";
        const minutos = Math.floor(segundos / 60);
        const segs = segundos % 60;
        return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
            <h1 style={{ textAlign: "center", marginBottom: "2rem", color: "#1a3b5c" }}>
                Panel de Administración de Subastas
            </h1>

            {/* Mensaje cuando está cargando */}
            {cargando && (
                <div style={{ 
                    textAlign: "center", 
                    padding: "2rem", 
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    marginBottom: "2rem"
                }}>
                    <p>Cargando subastas...</p>
                </div>
            )}

            {/* Mensaje cuando no hay subastas configuradas */}
            {!cargando && subastas.length === 0 && (
                <div style={{ 
                    textAlign: "center", 
                    padding: "2rem", 
                    backgroundColor: "#f8d7da",
                    borderRadius: "8px",
                    marginBottom: "2rem",
                    color: "#721c24",
                    border: "1px solid #f5c6cb"
                }}>
                    <h3>No hay subastas configuradas</h3>
                    <p>No se encontró el archivo de configuración de subastas o está vacío. Para comenzar, debe crear un archivo subastas.json con la configuración de las subastas.</p>
                    <div style={{ marginTop: "1rem", fontSize: "0.9rem", backgroundColor: "#f1f1f1", padding: "1rem", borderRadius: "4px", textAlign: "left" }}>
                        <p style={{ marginBottom: "0.5rem" }}>El archivo debe tener el siguiente formato:</p>
                        <pre style={{ overflowX: "auto" }}>
{`[
  {
    "id": 1,
    "titulo": "Nombre de la obra",
    "artista": "Nombre del artista",
    "anio": 2023,
    "precio": 100000,
    "incremento": 5000,
    "duracion": 60,
    "imagen": "https://url-de-la-imagen.jpg"
  }
]`}
                        </pre>
                    </div>
                </div>
            )}

            <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", 
                gap: "20px" 
            }}>
                {subastas.map(subasta => (
                    <div 
                        key={subasta.id} 
                        style={{
                            border: "1px solid #dee2e6", 
                            borderRadius: "8px",
                            overflow: "hidden",
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                        }}
                    >
                        <div style={{ position: "relative" }}>
                            <img 
                                src={subasta.imagen || "https://via.placeholder.com/300x200?text=Imagen+no+disponible"} 
                                alt={subasta.titulo}
                                onError={(e) => e.target.src = "https://via.placeholder.com/300x200?text=Imagen+no+disponible"}
                                className="imagen-subasta"
                            />
                            {subasta.activa && (
                                <div style={{
                                    position: "absolute",
                                    top: "10px",
                                    right: "10px",
                                    backgroundColor: "#007bff",
                                    color: "white",
                                    padding: "5px 10px",
                                    borderRadius: "20px",
                                    fontWeight: "bold",
                                    fontSize: "0.9rem"
                                }}>
                                    ⏳ {formatoTiempo(tiemposRestantes[subasta.id] || 0)}
                                </div>
                            )}
                        </div>
                        
                        <div style={{ padding: "15px" }}>
                            <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>{subasta.titulo}</h3>
                            <p style={{ margin: "0 0 5px 0" }}>
                                <strong>Artista:</strong> {subasta.artista}
                            </p>
                            <p style={{ margin: "0 0 5px 0" }}>
                                <strong>Año:</strong> {subasta.anio}
                            </p>
                            <p style={{ margin: "0 0 15px 0" }}>
                                <strong>Precio actual:</strong> ${subasta.precio.toLocaleString()}
                            </p>
                            <p style={{ margin: "0 0 15px 0" }}>
                                <strong>Duración:</strong> {subasta.duracion} segundos
                            </p>
                            
                            <div style={{ 
                                display: "flex", 
                                justifyContent: "space-between", 
                                marginTop: "10px",
                                gap: "10px"
                            }}>
                                {!subasta.activa ? (
                                    <button 
                                        onClick={() => iniciarSubasta(subasta.id)}
                                        style={{
                                            backgroundColor: "#28a745",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "4px",
                                            padding: "10px 15px",
                                            fontSize: "1rem",
                                            cursor: "pointer",
                                            flex: 1
                                        }}
                                    >
                                        Iniciar Subasta
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => detenerSubasta(subasta.id)}
                                        style={{
                                            backgroundColor: "#dc3545",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "4px",
                                            padding: "10px 15px",
                                            fontSize: "1rem",
                                            cursor: "pointer",
                                            flex: 1
                                        }}
                                    >
                                        Detener Subasta
                                    </button>
                                )}
                                
                                <div style={{
                                    display: "inline-block",
                                    padding: "10px 15px",
                                    borderRadius: "4px",
                                    backgroundColor: subasta.activa ? "#dff0d8" : "#f8d7da",
                                    color: subasta.activa ? "#3c763d" : "#721c24",
                                    textAlign: "center",
                                    fontWeight: "bold",
                                    flex: 1
                                }}>
                                    {subasta.activa ? "ACTIVA" : "INACTIVA"}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}