import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import ManejadorSubastas from "./components/ManejadorSubastas";
import ListaSubastas from "./components/ListaSubastas";
import SubastaDetalle from "./components/SubastaDetalle";
import NavBar from "./components/NavBar";

function App() {
    return (
        <Router>
            <NavBar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/manejador" element={<ManejadorSubastas />} />
                <Route path="/subastas" element={<ListaSubastas />} />
                <Route path="/subasta/:id" element={<SubastaDetalle />} />
            </Routes>
        </Router>
    );
}

export default App;