import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function ListaSubastas() {
    const [subastas, setSubastas] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8080/subastas")
            .then(res => res.json())
            .then(data => setSubastas(data.filter(s => s.activa)));
    }, []);

    return (
        <div style={{ padding: "1rem" }}>
            <h1>Subastas Disponibles</h1>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                {subastas.map(subasta => (
                    <div
                        key={subasta.id}
                        style={{
                            border: "1px solid #ccc",
                            padding: "1rem",
                            width: "250px",
                            borderRadius: "8px",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
                        }}
                    >
                        <img
                            src={subasta.imagen}
                            alt={subasta.titulo}
                            style={{ width: "100%", height: "auto", borderRadius: "6px" }}
                        />
                        <h3>{subasta.titulo}</h3>
                        <p><strong>Artista:</strong> {subasta.artista}</p>
                        <p><strong>Precio:</strong> ${subasta.precio}</p>
                        <Link to={`/subasta/${subasta.id}`}>Ver Detalles</Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
