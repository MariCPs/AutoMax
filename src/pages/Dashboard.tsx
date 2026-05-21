import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Wallet,
  ShoppingCart,
  Users,
  Activity,
} from "lucide-react";
import { useData } from "../store";
import { fmtCurrency, fmtDate } from "../utils";

export default function Dashboard() {
  const { db } = useData();

  const metrics = useMemo(() => {
    const vendasFinalizadas = db.vendas.filter((v) => v.status === "FINALIZADA");
    const totalVendas = vendasFinalizadas.reduce((s, v) => s + v.total, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const vendasHoje = vendasFinalizadas.filter((v) => new Date(v.data) >= today);
    const totalHoje = vendasHoje.reduce((s, v) => s + v.total, 0);

    const estoqueBaixo = db.produtos.filter((p) => p.estoque <= p.estoqueMinimo);
    const valorEstoque = db.produtos.reduce((s, p) => s + p.estoque * p.precoCusto, 0);

    const receitas = db.financeiro
      .filter((l) => l.tipo === "RECEITA" && l.status === "RECEBIDO")
      .reduce((s, l) => s + l.valor, 0);
    const despesas = db.financeiro
      .filter((l) => l.tipo === "DESPESA" && l.status === "PAGO")
      .reduce((s, l) => s + l.valor, 0);

    const aReceber = db.financeiro
      .filter((l) => l.tipo === "RECEITA" && l.status === "PENDENTE")
      .reduce((s, l) => s + l.valor, 0);
    const aPagar = db.financeiro
      .filter((l) => l.tipo === "DESPESA" && l.status === "PENDENTE")
      .reduce((s, l) => s + l.valor, 0);

    return {
      totalVendas,
      totalHoje,
      qtdVendas: vendasFinalizadas.length,
      vendasHoje: vendasHoje.length,
      estoqueBaixo,
      valorEstoque,
      receitas,
      despesas,
      saldo: receitas - despesas,
      aReceber,
      aPagar,
    };
  }, [db]);

  const ultimasVendas = db.vendas.slice(0, 5);
  const ultimasMovs = db.movimentacoes.slice(0, 6);

  const cards = [
    {
      label: "Vendas Hoje",
      value: fmtCurrency(metrics.totalHoje),
      sub: `${metrics.vendasHoje} venda${metrics.vendasHoje !== 1 ? "s" : ""}`,
      icon: TrendingUp,
      color: "from-emerald-500 to-emerald-600",
      iconBg: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Total em Vendas",
      value: fmtCurrency(metrics.totalVendas),
      sub: `${metrics.qtdVendas} pedidos finalizados`,
      icon: ShoppingCart,
      color: "from-brand-500 to-brand-600",
      iconBg: "bg-brand-100 text-brand-700",
    },
    {
      label: "Saldo Financeiro",
      value: fmtCurrency(metrics.saldo),
      sub: `+${fmtCurrency(metrics.receitas)} / -${fmtCurrency(metrics.despesas)}`,
      icon: Wallet,
      color: "from-violet-500 to-violet-600",
      iconBg: "bg-violet-100 text-violet-700",
    },
    {
      label: "Valor em Estoque",
      value: fmtCurrency(metrics.valorEstoque),
      sub: `${db.produtos.length} produtos`,
      icon: Package,
      color: "from-amber-500 to-amber-600",
      iconBg: "bg-amber-100 text-amber-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Visão geral do seu negócio</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="card p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {c.label}
                </p>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${c.iconBg}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">{c.value}</p>
              <p className="mt-1 text-xs text-slate-500">{c.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Últimas vendas</h3>
            <Link to="/vendas" className="text-xs font-semibold text-brand-600 hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-slate-500">
                  <th className="pb-2 font-semibold">#</th>
                  <th className="pb-2 font-semibold">Cliente</th>
                  <th className="pb-2 font-semibold">Status</th>
                  <th className="pb-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ultimasVendas.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      Nenhuma venda registrada.
                    </td>
                  </tr>
                )}
                {ultimasVendas.map((v) => (
                  <tr key={v.id} className="text-slate-700">
                    <td className="py-3 font-medium">#{v.numero}</td>
                    <td className="py-3">{v.clienteNome}</td>
                    <td className="py-3">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="py-3 text-right font-semibold">
                      {fmtCurrency(v.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">A receber / pagar</h3>
            <Wallet className="h-4 w-4 text-slate-400" />
          </div>
          <div className="space-y-3">
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
              <p className="text-xs font-semibold text-emerald-700">A receber</p>
              <p className="mt-1 text-xl font-bold text-emerald-900">
                {fmtCurrency(metrics.aReceber)}
              </p>
            </div>
            <div className="rounded-lg border border-rose-100 bg-rose-50 p-3">
              <p className="text-xs font-semibold text-rose-700">A pagar</p>
              <p className="mt-1 text-xl font-bold text-rose-900">
                {fmtCurrency(metrics.aPagar)}
              </p>
            </div>
            <Link to="/financeiro" className="btn-secondary w-full">
              Abrir financeiro
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="font-semibold text-slate-900">Estoque baixo</h3>
          </div>
          {metrics.estoqueBaixo.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400">
              Todos os produtos com estoque saudável.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {metrics.estoqueBaixo.slice(0, 6).map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2">
                  <span className="truncate pr-2 text-slate-700">{p.descricao}</span>
                  <span className="badge bg-amber-50 text-amber-700">
                    {p.estoque} un.
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-brand-500" />
            <h3 className="font-semibold text-slate-900">Movimentações recentes</h3>
          </div>
          {ultimasMovs.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400">
              Nenhuma movimentação ainda.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {ultimasMovs.map((m) => (
                <li key={m.id} className="flex items-center justify-between py-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-700">
                      {m.produtoDescricao}
                    </p>
                    <p className="text-xs text-slate-500">
                      {fmtDate(m.data)} • {m.tipo.replace("_", " ")}
                    </p>
                  </div>
                  <span
                    className={`badge ${
                      m.delta >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {m.delta > 0 ? "+" : ""}
                    {m.delta}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-brand-500" />
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {db.users.length} usuários • {db.clientes.length} clientes • {db.fornecedores.length} fornecedores
            </p>
            <p className="text-xs text-slate-500">
              Sistema demonstrativo com dados em localStorage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    FINALIZADA: "bg-emerald-50 text-emerald-700",
    ORCAMENTO: "bg-slate-100 text-slate-700",
    CANCELADA: "bg-rose-50 text-rose-700",
    PENDENTE: "bg-amber-50 text-amber-700",
    ESTORNADA: "bg-violet-50 text-violet-700",
  };
  return <span className={`badge ${map[status] || "bg-slate-100 text-slate-700"}`}>{status}</span>;
}
