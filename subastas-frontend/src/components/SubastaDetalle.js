import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const SubastaDetalle = () => {
    const { id } = useParams(); // Obtiene el ID de la subasta desde la URL
    const [subasta, setSubasta] = useState(null);
    const [nombre, setNombre] = useState("");
    const [oferta, setOferta] = useState("");

    // Cargar la información de la subasta al montar el componente
    useEffect(() => {
        fetch(`http://localhost:8080/subastas/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    alert(`Error: ${data.error}`);
                } else {
                    setSubasta(data);
                }
            })
            .catch(error => console.error("Error al obtener la subasta:", error));
    }, [id]);

    // Obtener subastas activas antes de registrar el postor
    const obtenerSubastasActivas = async () => {
        try {
            const response = await fetch("http://localhost:8080/subastas/activas");
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
        } catch (error) {
            alert("Error en la solicitud. Inténtalo de nuevo.");
            console.error("Error:", error);
        }
    };

    if (!subasta) return <p>⏳ Cargando subasta...</p>;

    return (
        <div>
            <h1>{subasta.titulo}</h1>
            <p><strong>Artista:</strong> {subasta.artista}</p>
            <p><strong>Precio Actual:</strong> ${subasta.precio}</p>

            <h2>Participar en la Subasta</h2>
            <input
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
            />
            <input
                type="number"
                placeholder="Tu oferta"
                value={oferta}
                onChange={(e) => setOferta(e.target.value)}
            />
            <button onClick={manejarRegistroYOferta}>Registrar y Ofertar</button>
        </div>
    );
};

export default SubastaDetalle;
