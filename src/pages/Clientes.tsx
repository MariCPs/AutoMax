import { useState } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useData } from "../store";
import { useToast } from "../toast";
import Modal from "../components/Modal";
import { maskCpfCnpj, maskPhone } from "../utils";
import type { Cliente, ClienteTipo } from "../types";

const empty: Omit<Cliente, "id" | "criadoEm"> = {
  nome: "",
  documento: "",
  tipo: "PF",
  telefone: "",
  email: "",
  endereco: "",
};

export default function Clientes() {
  const { db, createCliente, updateCliente, deleteCliente } = useData();
  const { notify } = useToast();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(empty);

  const filtered = db.clientes.filter((c) =>
    [c.nome, c.documento, c.email].some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  function openNew() {
    setEditId(null);
    setForm(empty);
    setOpen(true);
  }
  function openEdit(c: Cliente) {
    setEditId(c.id);
    setForm({
      nome: c.nome,
      documento: c.documento,
      tipo: c.tipo,
      telefone: c.telefone,
      email: c.email,
      endereco: c.endereco,
    });
    setOpen(true);
  }
  function handleSave() {
    if (editId) {
      updateCliente(editId, form);
      notify("Cliente atualizado com sucesso.", "success");
      setOpen(false);
    } else {
      const r = createCliente(form);
      notify(r.msg, r.ok ? "success" : "error");
      if (r.ok) setOpen(false);
    }
  }
  function handleDelete(c: Cliente) {
    if (confirm(`Remover cliente "${c.nome}"?`)) {
      deleteCliente(c.id);
      notify("Cliente removido.", "success");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-500">{db.clientes.length} cliente(s) cadastrado(s)</p>
        </div>
        <button onClick={openNew} className="btn-primary">
          <Plus className="h-4 w-4" /> Novo Cliente
        </button>
      </div>

      <div className="card p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, documento ou e-mail..."
            className="input pl-9"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                <th className="pb-2 font-semibold">Nome / Razão Social</th>
                <th className="pb-2 font-semibold">Documento</th>
                <th className="pb-2 font-semibold">Tipo</th>
                <th className="pb-2 font-semibold">Telefone</th>
                <th className="pb-2 font-semibold">E-mail</th>
                <th className="pb-2 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td className="py-3 font-medium text-slate-900">{c.nome}</td>
                  <td className="py-3 text-slate-700">{c.documento}</td>
                  <td className="py-3">
                    <span className="badge bg-slate-100 text-slate-700">{c.tipo}</span>
                  </td>
                  <td className="py-3 text-slate-600">{c.telefone}</td>
                  <td className="py-3 text-slate-600">{c.email}</td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="btn-ghost text-xs">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(c)} className="btn-ghost text-xs text-rose-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Nenhum cliente encontrado.
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
        title={editId ? "Editar Cliente" : "Novo Cliente"}
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
            <label className="label">Nome / Razão Social</label>
            <input className="input" value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </div>
          <div>
            <label className="label">Tipo</label>
            <select className="input" value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value as ClienteTipo })}>
              <option value="PF">Pessoa Física (CPF)</option>
              <option value="PJ">Pessoa Jurídica (CNPJ)</option>
            </select>
          </div>
          <div>
            <label className="label">{form.tipo === "PF" ? "CPF" : "CNPJ"}</label>
            <input className="input" value={form.documento}
              onChange={(e) => setForm({ ...form, documento: maskCpfCnpj(e.target.value) })} />
          </div>
          <div>
            <label className="label">Telefone</label>
            <input className="input" value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: maskPhone(e.target.value) })} />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input className="input" type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Endereço</label>
            <input className="input" value={form.endereco}
              onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
