import { useState } from "react";
import { Plus, Search, ToggleLeft, ToggleRight } from "lucide-react";
import { useData } from "../store";
import { useToast } from "../toast";
import Modal from "../components/Modal";
import { fmtDate } from "../utils";
import type { UserRole } from "../types";

export default function Usuarios() {
  const { db, currentUser, createUser, toggleUserActive } = useData();
  const { notify } = useToast();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    nome: "",
    email: "",
    login: "",
    senha: "",
    perfil: "VENDEDOR" as UserRole,
    ativo: true,
  });

  const filtered = db.users.filter((u) =>
    [u.nome, u.email, u.login].some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  if (currentUser?.perfil !== "ADMIN") {
    return <div className="card p-6 text-sm text-slate-500">Acesso restrito a administradores.</div>;
  }

  function handleSave() {
    const r = createUser(form);
    notify(r.msg, r.ok ? "success" : "error");
    if (r.ok) {
      setOpen(false);
      setForm({ nome: "", email: "", login: "", senha: "", perfil: "VENDEDOR", ativo: true });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Usuários</h1>
          <p className="text-sm text-slate-500">Gerenciamento de acessos e permissões</p>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary">
          <Plus className="h-4 w-4" />
          Novo Usuário
        </button>
      </div>

      <div className="card p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou login..."
            className="input pl-9"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                <th className="pb-2 font-semibold">Nome</th>
                <th className="pb-2 font-semibold">Login</th>
                <th className="pb-2 font-semibold">E-mail</th>
                <th className="pb-2 font-semibold">Perfil</th>
                <th className="pb-2 font-semibold">Status</th>
                <th className="pb-2 font-semibold">Criado em</th>
                <th className="pb-2 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td className="py-3 font-medium text-slate-900">{u.nome}</td>
                  <td className="py-3 text-slate-700">{u.login}</td>
                  <td className="py-3 text-slate-600">{u.email}</td>
                  <td className="py-3">
                    <span className="badge bg-slate-100 text-slate-700">{u.perfil}</span>
                  </td>
                  <td className="py-3">
                    {u.ativo ? (
                      <span className="badge bg-emerald-50 text-emerald-700">Ativo</span>
                    ) : (
                      <span className="badge bg-rose-50 text-rose-700">Inativo</span>
                    )}
                  </td>
                  <td className="py-3 text-xs text-slate-500">{fmtDate(u.criadoEm)}</td>
                  <td className="py-3 text-right">
                    {u.id !== currentUser.id && (
                      <button
                        onClick={() => toggleUserActive(u.id)}
                        className="btn-ghost text-xs"
                        title={u.ativo ? "Inativar" : "Ativar"}
                      >
                        {u.ativo ? (
                          <>
                            <ToggleRight className="h-4 w-4" /> Inativar
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-4 w-4" /> Ativar
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Novo Usuário"
        size="md"
        footer={
          <>
            <button onClick={() => setOpen(false)} className="btn-secondary">
              Cancelar
            </button>
            <button onClick={handleSave} className="btn-primary">
              Salvar
            </button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Nome</label>
            <input
              className="input"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Login</label>
            <input
              className="input"
              value={form.login}
              onChange={(e) => setForm({ ...form, login: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Senha (mín. 6)</label>
            <input
              className="input"
              type="password"
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Perfil</label>
            <select
              className="input"
              value={form.perfil}
              onChange={(e) => setForm({ ...form, perfil: e.target.value as UserRole })}
            >
              <option value="ADMIN">Administrador</option>
              <option value="VENDEDOR">Vendedor</option>
              <option value="ESTOQUISTA">Estoquista</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
