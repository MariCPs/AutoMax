import { useMemo, useState } from "react";
import { Download, FileBarChart, Printer } from "lucide-react";
import { useData } from "../store";
import { fmtCurrency, fmtDate, downloadCSV } from "../utils";

type ReportType =
  | "vendas-periodo"
  | "estoque-baixo"
  | "lucratividade"
  | "movimentacoes"
  | "vendedores"
  | "fluxo";

export default function Relatorios() {
  const { db } = useData();
  const today = new Date().toISOString().slice(0, 10);
  const start = new Date();
  start.setDate(start.getDate() - 30);
  const [tipo, setTipo] = useState<ReportType>("vendas-periodo");
  const [inicio, setInicio] = useState(start.toISOString().slice(0, 10));
  const [fim, setFim] = useState(today);

  const inIso = new Date(inicio).getTime();
  const fimIso = new Date(fim + "T23:59:59").getTime();

  const data = useMemo(() => {
    if (tipo === "vendas-periodo") {
      const rows = db.vendas
        .filter((v) => {
          const t = new Date(v.data).getTime();
          return v.status === "FINALIZADA" && t >= inIso && t <= fimIso;
        })
        .map((v) => ({
          numero: v.numero,
          cliente: v.clienteNome,
          vendedor: v.vendedorNome,
          data: fmtDate(v.data),
          itens: v.itens.length,
          total: v.total,
        }));
      const total = rows.reduce((s, r) => s + r.total, 0);
      return { rows, total, headers: ["Nº", "Cliente", "Vendedor", "Data", "Itens", "Total"] };
    }
    if (tipo === "estoque-baixo") {
      const rows = db.produtos
        .filter((p) => p.estoque <= p.estoqueMinimo)
        .map((p) => ({
          codigo: p.codigoInterno,
          descricao: p.descricao,
          marca: p.marca,
          estoque: p.estoque,
          minimo: p.estoqueMinimo,
          custo: p.precoCusto,
        }));
      return { rows, total: 0, headers: ["Código", "Descrição", "Marca", "Estoque", "Mínimo", "Custo"] };
    }
    if (tipo === "lucratividade") {
      const rows = db.produtos.map((p) => {
        const vendidos = db.vendas
          .filter((v) => v.status === "FINALIZADA")
          .flatMap((v) => v.itens)
          .filter((i) => i.produtoId === p.id);
        const qtd = vendidos.reduce((s, i) => s + i.quantidade, 0);
        const receita = vendidos.reduce((s, i) => s + i.subtotal, 0);
        const custoTotal = qtd * p.precoCusto;
        const lucro = receita - custoTotal;
        const margem = receita > 0 ? (lucro / receita) * 100 : 0;
        return {
          codigo: p.codigoInterno,
          descricao: p.descricao,
          qtd,
          receita,
          custoTotal,
          lucro,
          margem: `${margem.toFixed(1)}%`,
        };
      });
      const total = rows.reduce((s, r) => s + r.lucro, 0);
      return {
        rows,
        total,
        headers: ["Código", "Descrição", "Qtd Vendida", "Receita", "Custo", "Lucro", "Margem"],
      };
    }
    if (tipo === "movimentacoes") {
      const rows = db.movimentacoes
        .filter((m) => {
          const t = new Date(m.data).getTime();
          return t >= inIso && t <= fimIso;
        })
        .map((m) => ({
          data: fmtDate(m.data),
          produto: m.produtoDescricao,
          tipo: m.tipo,
          delta: m.delta,
          usuario: m.usuarioNome,
          motivo: m.motivo || "-",
        }));
      return { rows, total: 0, headers: ["Data", "Produto", "Tipo", "Δ", "Usuário", "Motivo"] };
    }
    if (tipo === "vendedores") {
      const map = new Map<string, { nome: string; vendas: number; total: number }>();
      db.vendas
        .filter((v) => v.status === "FINALIZADA")
        .filter((v) => {
          const t = new Date(v.data).getTime();
          return t >= inIso && t <= fimIso;
        })
        .forEach((v) => {
          const e = map.get(v.vendedorId) || { nome: v.vendedorNome, vendas: 0, total: 0 };
          e.vendas++;
          e.total += v.total;
          map.set(v.vendedorId, e);
        });
      const rows = Array.from(map.values()).sort((a, b) => b.total - a.total);
      const total = rows.reduce((s, r) => s + r.total, 0);
      return { rows, total, headers: ["Vendedor", "Vendas", "Faturamento"] };
    }
    if (tipo === "fluxo") {
      const rows = db.financeiro
        .filter((l) => {
          const t = new Date(l.criadoEm).getTime();
          return t >= inIso && t <= fimIso;
        })
        .map((l) => ({
          data: fmtDate(l.criadoEm),
          tipo: l.tipo,
          categoria: l.categoria,
          descricao: l.descricao,
          status: l.status,
          valor: l.tipo === "RECEITA" ? l.valor : -l.valor,
        }));
      const total = rows.reduce((s, r) => s + r.valor, 0);
      return { rows, total, headers: ["Data", "Tipo", "Categoria", "Descrição", "Status", "Valor"] };
    }
    return { rows: [], total: 0, headers: [] };
  }, [tipo, db, inIso, fimIso]);

  function exportCsv() {
    const headers = data.headers;
    const body = data.rows.map((r) => Object.values(r));
    downloadCSV(`automax-${tipo}-${today}.csv`, [headers, ...body]);
  }

  function imprimir() {
    window.print();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Relatórios</h1>
          <p className="text-sm text-slate-500">Relatórios gerenciais e operacionais</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button onClick={exportCsv} className="btn-secondary">
            <Download className="h-4 w-4" /> CSV / Excel
          </button>
          <button onClick={imprimir} className="btn-secondary">
            <Printer className="h-4 w-4" /> Imprimir / PDF
          </button>
        </div>
      </div>

      <div className="card p-4 print:hidden">
        <div className="grid gap-3 md:grid-cols-[2fr,1fr,1fr]">
          <div>
            <label className="label">Tipo de Relatório</label>
            <select className="input" value={tipo} onChange={(e) => setTipo(e.target.value as ReportType)}>
              <option value="vendas-periodo">Vendas por Período</option>
              <option value="estoque-baixo">Produtos com Estoque Baixo</option>
              <option value="lucratividade">Lucratividade por Produto</option>
              <option value="movimentacoes">Histórico de Movimentações</option>
              <option value="vendedores">Desempenho de Vendedores</option>
              <option value="fluxo">Fluxo Financeiro</option>
            </select>
          </div>
          <div>
            <label className="label">Início</label>
            <input type="date" className="input" value={inicio} onChange={(e) => setInicio(e.target.value)} />
          </div>
          <div>
            <label className="label">Fim</label>
            <input type="date" className="input" value={fim} onChange={(e) => setFim(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-3">
          <FileBarChart className="h-5 w-5 text-brand-500" />
          <h3 className="font-semibold text-slate-900">{titles[tipo]}</h3>
          <span className="ml-auto text-xs text-slate-500">{data.rows.length} registro(s)</span>
        </div>

        {data.rows.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-400">
            Nenhum dado encontrado para os filtros informados.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                  {data.headers.map((h) => (
                    <th key={h} className="pb-2 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.rows.map((row, i) => (
                  <tr key={i}>
                    {Object.entries(row).map(([k, v], j) => (
                      <td key={j} className="py-2 text-slate-700">
                        {typeof v === "number" && k.match(/total|receita|custo|lucro|valor/i)
                          ? fmtCurrency(v)
                          : String(v)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              {data.total !== 0 && (
                <tfoot className="border-t border-slate-200 bg-slate-50">
                  <tr>
                    <td colSpan={data.headers.length - 1} className="py-2 text-right font-semibold">
                      Total:
                    </td>
                    <td className="py-2 font-bold text-brand-600">{fmtCurrency(data.total)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const titles: Record<ReportType, string> = {
  "vendas-periodo": "Vendas por Período",
  "estoque-baixo": "Produtos com Estoque Baixo",
  lucratividade: "Lucratividade por Produto",
  movimentacoes: "Histórico de Movimentações",
  vendedores: "Desempenho de Vendedores",
  fluxo: "Fluxo Financeiro",
};
