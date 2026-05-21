import { useState } from "react";
import { Plus, Search, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { useData } from "../store";
import { useToast } from "../toast";
import Modal from "../components/Modal";
import { fmtCurrency } from "../utils";
import type { Produto } from "../types";

type FormProduto = Omit<Produto, "id" | "criadoEm">;

const empty: FormProduto = {
  codigoInterno: "",
  descricao: "",
  marca: "",
  fabricante: "",
  codigoBarras: "",
  compatibilidade: "",
  precoCusto: 0,
  precoVenda: 0,
  categoria: "",
  localizacao: "",
  estoque: 0,
  estoqueMinimo: 5,
  ativo: true,
};

export default function Produtos() {
  const { db, createProduto, updateProduto, deleteProduto } = useData();
  const { notify } = useToast();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filtroCat, setFiltroCat] = useState("");
  const [form, setForm] = useState<FormProduto>(empty);

  const categorias = Array.from(new Set(db.produtos.map((p) => p.categoria))).sort();

  const filtered = db.produtos.filter((p) => {
    const matchSearch =
      !search ||
      [p.descricao, p.codigoInterno, p.codigoBarras, p.marca].some((s) =>
        s.toLowerCase().includes(search.toLowerCase())
      );
    const matchCat = !filtroCat || p.categoria === filtroCat;
    return matchSearch && matchCat;
  });

  function openNew() {
    setEditId(null);
    setForm(empty);
    setOpen(true);
  }
  function openEdit(p: Produto) {
    setEditId(p.id);
    setForm({ ...p });
    setOpen(true);
  }
  function handleSave() {
    if (editId) {
      if (form.precoVenda <= form.precoCusto) {
        notify("Preço de venda deve ser maior que o de custo.", "error");
        return;
      }
      updateProduto(editId, form);
      notify("Produto atualizado com sucesso.", "success");
      setOpen(false);
    } else {
      const r = createProduto(form);
      notify(r.msg, r.ok ? "success" : "error");
      if (r.ok) setOpen(false);
    }
  }
  function handleDelete(p: Produto) {
    if (!confirm(`Remover produto "${p.descricao}"?`)) return;
    const r = deleteProduto(p.id);
    notify(r.msg, r.ok ? "success" : "error");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Produtos</h1>
          <p className="text-sm text-slate-500">{db.produtos.length} produto(s) cadastrado(s)</p>
        </div>
        <button onClick={openNew} className="btn-primary">
          <Plus className="h-4 w-4" /> Novo Produto
        </button>
      </div>

      <div className="card p-4">
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr,200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por descrição, código ou marca..."
              className="input pl-9"
            />
          </div>
          <select className="input" value={filtroCat} onChange={(e) => setFiltroCat(e.target.value)}>
            <option value="">Todas as categorias</option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                <th className="pb-2 font-semibold">Código</th>
                <th className="pb-2 font-semibold">Descrição</th>
                <th className="pb-2 font-semibold">Marca</th>
                <th className="pb-2 font-semibold">Categoria</th>
                <th className="pb-2 text-right font-semibold">Custo</th>
                <th className="pb-2 text-right font-semibold">Venda</th>
                <th className="pb-2 text-right font-semibold">Estoque</th>
                <th className="pb-2 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => {
                const baixo = p.estoque <= p.estoqueMinimo;
                return (
                  <tr key={p.id}>
                    <td className="py-3 font-mono text-xs text-slate-600">{p.codigoInterno}</td>
                    <td className="py-3 font-medium text-slate-900">{p.descricao}</td>
                    <td className="py-3 text-slate-600">{p.marca}</td>
                    <td className="py-3">
                      <span className="badge bg-slate-100 text-slate-700">{p.categoria}</span>
                    </td>
                    <td className="py-3 text-right text-slate-600">{fmtCurrency(p.precoCusto)}</td>
                    <td className="py-3 text-right font-semibold text-slate-900">
                      {fmtCurrency(p.precoVenda)}
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`badge ${baixo ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}
                      >
                        {baixo && <AlertTriangle className="h-3 w-3" />}
                        {p.estoque} un.
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="btn-ghost text-xs">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDelete(p)} className="btn-ghost text-xs text-rose-600">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Nenhum produto encontrado.
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
        title={editId ? "Editar Produto" : "Novo Produto"}
        size="xl"
        footer={
          <>
            <button onClick={() => setOpen(false)} className="btn-secondary">Cancelar</button>
            <button onClick={handleSave} className="btn-primary">Salvar</button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="label">Código Interno</label>
            <input className="input" placeholder="(auto se vazio)" value={form.codigoInterno}
              onChange={(e) => setForm({ ...form, codigoInterno: e.target.value })} />
          </div>
          <div className="lg:col-span-2">
            <label className="label">Descrição</label>
            <input className="input" value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
          </div>
          <div>
            <label className="label">Marca</label>
            <input className="input" value={form.marca}
              onChange={(e) => setForm({ ...form, marca: e.target.value })} />
          </div>
          <div>
            <label className="label">Fabricante</label>
            <input className="input" value={form.fabricante}
              onChange={(e) => setForm({ ...form, fabricante: e.target.value })} />
          </div>
          <div>
            <label className="label">Código de Barras</label>
            <input className="input" value={form.codigoBarras}
              onChange={(e) => setForm({ ...form, codigoBarras: e.target.value })} />
          </div>
          <div className="lg:col-span-2">
            <label className="label">Compatibilidade</label>
            <input className="input" value={form.compatibilidade}
              onChange={(e) => setForm({ ...form, compatibilidade: e.target.value })}
              placeholder="Ex: VW Gol 2010-2015" />
          </div>
          <div>
            <label className="label">Categoria</label>
            <input className="input" value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
          </div>
          <div>
            <label className="label">Preço de Custo (R$)</label>
            <input className="input" type="number" min="0" step="0.01"
              value={form.precoCusto}
              onChange={(e) => setForm({ ...form, precoCusto: parseFloat(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="label">Preço de Venda (R$)</label>
            <input className="input" type="number" min="0" step="0.01"
              value={form.precoVenda}
              onChange={(e) => setForm({ ...form, precoVenda: parseFloat(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="label">Localização Física</label>
            <input className="input" value={form.localizacao}
              onChange={(e) => setForm({ ...form, localizacao: e.target.value })}
              placeholder="Ex: A1-04" />
          </div>
          <div>
            <label className="label">Estoque Inicial</label>
            <input className="input" type="number" min="0"
              value={form.estoque}
              disabled={!!editId}
              onChange={(e) => setForm({ ...form, estoque: parseInt(e.target.value) || 0 })} />
            {editId && <p className="mt-1 text-xs text-slate-400">Use o módulo de Estoque para ajustar.</p>}
          </div>
          <div>
            <label className="label">Estoque Mínimo</label>
            <input className="input" type="number" min="0"
              value={form.estoqueMinimo}
              onChange={(e) => setForm({ ...form, estoqueMinimo: parseInt(e.target.value) || 0 })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
