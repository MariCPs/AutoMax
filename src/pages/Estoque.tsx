import { useState } from "react";
import { Search, History, Boxes } from "lucide-react";
import { useData } from "../store";
import { useToast } from "../toast";
import Modal from "../components/Modal";
import { fmtDate } from "../utils";
import type { Produto, MovimentacaoEstoque } from "../types";

export default function Estoque() {
  const { db, ajustarEstoque } = useData();
  const { notify } = useToast();
  const [search, setSearch] = useState("");
  const [editProd, setEditProd] = useState<Produto | null>(null);
  const [novaQtd, setNovaQtd] = useState(0);
  const [motivo, setMotivo] = useState("");
  const [verHist, setVerHist] = useState<Produto | null>(null);

  const filtered = db.produtos.filter((p) =>
    [p.descricao, p.codigoInterno, p.codigoBarras].some((s) =>
      s.toLowerCase().includes(search.toLowerCase())
    )
  );

  function openAdjust(p: Produto) {
    setEditProd(p);
    setNovaQtd(p.estoque);
    setMotivo("");
  }

  function handleSave() {
    if (!editProd) return;
    const r = ajustarEstoque(editProd.id, novaQtd, motivo);
    notify(r.msg, r.ok ? "success" : "error");
    if (r.ok) setEditProd(null);
  }

  const histProd: MovimentacaoEstoque[] = verHist
    ? db.movimentacoes.filter((m) => m.produtoId === verHist.id)
    : [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Estoque</h1>
        <p className="text-sm text-slate-500">
          Consulta e ajuste de saldos com histórico completo de movimentações
        </p>
      </div>

      <div className="card p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar produto..."
            className="input pl-9"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                <th className="pb-2 font-semibold">Produto</th>
                <th className="pb-2 font-semibold">Localização</th>
                <th className="pb-2 text-right font-semibold">Saldo</th>
                <th className="pb-2 text-right font-semibold">Mín.</th>
                <th className="pb-2 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => {
                const baixo = p.estoque <= p.estoqueMinimo;
                return (
                  <tr key={p.id}>
                    <td className="py-3">
                      <p className="font-medium text-slate-900">{p.descricao}</p>
                      <p className="text-xs text-slate-500">
                        {p.codigoInterno} • {p.marca}
                      </p>
                    </td>
                    <td className="py-3 text-slate-600">{p.localizacao || "-"}</td>
                    <td className="py-3 text-right">
                      <span
                        className={`badge ${
                          baixo ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {p.estoque}
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-500">{p.estoqueMinimo}</td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openAdjust(p)} className="btn-secondary text-xs">
                          <Boxes className="h-3.5 w-3.5" /> Ajustar
                        </button>
                        <button onClick={() => setVerHist(p)} className="btn-ghost text-xs">
                          <History className="h-3.5 w-3.5" /> Histórico
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={!!editProd}
        onClose={() => setEditProd(null)}
        title={`Ajustar estoque - ${editProd?.descricao || ""}`}
        size="md"
        footer={
          <>
            <button onClick={() => setEditProd(null)} className="btn-secondary">Cancelar</button>
            <button onClick={handleSave} className="btn-primary">Salvar</button>
          </>
        }
      >
        {editProd && (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-3 text-sm">
              <p>
                <span className="text-slate-500">Saldo atual:</span>{" "}
                <strong>{editProd.estoque} un.</strong>
              </p>
              <p>
                <span className="text-slate-500">Localização:</span>{" "}
                <strong>{editProd.localizacao || "-"}</strong>
              </p>
            </div>
            <div>
              <label className="label">Nova quantidade</label>
              <input
                type="number"
                min="0"
                className="input"
                value={novaQtd}
                onChange={(e) => setNovaQtd(parseInt(e.target.value) || 0)}
              />
              <p className="mt-1 text-xs text-slate-500">
                Variação:{" "}
                <strong className={novaQtd - editProd.estoque >= 0 ? "text-emerald-600" : "text-rose-600"}>
                  {novaQtd - editProd.estoque > 0 ? "+" : ""}
                  {novaQtd - editProd.estoque}
                </strong>
              </p>
            </div>
            <div>
              <label className="label">Motivo da alteração *</label>
              <textarea
                className="input min-h-[80px]"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ex: Inventário físico, perda, ajuste contábil..."
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!verHist}
        onClose={() => setVerHist(null)}
        title={`Histórico - ${verHist?.descricao || ""}`}
        size="xl"
      >
        {verHist && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                  <th className="pb-2 font-semibold">Data</th>
                  <th className="pb-2 font-semibold">Tipo</th>
                  <th className="pb-2 font-semibold">Anterior</th>
                  <th className="pb-2 font-semibold">Atual</th>
                  <th className="pb-2 font-semibold">Δ</th>
                  <th className="pb-2 font-semibold">Usuário</th>
                  <th className="pb-2 font-semibold">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {histProd.map((m) => (
                  <tr key={m.id}>
                    <td className="py-2 text-xs text-slate-600">{fmtDate(m.data)}</td>
                    <td className="py-2">
                      <span className="badge bg-slate-100 text-slate-700">
                        {m.tipo.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-2">{m.qtdAnterior}</td>
                    <td className="py-2">{m.qtdAtual}</td>
                    <td className="py-2">
                      <span
                        className={`badge ${
                          m.delta >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {m.delta > 0 ? "+" : ""}
                        {m.delta}
                      </span>
                    </td>
                    <td className="py-2 text-slate-600">{m.usuarioNome}</td>
                    <td className="py-2 text-slate-500">{m.motivo || "-"}</td>
                  </tr>
                ))}
                {histProd.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400">
                      Sem movimentações registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
}
