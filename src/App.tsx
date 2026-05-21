import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { DataProvider, useData } from "./store";
import { ToastProvider } from "./toast";
import Layout from "./Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Usuarios from "./pages/Usuarios";
import Clientes from "./pages/Clientes";
import Fornecedores from "./pages/Fornecedores";
import Produtos from "./pages/Produtos";
import Estoque from "./pages/Estoque";
import Vendas from "./pages/Vendas";
import Compras from "./pages/Compras";
import Financeiro from "./pages/Financeiro";
import Relatorios from "./pages/Relatorios";
import Auditoria from "./pages/Auditoria";

function PrivateLayout() {
  const { currentUser } = useData();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <Layout />;
}

export default function App() {
  return (
    <ToastProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<PrivateLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/usuarios" element={<Usuarios />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/fornecedores" element={<Fornecedores />} />
              <Route path="/produtos" element={<Produtos />} />
              <Route path="/estoque" element={<Estoque />} />
              <Route path="/vendas" element={<Vendas />} />
              <Route path="/compras" element={<Compras />} />
              <Route path="/financeiro" element={<Financeiro />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="/auditoria" element={<Auditoria />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </ToastProvider>
  );
}
