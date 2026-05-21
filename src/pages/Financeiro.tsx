import { useState, useMemo } from "react";
import { Plus, CheckCircle2, Ban, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useData } from "../store";
import { useToast } from "../toast";
import Modal from "../components/Modal";
import { fmtCurrency, fmtDateOnly } from "../utils";
import type { LancamentoTipo, LancamentoStatus } from "../types";

export default function Financeiro() {
  const { db, currentUser, criarLancamento, confirmarLancamento, estornarLancamento } = useData();
  const { notify } = useToast();
  const [open, setOpen] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<"TODOS" | LancamentoTipo>("TODOS");
  const [filtroStatus, setFiltroStatus] = useState<"TODOS" | LancamentoStatus>("TODOS");

  const [form, setForm] = useState({
    categoria: "",
    tipo: "RECEITA" as LancamentoTipo,
    valor: 0,
    vencimento: new Date().toISOString().slice(0, 10),
    descricao: "",
    status: "PENDENTE" as LancamentoStatus,
  });

  const filtered = db.financeiro.filter((l) => {
    const t = filtroTipo === "TODOS" || l.tipo === filtroTipo;
    const s = filtroStatus === "TODOS" || l.status === filtroStatus;
    return t && s;
  });

  const totals = useMemo(() => {
    const recRec = db.financeiro
      .filter((l) => l.tipo === "RECEITA" && l.status === "RECEBIDO")
      .reduce((s, l) => s + l.valor, 0);
    const desPg = db.financeiro
      .filter((l) => l.tipo === "DESPESA" && l.status === "PAGO")
      .reduce((s, l) => s + l.valor, 0);
    const aRec = db.financeiro
      .filter((l) => l.tipo === "RECEITA" && l.status === "PENDENTE")
      .reduce((s, l) => s + l.valor, 0);
    const aPag = db.financeiro
      .filter((l) => l.tipo === "DESPESA" && l.status === "PENDENTE")
      .reduce((s, l) => s + l.valor, 0);
    return { recRec, desPg, aRec, aPag, saldo: recRec - desPg };
  }, [db.financeiro]);

  function salvar() {
    const r = criarLancamento({ ...form, origemTipo: "MANUAL" });
    notify(r.msg, r.ok ? "success" : "error");
    if (r.ok) {
      setOpen(false);
      setForm({
        categoria: "",
        tipo: "RECEITA",
        valor: 0,
        vencimento: new Date().toISOString().slice(0, 10),
        descricao: "",
        status: "PENDENTE",
      });
    }
  }

  if (currentUser?.perfil !== "ADMIN") {
    return <div className="card p-6 text-sm text-slate-500">Acesso restrito a administradores.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financeiro</h1>
          <p className="text-sm text-slate-500">Receitas, despesas e fluxo de caixa</p>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> Novo Lançamento
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card icon={TrendingUp} label="Receitas" value={fmtCurrency(totals.recRec)} color="emerald" />
        <Card icon={TrendingDown} label="Despesas" value={fmtCurrency(totals.desPg)} color="rose" />
        <Card icon={Wallet} label="Saldo" value={fmtCurrency(totals.saldo)} color="brand" />
        <Card icon={Plus} label="A Receber/Pagar" value={`${fmtCurrency(totals.aRec)} / ${fmtCurrency(totals.aPag)}`} color="amber" small />
      </div>

      <div className="card p-4">
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <select className="input" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value as any)}>
            <option value="TODOS">Todos os tipos</option>
            <option value="RECEITA">Receitas</option>
            <option value="DESPESA">Despesas</option>
          </select>
          <select className="input" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value as any)}>
            <option value="TODOS">Todos status</option>
            <option value="PENDENTE">Pendente</option>
            <option value="PAGO">Pago</option>
            <option value="RECEBIDO">Recebido</option>
            <option value="ESTORNADO">Estornado</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                <th className="pb-2 font-semibold">Tipo</th>
                <th className="pb-2 font-semibold">Categoria</th>
                <th className="pb-2 font-semibold">Descrição</th>
                <th className="pb-2 font-semibold">Vencimento</th>
                <th className="pb-2 font-semibold">Status</th>
                <th className="pb-2 text-right font-semibold">Valor</th>
                <th className="pb-2 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((l) => (
                <tr key={l.id}>
                  <td className="py-3">
                    <span
                      className={`badge ${
                        l.tipo === "RECEITA" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {l.tipo === "RECEITA" ? "↑ Receita" : "↓ Despesa"}
                    </span>
                  </td>
                  <td className="py-3 text-slate-700">{l.categoria}</td>
                  <td className="py-3 text-slate-600">{l.descricao}</td>
                  <td className="py-3 text-slate-600">{fmtDateOnly(l.vencimento)}</td>
                  <td className="py-3">
                    <StatusBadge status={l.status} />
                  </td>
                  <td className="py-3 text-right font-semibold">
                    <span className={l.tipo === "RECEITA" ? "text-emerald-700" : "text-rose-700"}>
                      {l.tipo === "RECEITA" ? "+" : "-"}{fmtCurrency(l.valor)}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {l.status === "PENDENTE" && (
                        <button
                          onClick={() => {
                            confirmarLancamento(l.id);
                            notify(l.tipo === "RECEITA" ? "Recebimento confirmado." : "Pagamento confirmado.", "success");
                          }}
                          className="btn-ghost text-xs text-emerald-700"
                          title="Confirmar"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {l.status !== "ESTORNADO" && (
                        <button
                          onClick={() => {
                            estornarLancamento(l.id);
                            notify("Lançamento estornado.", "success");
                          }}
                          className="btn-ghost text-xs text-rose-600"
                          title="Estornar"
                        >
                          <Ban className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Nenhum lançamento encontrado.
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
        title="Novo Lançamento"
        size="md"
        footer={
          <>
            <button onClick={() => setOpen(false)} className="btn-secondary">Cancelar</button>
            <button onClick={salvar} className="btn-primary">Salvar</button>
          </>
        }
      >
        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Tipo</label>
              <select className="input" value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value as LancamentoTipo })}>
                <option value="RECEITA">Receita</option>
                <option value="DESPESA">Despesa</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as LancamentoStatus })}>
                <option value="PENDENTE">Pendente</option>
                <option value="PAGO">Pago</option>
                <option value="RECEBIDO">Recebido</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Categoria *</label>
            <input className="input" value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              placeholder="Ex: Aluguel, Salários, Vendas..." />
          </div>
          <div>
            <label className="label">Descrição</label>
            <input className="input" value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Valor (R$) *</label>
              <input type="number" min="0" step="0.01" className="input" value={form.valor}
                onChange={(e) => setForm({ ...form, valor: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="label">Vencimento</label>
              <input type="date" className="input" value={form.vencimento}
                onChange={(e) => setForm({ ...form, vencimento: e.target.value })} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Card({
  icon: Icon, label, value, color, small,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string;
  color: "emerald" | "rose" | "brand" | "amber";
  small?: boolean;
}) {
  const map = {
    emerald: "bg-emerald-100 text-emerald-700",
    rose: "bg-rose-100 text-rose-700",
    brand: "bg-brand-100 text-brand-700",
    amber: "bg-amber-100 text-amber-700",
  };
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${map[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className={`mt-3 font-bold text-slate-900 ${small ? "text-base" : "text-2xl"}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDENTE: "bg-amber-50 text-amber-700",
    PAGO: "bg-emerald-50 text-emerald-700",
    RECEBIDO: "bg-emerald-50 text-emerald-700",
    ESTORNADO: "bg-violet-50 text-violet-700",
  };
  return <span className={`badge ${map[status] || "bg-slate-100 text-slate-700"}`}>{status}</span>;
}
