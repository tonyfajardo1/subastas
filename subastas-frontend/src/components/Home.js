import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Home() {
    const [subastas, setSubastas] = useState([]);
    const [subastasActivas, setSubastasActivas] = useState([]);
    
    // Cargar subastas al iniciar
    useEffect(() => {
        // Obtener todas las subastas
        fetch("http://localhost:8080/subastas")
            .then(res => res.json())
            .then(data => {
                setSubastas(data);
                // Filtrar solo las activas
                const activas = data.filter(subasta => subasta.activa);
                setSubastasActivas(activas);
            })
            .catch(err => console.error("Error al cargar subastas:", err));
    }, []);

    return (
        <div style={{
            padding: "20px",
            maxWidth: "1200px",
            margin: "0 auto"
        }}>
            {/* Hero Section */}
            <div style={{
                position: "relative",
                borderRadius: "10px",
                overflow: "hidden",
                marginBottom: "40px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
            }}>
                <div style={{
                    background: "linear-gradient(135deg, #1a3b5c 0%, #2a5298 100%)",
                    padding: "60px 40px",
                    color: "white",
                    textAlign: "center"
                }}>
                    <h1 style={{
                        fontSize: "2.8rem",
                        marginBottom: "20px",
                        textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)"
                    }}>
                        Bienvenido a la Plataforma de Subastas de Arte
                    </h1>
                    
                    <p style={{
                        fontSize: "1.2rem",
                        maxWidth: "800px",
                        margin: "0 auto 30px",
                        lineHeight: "1.6"
                    }}>
                        Descubre obras de arte excepcionales y participa en nuestras subastas en tiempo real.
                        Ofrecemos una experiencia de subasta transparente y emocionante para coleccionistas de todo nivel.
                    </p>
                    
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "20px",
                        flexWrap: "wrap"
                    }}>
                        <Link to="/subastas">
                            <button style={{
                                padding: "12px 30px",
                                fontSize: "1.1rem",
                                backgroundColor: "#28a745",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                                fontWeight: "600",
                                transition: "all 0.2s ease"
                            }}>
                                Ver Subastas Disponibles
                            </button>
                        </Link>
                        
                        <Link to="/manejador">
                            <button style={{
                                padding: "12px 30px",
                                fontSize: "1.1rem",
                                backgroundColor: "rgba(255, 255, 255, 0.2)",
                                color: "white",
                                border: "1px solid white",
                                borderRadius: "5px",
                                cursor: "pointer",
                                fontWeight: "600",
                                transition: "all 0.2s ease"
                            }}>
                                Panel de Administración
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
            
            {/* Stats Section */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px",
                marginBottom: "40px"
            }}>
                <div style={{
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    padding: "20px",
                    textAlign: "center",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)"
                }}>
                    <h3 style={{ color: "#1a3b5c", fontSize: "1.8rem", marginBottom: "5px" }}>{subastas.length}</h3>
                    <p style={{ color: "#6c757d", margin: 0 }}>Total de Subastas</p>
                </div>
                
                <div style={{
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    padding: "20px",
                    textAlign: "center",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)"
                }}>
                    <h3 style={{ color: "#28a745", fontSize: "1.8rem", marginBottom: "5px" }}>{subastasActivas.length}</h3>
                    <p style={{ color: "#6c757d", margin: 0 }}>Subastas Activas</p>
                </div>
                
                <div style={{
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    padding: "20px",
                    textAlign: "center",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)"
                }}>
                    <h3 style={{ color: "#dc3545", fontSize: "1.8rem", marginBottom: "5px" }}>
                        {subastas.length - subastasActivas.length}
                    </h3>
                    <p style={{ color: "#6c757d", margin: 0 }}>Subastas Cerradas</p>
                </div>
            </div>
            
            {/* Featured Section */}
            <div style={{ marginBottom: "40px" }}>
                <h2 style={{ textAlign: "center", color: "#333", marginBottom: "30px" }}>Cómo Funciona</h2>
                
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "30px"
                }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{
                            backgroundColor: "#e9f5fe",
                            borderRadius: "50%",
                            width: "80px",
                            height: "80px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 15px",
                            fontSize: "2rem",
                            color: "#0d6efd"
                        }}>
                            1
                        </div>
                        <h3 style={{ color: "#333", marginBottom: "10px" }}>Explora las Subastas</h3>
                        <p style={{ color: "#6c757d" }}>
                            Navega por las subastas disponibles y encuentra obras de arte que te interesen.
                        </p>
                    </div>
                    
                    <div style={{ textAlign: "center" }}>
                        <div style={{
                            backgroundColor: "#e9f5fe",
                            borderRadius: "50%",
                            width: "80px",
                            height: "80px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 15px",
                            fontSize: "2rem",
                            color: "#0d6efd"
                        }}>
                            2
                        </div>
                        <h3 style={{ color: "#333", marginBottom: "10px" }}>Regístrate como Postor</h3>
                        <p style={{ color: "#6c757d" }}>
                            Una vez que encuentres una subasta activa, regístrate como postor con tu información.
                        </p>
                    </div>
                    
                    <div style={{ textAlign: "center" }}>
                        <div style={{
                            backgroundColor: "#e9f5fe",
                            borderRadius: "50%",
                            width: "80px",
                            height: "80px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 15px",
                            fontSize: "2rem",
                            color: "#0d6efd"
                        }}>
                            3
                        </div>
                        <h3 style={{ color: "#333", marginBottom: "10px" }}>Realiza tu Oferta</h3>
                        <p style={{ color: "#6c757d" }}>
                            Haz tu mejor oferta dentro del tiempo establecido y espera los resultados.
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Call to Action */}
            <div style={{
                textAlign: "center",
                padding: "40px 20px",
                borderRadius: "8px",
                backgroundColor: "#f8f9fa",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                marginBottom: "20px"
            }}>
                <h2 style={{ color: "#1a3b5c", marginBottom: "15px" }}>¿Listo para empezar?</h2>
                <p style={{ color: "#6c757d", maxWidth: "600px", margin: "0 auto 20px" }}>
                    Explora nuestras subastas activas y participa para conseguir obras de arte únicas.
                </p>
                
                <Link to="/subastas">
                    <button style={{
                        padding: "12px 30px",
                        fontSize: "1.1rem",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontWeight: "600",
                        transition: "all 0.2s ease"
                    }}>
                        Ver Todas las Subastas
                    </button>
                </Link>
            </div>
            
            {/* Footer */}
            <footer style={{
                textAlign: "center",
                padding: "20px 0",
                borderTop: "1px solid #dee2e6",
                color: "#6c757d",
                fontSize: "0.9rem"
            }}>
                <p>&copy; 2025 Plataforma de Subastas de Arte | Universidad San Francisco de Quito</p>
                <p>Aplicaciones Distribuidas - Proyecto Final</p>
            </footer>
        </div>
    );
}