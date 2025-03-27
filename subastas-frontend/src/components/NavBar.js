// src/components/NavBar.js
import { Link } from "react-router-dom";

export default function NavBar() {
    return (
        <nav style={{ padding: "10px", background: "#333", color: "white" }}>
            <Link to="/" style={{ marginRight: "15px", color: "white" }}>🏠 Inicio</Link>
            <Link to="/manejador" style={{ marginRight: "15px", color: "white" }}>⚙️ Manejador</Link>
            <Link to="/subastas" style={{ marginRight: "15px", color: "white" }}>📢 Subastas</Link>
        </nav>
    );
}
