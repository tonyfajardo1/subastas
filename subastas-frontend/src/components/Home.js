import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div>
            <h1>Bienvenido a la Plataforma de Subastas</h1>
            <Link to="/manejador"><button>Ir al Manejador</button></Link>
            <Link to="/subastas"><button>Ver Subastas</button></Link>
        </div>
    );
}