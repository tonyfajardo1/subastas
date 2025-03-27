import { useState, useEffect } from "react";

export default function ManejadorSubastas() {
    const [subastas, setSubastas] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8080/subastas")
            .then(res => res.json())
            .then(data => setSubastas(data));
    }, []);

    const iniciarSubasta = async (id) => {
        await fetch("http://localhost:8080/iniciar-subasta", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subastaId: id })
        });
    };

    return (
        <div>
            <h1>Manejador de Subastas</h1>
            <ul>
                {subastas.map(subasta => (
                    <li key={subasta.id}>
                        {subasta.titulo} - ${subasta.precio}
                        <button onClick={() => iniciarSubasta(subasta.id)}>Iniciar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}