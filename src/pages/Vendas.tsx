import { useState, useMemo } from "react";
import { Plus, Search, Trash2, Eye, Ban, CheckCircle2, Receipt } from "lucide-react";
import { useData } from "../store";
import { useToast } from "../toast";
import Modal from "../components/Modal";
import { fmtCurrency, fmtDate } from "../utils";
import type { Venda, VendaItem, FormaPagamento, VendaStatus } from "../types";

export default function Vendas() {
  const { db, currentUser, criarVenda, finalizarOrcamento, cancelarVenda } = useData();
  const { notify } = useToast();
  const [novoOpen, setNovoOpen] = useState(false);
  const [verVenda, setVerVenda] = useState<Venda | null>(null);
  const [cancVenda, setCancVenda] = useState<Venda | null>(null);
  const [motivoCanc, setMotivoCanc] = useState("");
  const [search, setSearch] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<VendaStatus | "TODOS">("TODOS");

  const filtered = db.vendas.filter((v) => {
    const matchSearch =
      !search ||
      [String(v.numero), v.clienteNome, v.vendedorNome].some((s) =>
        s.toLowerCase().includes(search.toLowerCase())
      );
    const matchStatus = statusFiltro === "TODOS" || v.status === statusFiltro;
    return matchSearch && matchStatus;
  });

  // Form state
  const [clienteId, setClienteId] = useState("");
  const [itens, setItens] = useState<VendaItem[]>([]);
  const [pagto, setPagto] = useState<FormaPagamento>("PIX");
  const [prodSel, setProdSel] = useState("");
  const [qtdSel, setQtdSel] = useState(1);

  function resetForm() {
    setClienteId("");
    setItens([]);
    setPagto("PIX");
    setProdSel("");
    setQtdSel(1);
  }

  const total = useMemo(() => itens.reduce((s, i) => s + i.subtotal, 0), [itens]);

  function addItem() {
    const p = db.produtos.find((x) => x.id === prodSel);
    if (!p) {
      notify("Selecione um produto.", "error");
      return;
    }
    if (qtdSel <= 0) {
      notify("Quantidade inválida.", "error");
      return;
    }
    const existing = itens.find((i) => i.produtoId === p.id);
    const newQtd = (existing?.quantidade || 0) + qtdSel;
    if (newQtd > p.estoque) {
      notify(`Estoque insuficiente. Disponível: ${p.estoque}`, "error");
      return;
    }
    if (existing) {
      setItens((arr) =>
        arr.map((i) =>
          i.produtoId === p.id
            ? { ...i, quantidade: newQtd, subtotal: newQtd * i.precoUnitario }
            : i
        )
      );
    } else {
      setItens((arr) => [
        ...arr,
        {
          produtoId: p.id,
          descricao: p.descricao,
          quantidade: qtdSel,
          precoUnitario: p.precoVenda,
          subtotal: qtdSel * p.precoVenda,
        },
      ]);
    }
    setProdSel("");
    setQtdSel(1);
  }

  function removerItem(id: string) {
    setItens((arr) => arr.filter((i) => i.produtoId !== id));
  }

  function salvar(status: "ORCAMENTO" | "FINALIZADA") {
    const r = criarVenda(clienteId, itens, pagto, status);
    notify(r.msg, r.ok ? "success" : "error");
    if (r.ok) {
      setNovoOpen(false);
      resetForm();
    }
  }

  function handleFinalizar(v: Venda) {
    const r = finalizarOrcamento(v.id);
    notify(r.msg, r.ok ? "success" : "error");
  }

  function handleCancelar() {
    if (!cancVenda) return;
    const r = cancelarVenda(cancVenda.id, motivoCanc);
    notify(r.msg, r.ok ? "success" : "error");
    if (r.ok) {
      setCancVenda(null);
      setMotivoCanc("");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vendas</h1>
          <p className="text-sm text-slate-500">Registro de vendas e orçamentos</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setNovoOpen(true);
          }}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" /> Nova Venda
        </button>
      </div>

      <div className="card p-4">
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr,200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por número, cliente ou vendedor..."
              className="input pl-9"
            />
          </div>
          <select className="input" value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value as any)}>
            <option value="TODOS">Todos status</option>
            <option value="FINALIZADA">Finalizada</option>
            <option value="ORCAMENTO">Orçamento</option>
            <option value="CANCELADA">Cancelada</option>
            <option value="PENDENTE">Pendente</option>
            <option value="ESTORNADA">Estornada</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                <th className="pb-2 font-semibold">Nº</th>
                <th className="pb-2 font-semibold">Cliente</th>
                <th className="pb-2 font-semibold">Vendedor</th>
                <th className="pb-2 font-semibold">Pagto</th>
                <th className="pb-2 font-semibold">Status</th>
                <th className="pb-2 font-semibold">Data</th>
                <th className="pb-2 text-right font-semibold">Total</th>
                <th className="pb-2 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((v) => (
                <tr key={v.id}>
                  <td className="py-3 font-mono font-semibold text-slate-900">#{v.numero}</td>
                  <td className="py-3">{v.clienteNome}</td>
                  <td className="py-3 text-slate-600">{v.vendedorNome}</td>
                  <td className="py-3">
                    <span className="badge bg-slate-100 text-slate-700">{v.formaPagamento}</span>
                  </td>
                  <td className="py-3">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="py-3 text-xs text-slate-500">{fmtDate(v.data)}</td>
                  <td className="py-3 text-right font-semibold">{fmtCurrency(v.total)}</td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setVerVenda(v)} className="btn-ghost text-xs">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      {v.status === "ORCAMENTO" && (
                        <button
                          onClick={() => handleFinalizar(v)}
                          className="btn-ghost text-xs text-emerald-700"
                          title="Finalizar venda"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {v.status === "FINALIZADA" && currentUser?.perfil === "ADMIN" && (
                        <button
                          onClick={() => {
                            setCancVenda(v);
                            setMotivoCanc("");
                          }}
                          className="btn-ghost text-xs text-rose-600"
                          title="Cancelar venda"
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
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Nenhuma venda encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nova Venda */}
      <Modal
        open={novoOpen}
        onClose={() => setNovoOpen(false)}
        title="Nova Venda / Orçamento"
        size="xl"
        footer={
          <>
            <button onClick={() => setNovoOpen(false)} className="btn-secondary">
              Cancelar
            </button>
            <button onClick={() => salvar("ORCAMENTO")} className="btn-secondary">
              <Receipt className="h-4 w-4" /> Salvar Orçamento
            </button>
            <button onClick={() => salvar("FINALIZADA")} className="btn-primary">
              <CheckCircle2 className="h-4 w-4" /> Finalizar Venda
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Cliente *</label>
              <select className="input" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                <option value="">Selecione um cliente</option>
                {db.clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} - {c.documento}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Forma de Pagamento</label>
              <select className="input" value={pagto} onChange={(e) => setPagto(e.target.value as FormaPagamento)}>
                <option value="DINHEIRO">Dinheiro</option>
                <option value="PIX">PIX</option>
                <option value="DEBITO">Cartão Débito</option>
                <option value="CREDITO">Cartão Crédito</option>
                <option value="BOLETO">Boleto</option>
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-3">
            <p className="mb-2 text-sm font-semibold text-slate-700">Adicionar item</p>
            <div className="grid gap-3 md:grid-cols-[1fr,120px,auto]">
              <select className="input" value={prodSel} onChange={(e) => setProdSel(e.target.value)}>
                <option value="">Selecione um produto</option>
                {db.produtos.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.estoque <= 0}>
                    {p.descricao} - {fmtCurrency(p.precoVenda)} (estq: {p.estoque})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                className="input"
                value={qtdSel}
                onChange={(e) => setQtdSel(parseInt(e.target.value) || 1)}
              />
              <button onClick={addItem} className="btn-primary">
                <Plus className="h-4 w-4" /> Adicionar
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs uppercase text-slate-500">
                  <th className="px-3 py-2 font-semibold">Produto</th>
                  <th className="px-3 py-2 text-right font-semibold">Qtd</th>
                  <th className="px-3 py-2 text-right font-semibold">Unit.</th>
                  <th className="px-3 py-2 text-right font-semibold">Subtotal</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {itens.map((i) => (
                  <tr key={i.produtoId}>
                    <td className="px-3 py-2">{i.descricao}</td>
                    <td className="px-3 py-2 text-right">{i.quantidade}</td>
                    <td className="px-3 py-2 text-right">{fmtCurrency(i.precoUnitario)}</td>
                    <td className="px-3 py-2 text-right font-semibold">{fmtCurrency(i.subtotal)}</td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => removerItem(i.produtoId)} className="text-rose-600">
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
                  <td colSpan={3} className="px-3 py-2 text-right font-semibold text-slate-700">
                    Total:
                  </td>
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

      {/* Ver venda */}
      <Modal
        open={!!verVenda}
        onClose={() => setVerVenda(null)}
        title={`Venda #${verVenda?.numero || ""}`}
        size="lg"
      >
        {verVenda && (
          <div className="space-y-3 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field k="Cliente" v={verVenda.clienteNome} />
              <Field k="Vendedor" v={verVenda.vendedorNome} />
              <Field k="Forma de Pagamento" v={verVenda.formaPagamento} />
              <Field k="Status" v={<StatusBadge status={verVenda.status} />} />
              <Field k="Data" v={fmtDate(verVenda.data)} />
              <Field k="Total" v={<strong className="text-brand-600">{fmtCurrency(verVenda.total)}</strong>} />
            </div>
            {verVenda.status === "CANCELADA" && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-900">
                <p className="font-semibold">Venda cancelada</p>
                <p className="text-xs">Por: {verVenda.canceladaPor} em {fmtDate(verVenda.canceladaEm!)}</p>
                <p className="mt-1 text-xs">Motivo: {verVenda.motivoCancelamento}</p>
              </div>
            )}
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs uppercase text-slate-500">
                    <th className="px-3 py-2">Produto</th>
                    <th className="px-3 py-2 text-right">Qtd</th>
                    <th className="px-3 py-2 text-right">Unit.</th>
                    <th className="px-3 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {verVenda.itens.map((i) => (
                    <tr key={i.produtoId}>
                      <td className="px-3 py-2">{i.descricao}</td>
                      <td className="px-3 py-2 text-right">{i.quantidade}</td>
                      <td className="px-3 py-2 text-right">{fmtCurrency(i.precoUnitario)}</td>
                      <td className="px-3 py-2 text-right font-semibold">{fmtCurrency(i.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancelar */}
      <Modal
        open={!!cancVenda}
        onClose={() => setCancVenda(null)}
        title={`Cancelar Venda #${cancVenda?.numero || ""}`}
        size="md"
        footer={
          <>
            <button onClick={() => setCancVenda(null)} className="btn-secondary">
              Voltar
            </button>
            <button onClick={handleCancelar} className="btn-danger">
              <Ban className="h-4 w-4" /> Confirmar Cancelamento
            </button>
          </>
        }
      >
        {cancVenda && (
          <div className="space-y-3 text-sm">
            <div className="rounded-lg bg-amber-50 p-3 text-amber-900">
              <p className="font-semibold">Atenção</p>
              <p className="text-xs">
                Ao cancelar, o estoque será restaurado, o financeiro estornado e a operação registrada
                em auditoria. Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p>
                <span className="text-slate-500">Cliente:</span> {cancVenda.clienteNome}
              </p>
              <p>
                <span className="text-slate-500">Total:</span> {fmtCurrency(cancVenda.total)}
              </p>
              <p>
                <span className="text-slate-500">Itens:</span> {cancVenda.itens.length}
              </p>
            </div>
            <div>
              <label className="label">Motivo do cancelamento *</label>
              <textarea
                className="input min-h-[80px]"
                value={motivoCanc}
                onChange={(e) => setMotivoCanc(e.target.value)}
                placeholder="Descreva o motivo do cancelamento..."
              />
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
