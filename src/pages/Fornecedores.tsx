import { useState } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useData } from "../store";
import { useToast } from "../toast";
import Modal from "../components/Modal";
import { maskCpfCnpj, maskPhone } from "../utils";
import type { Fornecedor } from "../types";

const empty: Omit<Fornecedor, "id" | "criadoEm"> = {
  nomeFantasia: "",
  cnpj: "",
  telefone: "",
  endereco: "",
  produtosFornecidos: "",
};

export default function Fornecedores() {
  const { db, createFornecedor, updateFornecedor, deleteFornecedor } = useData();
  const { notify } = useToast();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(empty);

  const filtered = db.fornecedores.filter((f) =>
    [f.nomeFantasia, f.cnpj].some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  function openNew() {
    setEditId(null);
    setForm(empty);
    setOpen(true);
  }
  function openEdit(f: Fornecedor) {
    setEditId(f.id);
    setForm({
      nomeFantasia: f.nomeFantasia,
      cnpj: f.cnpj,
      telefone: f.telefone,
      endereco: f.endereco,
      produtosFornecidos: f.produtosFornecidos,
    });
    setOpen(true);
  }
  function handleSave() {
    if (editId) {
      updateFornecedor(editId, form);
      notify("Fornecedor atualizado com sucesso.", "success");
      setOpen(false);
    } else {
      const r = createFornecedor(form);
      notify(r.msg, r.ok ? "success" : "error");
      if (r.ok) setOpen(false);
    }
  }
  function handleDelete(f: Fornecedor) {
    if (confirm(`Remover fornecedor "${f.nomeFantasia}"?`)) {
      deleteFornecedor(f.id);
      notify("Fornecedor removido.", "success");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fornecedores</h1>
          <p className="text-sm text-slate-500">{db.fornecedores.length} fornecedor(es) cadastrado(s)</p>
        </div>
        <button onClick={openNew} className="btn-primary">
          <Plus className="h-4 w-4" /> Novo Fornecedor
        </button>
      </div>

      <div className="card p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou CNPJ..."
            className="input pl-9"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                <th className="pb-2 font-semibold">Nome Fantasia</th>
                <th className="pb-2 font-semibold">CNPJ</th>
                <th className="pb-2 font-semibold">Telefone</th>
                <th className="pb-2 font-semibold">Produtos Fornecidos</th>
                <th className="pb-2 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((f) => (
                <tr key={f.id}>
                  <td className="py-3 font-medium text-slate-900">{f.nomeFantasia}</td>
                  <td className="py-3 text-slate-700">{f.cnpj}</td>
                  <td className="py-3 text-slate-600">{f.telefone}</td>
                  <td className="py-3 text-slate-600">{f.produtosFornecidos}</td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(f)} className="btn-ghost text-xs">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(f)} className="btn-ghost text-xs text-rose-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Nenhum fornecedor encontrado.
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
        title={editId ? "Editar Fornecedor" : "Novo Fornecedor"}
        size="lg"
        footer={
          <>
            <button onClick={() => setOpen(false)} className="btn-secondary">Cancelar</button>
            <button onClick={handleSave} className="btn-primary">Salvar</button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Nome Fantasia</label>
            <input className="input" value={form.nomeFantasia}
              onChange={(e) => setForm({ ...form, nomeFantasia: e.target.value })} />
          </div>
          <div>
            <label className="label">CNPJ</label>
            <input className="input" value={form.cnpj}
              onChange={(e) => setForm({ ...form, cnpj: maskCpfCnpj(e.target.value) })} />
          </div>
          <div>
            <label className="label">Telefone</label>
            <input className="input" value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: maskPhone(e.target.value) })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Endereço</label>
            <input className="input" value={form.endereco}
              onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Produtos Fornecidos</label>
            <input className="input" value={form.produtosFornecidos}
              onChange={(e) => setForm({ ...form, produtosFornecidos: e.target.value })}
              placeholder="Ex: Filtros, Velas, Sensores" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
