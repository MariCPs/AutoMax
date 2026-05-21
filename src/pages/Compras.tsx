import { useState, useMemo } from "react";
import { Plus, Trash2, Eye, ClipboardList } from "lucide-react";
import { useData } from "../store";
import { useToast } from "../toast";
import Modal from "../components/Modal";
import { fmtCurrency, fmtDate } from "../utils";
import type { Compra, CompraItem } from "../types";

export default function Compras() {
  const { db, criarCompra } = useData();
  const { notify } = useToast();
  const [open, setOpen] = useState(false);
  const [verCompra, setVerCompra] = useState<Compra | null>(null);

  const [fornecedorId, setFornecedorId] = useState("");
  const [numNota, setNumNota] = useState("");
  const [dataEmissao, setDataEmissao] = useState(() => new Date().toISOString().slice(0, 10));
  const [itens, setItens] = useState<CompraItem[]>([]);
  const [prodSel, setProdSel] = useState("");
  const [qtdSel, setQtdSel] = useState(1);
  const [custoSel, setCustoSel] = useState(0);

  function reset() {
    setFornecedorId("");
    setNumNota("");
    setDataEmissao(new Date().toISOString().slice(0, 10));
    setItens([]);
    setProdSel("");
    setQtdSel(1);
    setCustoSel(0);
  }

  const total = useMemo(() => itens.reduce((s, i) => s + i.subtotal, 0), [itens]);

  function addItem() {
    const p = db.produtos.find((x) => x.id === prodSel);
    if (!p) {
      notify("Selecione um produto.", "error");
      return;
    }
    if (qtdSel <= 0 || custoSel <= 0) {
      notify("Quantidade e custo devem ser maiores que zero.", "error");
      return;
    }
    setItens((arr) => [
      ...arr,
      {
        produtoId: p.id,
        descricao: p.descricao,
        quantidade: qtdSel,
        precoCusto: custoSel,
        subtotal: qtdSel * custoSel,
      },
    ]);
    setProdSel("");
    setQtdSel(1);
    setCustoSel(0);
  }

  function removerItem(idx: number) {
    setItens((arr) => arr.filter((_, i) => i !== idx));
  }

  function salvar() {
    const r = criarCompra(fornecedorId, numNota, dataEmissao, itens);
    notify(r.msg, r.ok ? "success" : "error");
    if (r.ok) {
      setOpen(false);
      reset();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Compras</h1>
          <p className="text-sm text-slate-500">Entradas de mercadoria e notas fiscais</p>
        </div>
        <button onClick={() => { reset(); setOpen(true); }} className="btn-primary">
          <Plus className="h-4 w-4" /> Nova Entrada
        </button>
      </div>

      <div className="card p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                <th className="pb-2 font-semibold">Nº</th>
                <th className="pb-2 font-semibold">Fornecedor</th>
                <th className="pb-2 font-semibold">NF</th>
                <th className="pb-2 font-semibold">Emissão</th>
                <th className="pb-2 font-semibold">Itens</th>
                <th className="pb-2 font-semibold">Registrado por</th>
                <th className="pb-2 text-right font-semibold">Total</th>
                <th className="pb-2 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {db.compras.map((c) => (
                <tr key={c.id}>
                  <td className="py-3 font-mono font-semibold text-slate-900">#{c.numero}</td>
                  <td className="py-3">{c.fornecedorNome}</td>
                  <td className="py-3 text-slate-600">{c.numeroNota}</td>
                  <td className="py-3 text-slate-600">{c.dataEmissao}</td>
                  <td className="py-3 text-slate-600">{c.itens.length}</td>
                  <td className="py-3 text-slate-600">{c.usuarioNome}</td>
                  <td className="py-3 text-right font-semibold">{fmtCurrency(c.total)}</td>
                  <td className="py-3 text-right">
                    <button onClick={() => setVerCompra(c)} className="btn-ghost text-xs">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {db.compras.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    <ClipboardList className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    Nenhuma entrada de mercadoria registrada.
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
        title="Nova Entrada de Mercadorias"
        size="xl"
        footer={
          <>
            <button onClick={() => setOpen(false)} className="btn-secondary">Cancelar</button>
            <button onClick={salvar} className="btn-primary">Finalizar Entrada</button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="label">Fornecedor *</label>
              <select className="input" value={fornecedorId} onChange={(e) => setFornecedorId(e.target.value)}>
                <option value="">Selecione</option>
                {db.fornecedores.map((f) => (
                  <option key={f.id} value={f.id}>{f.nomeFantasia}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Nº Nota Fiscal *</label>
              <input className="input" value={numNota} onChange={(e) => setNumNota(e.target.value)} />
            </div>
            <div>
              <label className="label">Data de Emissão</label>
              <input type="date" className="input" value={dataEmissao}
                onChange={(e) => setDataEmissao(e.target.value)} />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-3">
            <p className="mb-2 text-sm font-semibold text-slate-700">Adicionar produto</p>
            <div className="grid gap-3 md:grid-cols-[1fr,100px,140px,auto]">
              <select className="input" value={prodSel}
                onChange={(e) => {
                  setProdSel(e.target.value);
                  const p = db.produtos.find((x) => x.id === e.target.value);
                  if (p) setCustoSel(p.precoCusto);
                }}>
                <option value="">Selecione um produto</option>
                {db.produtos.map((p) => (
                  <option key={p.id} value={p.id}>{p.descricao}</option>
                ))}
              </select>
              <input type="number" min="1" className="input" placeholder="Qtd"
                value={qtdSel} onChange={(e) => setQtdSel(parseInt(e.target.value) || 1)} />
              <input type="number" min="0" step="0.01" className="input" placeholder="Custo"
                value={custoSel} onChange={(e) => setCustoSel(parseFloat(e.target.value) || 0)} />
              <button onClick={addItem} className="btn-primary">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs uppercase text-slate-500">
                  <th className="px-3 py-2 font-semibold">Produto</th>
                  <th className="px-3 py-2 text-right font-semibold">Qtd</th>
                  <th className="px-3 py-2 text-right font-semibold">Custo</th>
                  <th className="px-3 py-2 text-right font-semibold">Subtotal</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {itens.map((i, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2">{i.descricao}</td>
                    <td className="px-3 py-2 text-right">{i.quantidade}</td>
                    <td className="px-3 py-2 text-right">{fmtCurrency(i.precoCusto)}</td>
                    <td className="px-3 py-2 text-right font-semibold">{fmtCurrency(i.subtotal)}</td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => removerItem(idx)} className="text-rose-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {itens.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-sm text-slate-400">
                      Nenhum item adicionado.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-slate-50">
                <tr>
                  <td colSpan={3} className="px-3 py-2 text-right font-semibold">Total:</td>
                  <td className="px-3 py-2 text-right text-lg font-bold text-brand-600">
                    {fmtCurrency(total)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </Modal>

      <Modal open={!!verCompra} onClose={() => setVerCompra(null)}
        title={`Compra #${verCompra?.numero || ""}`} size="lg">
        {verCompra && (
          <div className="space-y-3 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field k="Fornecedor" v={verCompra.fornecedorNome} />
              <Field k="NF" v={verCompra.numeroNota} />
              <Field k="Data Emissão" v={verCompra.dataEmissao} />
              <Field k="Registrado por" v={verCompra.usuarioNome} />
              <Field k="Data" v={fmtDate(verCompra.data)} />
              <Field k="Total" v={<strong className="text-brand-600">{fmtCurrency(verCompra.total)}</strong>} />
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs uppercase text-slate-500">
                    <th className="px-3 py-2">Produto</th>
                    <th className="px-3 py-2 text-right">Qtd</th>
                    <th className="px-3 py-2 text-right">Custo</th>
                    <th className="px-3 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {verCompra.itens.map((i, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2">{i.descricao}</td>
                      <td className="px-3 py-2 text-right">{i.quantidade}</td>
                      <td className="px-3 py-2 text-right">{fmtCurrency(i.precoCusto)}</td>
                      <td className="px-3 py-2 text-right font-semibold">{fmtCurrency(i.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Field({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{k}</p>
      <div className="mt-1 text-slate-900">{v}</div>
    </div>
  );
}
