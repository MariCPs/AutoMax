import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Wrench } from "lucide-react";
import { useData } from "../store";
import { useToast } from "../toast";

export default function Login() {
  const { currentUser, login } = useData();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState("admin");
  const [pwd, setPwd] = useState("admin123");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  if (currentUser) return <Navigate to="/" replace />;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const r = login(user, pwd);
      setLoading(false);
      if (r.ok) {
        notify(r.msg, "success");
        navigate("/");
      } else {
        notify(r.msg, "error");
      }
    }, 200);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 p-4">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl md:grid-cols-2">
        {/* Branding panel */}
        <div className="relative hidden bg-gradient-to-br from-brand-700 to-brand-900 p-10 text-white md:block">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight">AutoMax</p>
              <p className="text-xs text-brand-100">Peças Automotivas</p>
            </div>
          </div>
          <h1 className="mt-12 text-3xl font-bold leading-tight">
            Gestão completa para sua loja de peças.
          </h1>
          <p className="mt-3 text-sm text-brand-100">
            Vendas, estoque, compras, financeiro e relatórios em um único lugar.
          </p>
          <div className="absolute bottom-10 left-10 right-10 rounded-xl border border-white/15 bg-white/10 p-4 text-sm">
            <p className="mb-2 font-semibold">Credenciais de demonstração</p>
            <ul className="space-y-1 text-xs text-brand-50">
              <li>• admin / admin123 (Administrador)</li>
              <li>• vendedor / venda123 (Vendedor)</li>
              <li>• estoque / estoque123 (Estoquista)</li>
            </ul>
          </div>
        </div>

        {/* Form */}
        <div className="p-8 md:p-12">
          <h2 className="text-2xl font-bold text-slate-900">Entrar</h2>
          <p className="mt-1 text-sm text-slate-500">Acesse sua conta para continuar</p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="label">E-mail / Login</label>
              <input
                className="input"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="seu.usuario"
                autoFocus
              />
            </div>
            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={show ? "text" : "password"}
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-100"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Validando..." : "Entrar"}
            </button>
            <button
              type="button"
              className="btn-ghost w-full text-xs"
              onClick={() => notify("Funcionalidade ainda não disponível na demo.", "info")}
            >
              Esqueci minha senha
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
