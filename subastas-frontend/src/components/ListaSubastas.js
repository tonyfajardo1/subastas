import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function ListaSubastas() {
    const [subastas, setSubastas] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8080/subastas")
            .then(res => res.json())
            .then(data => setSubastas(data.filter(s => s.activa))); // Filtrar solo subastas activas
    }, []);

    return (
        <div>
            <h1>Subastas Disponibles</h1>
            <ul>
                {subastas.map(subasta => (
                    <li key={subasta.id}>
                        <Link to={`/subasta/${subasta.id}`}>{subasta.titulo}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}