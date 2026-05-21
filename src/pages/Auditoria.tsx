import { useState } from "react";
import { Search, Shield } from "lucide-react";
import { useData } from "../store";
import { fmtDate } from "../utils";

export default function Auditoria() {
  const { db, currentUser } = useData();
  const [search, setSearch] = useState("");
  const [acao, setAcao] = useState<string>("TODAS");

  if (currentUser?.perfil !== "ADMIN") {
    return <div className="card p-6 text-sm text-slate-500">Acesso restrito a administradores.</div>;
  }

  const acoes = Array.from(new Set(db.auditoria.map((a) => a.acao))).sort();

  const filtered = db.auditoria.filter((l) => {
    const matchSearch =
      !search ||
      [l.usuarioNome, l.detalhes, l.entidade].some((s) =>
        s.toLowerCase().includes(search.toLowerCase())
      );
    const matchAcao = acao === "TODAS" || l.acao === acao;
    return matchSearch && matchAcao;
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Auditoria</h1>
        <p className="text-sm text-slate-500">Registro completo de operações do sistema</p>
      </div>

      <div className="card p-4">
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr,200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar usuário, entidade ou detalhes..."
              className="input pl-9"
            />
          </div>
          <select className="input" value={acao} onChange={(e) => setAcao(e.target.value)}>
            <option value="TODAS">Todas as ações</option>
            {acoes.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                <th className="pb-2 font-semibold">Data</th>
                <th className="pb-2 font-semibold">Usuário</th>
                <th className="pb-2 font-semibold">Ação</th>
                <th className="pb-2 font-semibold">Entidade</th>
                <th className="pb-2 font-semibold">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((l) => (
                <tr key={l.id}>
                  <td className="py-2 text-xs text-slate-500">{fmtDate(l.data)}</td>
                  <td className="py-2 font-medium text-slate-900">{l.usuarioNome}</td>
                  <td className="py-2">
                    <span className="badge bg-brand-50 text-brand-700">{l.acao}</span>
                  </td>
                  <td className="py-2 text-slate-600">{l.entidade}</td>
                  <td className="py-2 text-slate-700">{l.detalhes}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Shield className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    Nenhum registro de auditoria encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
