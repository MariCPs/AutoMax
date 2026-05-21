import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Truck,
  Package,
  Boxes,
  ShoppingCart,
  ClipboardList,
  Wallet,
  FileBarChart,
  ShieldCheck,
  LogOut,
  Wrench,
  RefreshCcw,
} from "lucide-react";
import { useData } from "./store";
import type { UserRole } from "./types";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
}

const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/usuarios", label: "Usuários", icon: Users, roles: ["ADMIN"] },
  { to: "/clientes", label: "Clientes", icon: UserCircle, roles: ["ADMIN", "VENDEDOR"] },
  { to: "/fornecedores", label: "Fornecedores", icon: Truck, roles: ["ADMIN", "ESTOQUISTA"] },
  { to: "/produtos", label: "Produtos", icon: Package },
  { to: "/estoque", label: "Estoque", icon: Boxes },
  { to: "/vendas", label: "Vendas", icon: ShoppingCart, roles: ["ADMIN", "VENDEDOR"] },
  { to: "/compras", label: "Compras", icon: ClipboardList, roles: ["ADMIN", "ESTOQUISTA"] },
  { to: "/financeiro", label: "Financeiro", icon: Wallet, roles: ["ADMIN"] },
  { to: "/relatorios", label: "Relatórios", icon: FileBarChart },
  { to: "/auditoria", label: "Auditoria", icon: ShieldCheck, roles: ["ADMIN"] },
];

export default function Layout() {
  const { currentUser, logout, resetDB } = useData();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const items = NAV.filter((n) => !n.roles || n.roles.includes(currentUser.perfil));

  return (
    <div className="flex h-full min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">AutoMax</p>
            <p className="text-[11px] text-slate-500">Peças Automotivas</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 p-3">
          <button
            onClick={() => {
              if (confirm("Tem certeza? Isso vai limpar todos os dados e voltar ao seed inicial.")) {
                resetDB();
                navigate("/login");
              }
            }}
            className="btn-ghost mb-1 w-full justify-start text-xs"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Resetar dados de demo
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur md:px-6">
          <div className="md:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Wrench className="h-4 w-4" />
              </div>
              <p className="text-sm font-bold">AutoMax</p>
            </div>
          </div>
          <div className="hidden md:block">
            <p className="text-sm text-slate-500">Bem-vindo,</p>
            <p className="text-sm font-semibold text-slate-900">{currentUser.nome}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge bg-brand-50 text-brand-700">{currentUser.perfil}</span>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="btn-secondary"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="border-b border-slate-200 bg-white px-2 py-2 md:hidden">
          <div className="flex gap-1 overflow-x-auto">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                      isActive ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"
                    }`
                  }
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </nav>

        <main className="min-w-0 flex-1 overflow-x-hidden p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
