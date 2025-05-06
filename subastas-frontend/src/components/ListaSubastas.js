import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import "../styles.css";

export default function ListaSubastas() {
    const [subastas, setSubastas] = useState([]);
    const [tiemposRestantes, setTiemposRestantes] = useState({});
    const [cargando, setCargando] = useState(true);
    const [preciosIniciales, setPreciosIniciales] = useState({});
    const MANEJADOR_URL = "http://localhost:8080"; // URL base del manejador
    // Imagen de respaldo cuando falla la carga
    const imagenRespaldo = "https://via.placeholder.com/300x200?text=Imagen+no+disponible";

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
    
    // Formato para tiempo restante
    const formatoTiempo = (segundos) => {
        if (!segundos || segundos <= 0) return "00:00";
        const minutos = Math.floor(segundos / 60);
        const segs = segundos % 60;
        return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    };

    // Obtener el mejor postor de una subasta
    const obtenerMejorPostor = (subasta) => {
        if (!subasta.ofertas || subasta.ofertas.length === 0) {
            return null;
        }
        
        return subasta.ofertas.reduce((mejor, oferta) => 
            oferta.monto > mejor.monto ? oferta : mejor, subasta.ofertas[0]);
    };

    // Calcular los precios iniciales de cada subasta
    const calcularPreciosIniciales = useCallback((subastasData) => {
        const precios = {};
        
        subastasData.forEach(subasta => {
            if (subasta.ofertas && subasta.ofertas.length > 0) {
                const mejorOferta = obtenerMejorPostor(subasta);
                // El precio inicial es el precio actual menos la mejor oferta
                precios[subasta.id] = subasta.precio - mejorOferta.monto;
            } else {
                // Si no hay ofertas, el precio inicial es el actual
                precios[subasta.id] = subasta.precio;
            }
        });
        
        return precios;
    }, []);

    // Cargar subastas inicialmente
    useEffect(() => {
        setCargando(true);
        fetch(`${MANEJADOR_URL}/subastas`)
            .then(res => res.json())
            .then(data => {
                setSubastas(data);
                setPreciosIniciales(calcularPreciosIniciales(data));
                setCargando(false);
            })
            .catch(err => {
                console.error("Error al cargar subastas:", err);
                setCargando(false);
            }); 
    }, [calcularPreciosIniciales]);

    // Actualizar subastas y tiempos restantes cada 5 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            // Actualizar lista de subastas
            fetch(`${MANEJADOR_URL}/subastas`)
                .then(res => res.json())
                .then(data => {
                    setSubastas(data);
                    setPreciosIniciales(calcularPreciosIniciales(data));
                });
            
            // Actualizar tiempos restantes de subastas activas
            subastas.forEach(subasta => {
                if (subasta.activa) {
                    fetch(`${MANEJADOR_URL}/subastas/${subasta.id}/tiempo-restante`)
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
    }, [subastas, calcularPreciosIniciales]);

    // Verificar si hay subastas activas
    const haySubastasActivas = subastas.some(subasta => subasta.activa);

    return (
        <div style={{ padding: "1rem", maxWidth: "1200px", margin: "0 auto" }}>
            <h1 style={{ textAlign: "center", marginBottom: "2rem", color: "#1a3b5c" }}>
                Subastas Disponibles
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
                    <p>El administrador debe configurar algunas subastas para que puedas hacer ofertas. Por favor, intenta más tarde cuando se hayan configurado las subastas.</p>
                </div>
            )}

            {/* Mensaje cuando hay subastas configuradas pero ninguna activa */}
            {!cargando && subastas.length > 0 && !haySubastasActivas && (
                <div style={{ 
                    textAlign: "center", 
                    padding: "2rem", 
                    backgroundColor: "#fff3cd",
                    borderRadius: "8px",
                    marginBottom: "2rem",
                    color: "#856404",
                    border: "1px solid #ffeeba"
                }}>
                    <h3>Subastas configuradas pero no iniciadas</h3>
                    <p>Hay subastas configuradas pero ninguna está activa en este momento. El administrador debe iniciar alguna de las subastas para que puedas participar.</p>
                </div>
            )}

            <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
                gap: "20px" 
            }}>
                {subastas.map(subasta => {
                    const mejorPostor = obtenerMejorPostor(subasta);
                    const precioInicial = preciosIniciales[subasta.id] || subasta.precio;
                    
                    return (
                    <div
                        key={subasta.id}
                        style={{
                            border: "1px solid #dee2e6", 
                            borderRadius: "8px",
                            overflow: "hidden",
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                            position: "relative",
                            opacity: subasta.activa ? 1 : 0.6
                        }}
                    >
                        <div style={{ position: "relative" }}>
                            <img
                                src={obtenerUrlImagen(subasta.imagen)}
                                alt={subasta.titulo}
                                onError={manejarErrorImagen}
                                className="imagen-subasta"
                            />
                            
                            {/* Mostrar tiempo restante si la subasta está activa */}
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
                                    fontSize: "0.9rem",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                                }}>
                                    ⏳ {formatoTiempo(tiemposRestantes[subasta.id] || 0)}
                                </div>
                            )}
                        </div>
                        
                        {/* Superposición para subastas cerradas */}
                        {!subasta.activa && (
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
                                fontSize: "1.5rem",
                                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
                                borderRadius: "8px"
                            }}>
                                SUBASTA CERRADA
                            </div>
                        )}
                        
                        <div style={{ padding: "15px" }}>
                            <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>{subasta.titulo}</h3>
                            <p style={{ margin: "0 0 5px 0" }}><strong>Artista:</strong> {subasta.artista}</p>
                            
                            <div style={{ 
                                backgroundColor: "#f8f9fa", 
                                padding: "8px", 
                                borderRadius: "4px", 
                                margin: "10px 0", 
                                fontSize: "0.9rem" 
                            }}>
                                <div><strong>Precio base:</strong> ${precioInicial.toLocaleString()}</div>
                                <div><strong>Precio actual:</strong> ${subasta.precio.toLocaleString()}</div>
                                {mejorPostor && (
                                    <div style={{ marginTop: "5px", color: "#28a745" }}>
                                        <strong>Mejor oferta:</strong> {mejorPostor.nombre} (${mejorPostor.monto.toLocaleString()})
                                    </div>
                                )}
                            </div>
                            
                            {/* Condicionar el enlace según el estado */}
                            {subasta.activa ? (
                                <Link 
                                    to={`/subasta/${subasta.id}`}
                                    style={{
                                        display: "block",
                                        textAlign: "center",
                                        padding: "8px 0",
                                        backgroundColor: "#28a745",
                                        color: "white",
                                        textDecoration: "none",
                                        borderRadius: "4px",
                                        fontWeight: "bold"
                                    }}
                                >
                                    Ver Detalles
                                </Link>
                            ) : (
                                <div style={{ 
                                    textAlign: "center", 
                                    padding: "8px 0",
                                    backgroundColor: "#f8f9fa",
                                    color: "#6c757d",
                                    borderRadius: "4px",
                                    fontWeight: "bold"
                                }}>
                                    No disponible
                                </div>
                            )}
                        </div>
                    </div>
                )})}
            </div>
        </div>
    );
}
