// src/components/RegistroPostor.js
import { useState, useEffect } from "react";

export default function RegistroPostor() {
    const [subastas, setSubastas] = useState([]);
    const [nombre, setNombre] = useState("");
    const [subastaSeleccionada, setSubastaSeleccionada] = useState(null);
    const [oferta, setOferta] = useState("");

    useEffect(() => {
        fetch("http://localhost:8080/subastas")
            .then(res => res.json())
            .then(data => setSubastas(data));
    }, []);

    const registrar = async () => {
        if (!nombre || !subastaSeleccionada) {
            alert("Selecciona una subasta y coloca tu nombre.");
            return;
        }

        await fetch("http://localhost:8081/registrar-postor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, subastaId: subastaSeleccionada })
        });

        alert(`Registrado en la subasta.`);
    };

    const hacerOferta = async () => {
        await fetch("http://localhost:8081/ofertar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subastaId: subastaSeleccionada, monto: Number(oferta) })
        });

        alert(`Oferta de $${oferta} enviada.`);
    };

    return (
        <div>
            <h1>Registrarse y Ofertar</h1>
            <input type="text" placeholder="Tu Nombre" onChange={(e) => setNombre(e.target.value)} />
            <select onChange={(e) => setSubastaSeleccionada(Number(e.target.value))}>
                <option value="">Selecciona una subasta</option>
                {subastas.map(subasta => (
                    <option key={subasta.id} value={subasta.id}>{subasta.titulo}</option>
                ))}
            </select>
            <button onClick={registrar}>Registrarse</button>
            <br />
            <input type="number" placeholder="Tu oferta" onChange={(e) => setOferta(e.target.value)} />
            <button onClick={hacerOferta}>Ofertar</button>
        </div>
    );
}
