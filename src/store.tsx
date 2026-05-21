import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type {
  AuditoriaLog,
  Cliente,
  Compra,
  Fornecedor,
  LancamentoFinanceiro,
  MovimentacaoEstoque,
  Produto,
  User,
  Venda,
  VendaItem,
  CompraItem,
  AuditAcao,
} from "./types";

const STORAGE_KEY = "automax_db_v1";
const SESSION_KEY = "automax_session_v1";

type DB = {
  users: User[];
  clientes: Cliente[];
  fornecedores: Fornecedor[];
  produtos: Produto[];
  movimentacoes: MovimentacaoEstoque[];
  vendas: Venda[];
  compras: Compra[];
  financeiro: LancamentoFinanceiro[];
  auditoria: AuditoriaLog[];
  vendaSeq: number;
  compraSeq: number;
};

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const now = () => new Date().toISOString();

function seed(): DB {
  const admin: User = {
    id: uid(),
    nome: "Administrador",
    email: "admin@automax.com",
    login: "admin",
    senha: "admin123",
    perfil: "ADMIN",
    ativo: true,
    criadoEm: now(),
  };
  const vendedor: User = {
    id: uid(),
    nome: "Vicenzo Gabriel",
    email: "vendedor@automax.com",
    login: "vendedor",
    senha: "venda123",
    perfil: "VENDEDOR",
    ativo: true,
    criadoEm: now(),
  };
  const estoquista: User = {
    id: uid(),
    nome: "Maria Clara",
    email: "estoque@automax.com",
    login: "estoque",
    senha: "estoque123",
    perfil: "ESTOQUISTA",
    ativo: true,
    criadoEm: now(),
  };

  const cliente1: Cliente = {
    id: uid(),
    nome: "Leanderson Ferreira",
    documento: "123.456.789-00",
    tipo: "PF",
    telefone: "(11) 98888-1111",
    email: "leanderson@email.com",
    endereco: "Av. Paulista, 1000 - São Paulo/SP",
    criadoEm: now(),
  };
  const cliente2: Cliente = {
    id: uid(),
    nome: "Oficina Auto Center LTDA",
    documento: "12.345.678/0001-90",
    tipo: "PJ",
    telefone: "(11) 4002-8922",
    email: "contato@autocenter.com",
    endereco: "Rua das Oficinas, 250 - São Paulo/SP",
    criadoEm: now(),
  };

  const forn1: Fornecedor = {
    id: uid(),
    nomeFantasia: "Bosch Brasil",
    cnpj: "11.222.333/0001-44",
    telefone: "(11) 3030-4040",
    endereco: "Av. Industrial, 100 - Campinas/SP",
    produtosFornecidos: "Velas, Filtros, Sensores",
    criadoEm: now(),
  };
  const forn2: Fornecedor = {
    id: uid(),
    nomeFantasia: "NGK do Brasil",
    cnpj: "22.333.444/0001-55",
    telefone: "(11) 4040-5050",
    endereco: "Rua das Indústrias, 500 - Indaiatuba/SP",
    produtosFornecidos: "Velas de ignição, Cabos",
    criadoEm: now(),
  };

  const prod = (
    cod: string, descricao: string, marca: string, fab: string, barras: string,
    compat: string, custo: number, venda: number, cat: string, loc: string, estq: number
  ): Produto => ({
    id: uid(),
    codigoInterno: cod,
    descricao,
    marca,
    fabricante: fab,
    codigoBarras: barras,
    compatibilidade: compat,
    precoCusto: custo,
    precoVenda: venda,
    categoria: cat,
    localizacao: loc,
    estoque: estq,
    estoqueMinimo: 5,
    ativo: true,
    criadoEm: now(),
  });

  const produtos: Produto[] = [
    prod("AM0001", "Filtro de Óleo MotorMax", "Bosch", "Bosch", "7891234567890", "VW Gol/Voyage 1.0/1.6", 18, 39.9, "Filtros", "A1-01", 32),
    prod("AM0002", "Pastilha de Freio Dianteira", "Fras-le", "Fras-le", "7891234567891", "Honda Civic 2012-2016", 75, 159.9, "Freios", "B2-04", 18),
    prod("AM0003", "Vela de Ignição Iridium", "NGK", "NGK", "7891234567892", "Universal", 32, 79.9, "Ignição", "C1-08", 64),
    prod("AM0004", "Amortecedor Dianteiro", "Cofap", "Cofap", "7891234567893", "Fiat Palio 2008-2014", 180, 349.9, "Suspensão", "D3-02", 8),
    prod("AM0005", "Correia Dentada Kit", "Gates", "Gates", "7891234567894", "Chevrolet Onix 1.0", 220, 489.9, "Motor", "E1-05", 4),
    prod("AM0006", "Lâmpada LED H4", "Philips", "Philips", "7891234567895", "Universal", 45, 119.9, "Iluminação", "F2-01", 22),
    prod("AM0007", "Bateria 60Ah", "Moura", "Moura", "7891234567896", "Universal", 280, 549.9, "Elétrica", "G1-01", 12),
    prod("AM0008", "Filtro de Ar Esportivo", "K&N", "K&N", "7891234567897", "Universal", 90, 219.9, "Filtros", "A1-04", 15),
  ];

  const venda: Venda = {
    id: uid(),
    numero: 1001,
    clienteId: cliente1.id,
    clienteNome: cliente1.nome,
    vendedorId: vendedor.id,
    vendedorNome: vendedor.nome,
    itens: [
      { produtoId: produtos[0].id, descricao: produtos[0].descricao, quantidade: 2, precoUnitario: produtos[0].precoVenda, subtotal: produtos[0].precoVenda * 2 },
      { produtoId: produtos[2].id, descricao: produtos[2].descricao, quantidade: 4, precoUnitario: produtos[2].precoVenda, subtotal: produtos[2].precoVenda * 4 },
    ],
    total: produtos[0].precoVenda * 2 + produtos[2].precoVenda * 4,
    formaPagamento: "PIX",
    status: "FINALIZADA",
    data: now(),
  };

  return {
    users: [admin, vendedor, estoquista],
    clientes: [cliente1, cliente2],
    fornecedores: [forn1, forn2],
    produtos,
    movimentacoes: [],
    vendas: [venda],
    compras: [],
    financeiro: [
      {
        id: uid(),
        categoria: "Vendas",
        tipo: "RECEITA",
        valor: venda.total,
        vencimento: now(),
        descricao: `Venda #${venda.numero}`,
        status: "RECEBIDO",
        origemTipo: "VENDA",
        origemId: venda.id,
        criadoEm: now(),
      },
    ],
    auditoria: [],
    vendaSeq: 1002,
    compraSeq: 5001,
  };
}

function loadDB(): DB {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DB;
  } catch {}
  const fresh = seed();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

function saveDB(db: DB) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

interface DataContextValue {
  db: DB;
  currentUser: User | null;
  login: (login: string, senha: string) => { ok: boolean; msg: string };
  logout: () => void;
  // users
  createUser: (u: Omit<User, "id" | "criadoEm">) => { ok: boolean; msg: string };
  updateUser: (id: string, patch: Partial<User>) => void;
  toggleUserActive: (id: string) => void;
  // clientes
  createCliente: (c: Omit<Cliente, "id" | "criadoEm">) => { ok: boolean; msg: string };
  updateCliente: (id: string, patch: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
  // fornecedores
  createFornecedor: (f: Omit<Fornecedor, "id" | "criadoEm">) => { ok: boolean; msg: string };
  updateFornecedor: (id: string, patch: Partial<Fornecedor>) => void;
  deleteFornecedor: (id: string) => void;
  // produtos
  createProduto: (p: Omit<Produto, "id" | "criadoEm" | "codigoInterno"> & { codigoInterno?: string }) => { ok: boolean; msg: string };
  updateProduto: (id: string, patch: Partial<Produto>) => void;
  deleteProduto: (id: string) => { ok: boolean; msg: string };
  ajustarEstoque: (produtoId: string, novaQtd: number, motivo: string) => { ok: boolean; msg: string };
  // vendas
  criarVenda: (clienteId: string, itens: VendaItem[], formaPagamento: Venda["formaPagamento"], status: Venda["status"]) => { ok: boolean; msg: string; vendaId?: string };
  finalizarOrcamento: (vendaId: string) => { ok: boolean; msg: string };
  cancelarVenda: (vendaId: string, motivo: string) => { ok: boolean; msg: string };
  // compras
  criarCompra: (fornecedorId: string, numeroNota: string, dataEmissao: string, itens: CompraItem[]) => { ok: boolean; msg: string };
  // financeiro
  criarLancamento: (l: Omit<LancamentoFinanceiro, "id" | "criadoEm">) => { ok: boolean; msg: string };
  confirmarLancamento: (id: string) => void;
  estornarLancamento: (id: string) => void;
  // util
  resetDB: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [db, setDB] = useState<DB>(() => loadDB());
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const id = JSON.parse(raw) as string;
      const initial = loadDB();
      return initial.users.find((u) => u.id === id) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    saveDB(db);
  }, [db]);

  useEffect(() => {
    if (currentUser) localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser.id));
    else localStorage.removeItem(SESSION_KEY);
  }, [currentUser]);

  const audit = useCallback(
    (acao: AuditAcao, entidade: string, detalhes: string, user?: User | null) => {
      const u = user ?? currentUser;
      if (!u) return null;
      const log: AuditoriaLog = {
        id: uid(),
        data: now(),
        usuarioId: u.id,
        usuarioNome: u.nome,
        acao,
        entidade,
        detalhes,
      };
      return log;
    },
    [currentUser]
  );

  const login = useCallback(
    (loginStr: string, senha: string) => {
      const u = db.users.find(
        (x) => (x.login === loginStr || x.email === loginStr) && x.senha === senha
      );
      if (!u) return { ok: false, msg: "Login ou senha inválidos." };
      if (!u.ativo) return { ok: false, msg: "Usuário inativo." };
      setCurrentUser(u);
      const log = audit("LOGIN", "auth", `Login realizado: ${u.login}`, u);
      if (log) setDB((d) => ({ ...d, auditoria: [log, ...d.auditoria] }));
      return { ok: true, msg: "Login realizado com sucesso." };
    },
    [db.users, audit]
  );

  const logout = useCallback(() => {
    if (currentUser) {
      const log = audit("LOGOUT", "auth", `Logout: ${currentUser.login}`);
      if (log) setDB((d) => ({ ...d, auditoria: [log, ...d.auditoria] }));
    }
    setCurrentUser(null);
  }, [currentUser, audit]);

  // ---------- USERS ----------
  const createUser: DataContextValue["createUser"] = (u) => {
    if (db.users.some((x) => x.login === u.login)) return { ok: false, msg: "Login já cadastrado." };
    if (db.users.some((x) => x.email === u.email)) return { ok: false, msg: "E-mail já cadastrado." };
    if (u.senha.length < 6) return { ok: false, msg: "Senha mínima de 6 caracteres." };
    const newU: User = { ...u, id: uid(), criadoEm: now() };
    const log = audit("CREATE", "user", `Cadastrou usuário: ${newU.login}`);
    setDB((d) => ({ ...d, users: [...d.users, newU], auditoria: log ? [log, ...d.auditoria] : d.auditoria }));
    return { ok: true, msg: "Usuário cadastrado com sucesso." };
  };
  const updateUser: DataContextValue["updateUser"] = (id, patch) => {
    const log = audit("UPDATE", "user", `Atualizou usuário ${id}`);
    setDB((d) => ({
      ...d,
      users: d.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
      auditoria: log ? [log, ...d.auditoria] : d.auditoria,
    }));
  };
  const toggleUserActive: DataContextValue["toggleUserActive"] = (id) => {
    const u = db.users.find((x) => x.id === id);
    if (!u) return;
    const log = audit("UPDATE", "user", `${u.ativo ? "Inativou" : "Ativou"} usuário ${u.login}`);
    setDB((d) => ({
      ...d,
      users: d.users.map((x) => (x.id === id ? { ...x, ativo: !x.ativo } : x)),
      auditoria: log ? [log, ...d.auditoria] : d.auditoria,
    }));
  };

  // ---------- CLIENTES ----------
  const createCliente: DataContextValue["createCliente"] = (c) => {
    const doc = c.documento.replace(/\D/g, "");
    if (!doc) return { ok: false, msg: "CPF/CNPJ inválido." };
    if (db.clientes.some((x) => x.documento.replace(/\D/g, "") === doc))
      return { ok: false, msg: "CPF/CNPJ já cadastrado." };
    if (!c.nome || !c.telefone) return { ok: false, msg: "Campos obrigatórios faltando." };
    const newC: Cliente = { ...c, id: uid(), criadoEm: now() };
    const log = audit("CREATE", "cliente", `Cadastrou cliente: ${newC.nome}`);
    setDB((d) => ({ ...d, clientes: [...d.clientes, newC], auditoria: log ? [log, ...d.auditoria] : d.auditoria }));
    return { ok: true, msg: "Cliente cadastrado com sucesso." };
  };
  const updateCliente: DataContextValue["updateCliente"] = (id, patch) => {
    const log = audit("UPDATE", "cliente", `Atualizou cliente ${id}`);
    setDB((d) => ({
      ...d,
      clientes: d.clientes.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      auditoria: log ? [log, ...d.auditoria] : d.auditoria,
    }));
  };
  const deleteCliente: DataContextValue["deleteCliente"] = (id) => {
    const log = audit("DELETE", "cliente", `Removeu cliente ${id}`);
    setDB((d) => ({
      ...d,
      clientes: d.clientes.filter((c) => c.id !== id),
      auditoria: log ? [log, ...d.auditoria] : d.auditoria,
    }));
  };

  // ---------- FORNECEDORES ----------
  const createFornecedor: DataContextValue["createFornecedor"] = (f) => {
    const cnpj = f.cnpj.replace(/\D/g, "");
    if (!cnpj) return { ok: false, msg: "CNPJ inválido." };
    if (db.fornecedores.some((x) => x.cnpj.replace(/\D/g, "") === cnpj))
      return { ok: false, msg: "CNPJ já cadastrado." };
    if (!f.nomeFantasia || !f.telefone || !f.endereco)
      return { ok: false, msg: "Todos os campos são obrigatórios." };
    const newF: Fornecedor = { ...f, id: uid(), criadoEm: now() };
    const log = audit("CREATE", "fornecedor", `Cadastrou fornecedor: ${newF.nomeFantasia}`);
    setDB((d) => ({ ...d, fornecedores: [...d.fornecedores, newF], auditoria: log ? [log, ...d.auditoria] : d.auditoria }));
    return { ok: true, msg: "Fornecedor cadastrado com sucesso." };
  };
  const updateFornecedor: DataContextValue["updateFornecedor"] = (id, patch) => {
    const log = audit("UPDATE", "fornecedor", `Atualizou fornecedor ${id}`);
    setDB((d) => ({
      ...d,
      fornecedores: d.fornecedores.map((f) => (f.id === id ? { ...f, ...patch } : f)),
      auditoria: log ? [log, ...d.auditoria] : d.auditoria,
    }));
  };
  const deleteFornecedor: DataContextValue["deleteFornecedor"] = (id) => {
    const log = audit("DELETE", "fornecedor", `Removeu fornecedor ${id}`);
    setDB((d) => ({
      ...d,
      fornecedores: d.fornecedores.filter((f) => f.id !== id),
      auditoria: log ? [log, ...d.auditoria] : d.auditoria,
    }));
  };

  // ---------- PRODUTOS ----------
  const createProduto: DataContextValue["createProduto"] = (p) => {
    if (db.produtos.some((x) => x.codigoBarras === p.codigoBarras && p.codigoBarras))
      return { ok: false, msg: "Código de barras já cadastrado." };
    if (p.precoVenda <= p.precoCusto)
      return { ok: false, msg: "Preço de venda deve ser maior que o de custo." };
    const codigoInterno = p.codigoInterno || `AM${String(db.produtos.length + 1).padStart(4, "0")}`;
    const newP: Produto = { ...(p as any), codigoInterno, id: uid(), criadoEm: now() };
    const log = audit("CREATE", "produto", `Cadastrou produto: ${newP.descricao}`);
    setDB((d) => ({ ...d, produtos: [...d.produtos, newP], auditoria: log ? [log, ...d.auditoria] : d.auditoria }));
    return { ok: true, msg: "Produto cadastrado com sucesso." };
  };
  const updateProduto: DataContextValue["updateProduto"] = (id, patch) => {
    const log = audit("UPDATE", "produto", `Atualizou produto ${id}`);
    setDB((d) => ({
      ...d,
      produtos: d.produtos.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      auditoria: log ? [log, ...d.auditoria] : d.auditoria,
    }));
  };
  const deleteProduto: DataContextValue["deleteProduto"] = (id) => {
    const temMov = db.movimentacoes.some((m) => m.produtoId === id);
    if (temMov)
      return { ok: false, msg: "Produto possui movimentações vinculadas e não pode ser excluído." };
    const log = audit("DELETE", "produto", `Removeu produto ${id}`);
    setDB((d) => ({
      ...d,
      produtos: d.produtos.filter((p) => p.id !== id),
      auditoria: log ? [log, ...d.auditoria] : d.auditoria,
    }));
    return { ok: true, msg: "Produto removido." };
  };

  const ajustarEstoque: DataContextValue["ajustarEstoque"] = (produtoId, novaQtd, motivo) => {
    if (novaQtd < 0) return { ok: false, msg: "Estoque não pode ficar negativo." };
    if (!motivo.trim()) return { ok: false, msg: "Motivo é obrigatório." };
    const prod = db.produtos.find((p) => p.id === produtoId);
    if (!prod) return { ok: false, msg: "Produto não encontrado." };
    const delta = novaQtd - prod.estoque;
    const mov: MovimentacaoEstoque = {
      id: uid(),
      produtoId,
      produtoDescricao: prod.descricao,
      qtdAnterior: prod.estoque,
      qtdAtual: novaQtd,
      delta,
      tipo: "AJUSTE_MANUAL",
      origem: "ajuste-manual",
      usuarioId: currentUser?.id || "",
      usuarioNome: currentUser?.nome || "",
      motivo,
      data: now(),
    };
    const log = audit("MOV_ESTOQUE", "estoque", `Ajuste manual de ${prod.descricao}: ${delta >= 0 ? "+" : ""}${delta}`);
    setDB((d) => ({
      ...d,
      produtos: d.produtos.map((p) => (p.id === produtoId ? { ...p, estoque: novaQtd } : p)),
      movimentacoes: [mov, ...d.movimentacoes],
      auditoria: log ? [log, ...d.auditoria] : d.auditoria,
    }));
    return { ok: true, msg: "Estoque atualizado com sucesso." };
  };

  // ---------- VENDAS ----------
  const criarVenda: DataContextValue["criarVenda"] = (clienteId, itens, formaPagamento, status) => {
    if (!currentUser) return { ok: false, msg: "Não autenticado." };
    const cliente = db.clientes.find((c) => c.id === clienteId);
    if (!cliente) return { ok: false, msg: "Cliente inválido." };
    if (!itens.length) return { ok: false, msg: "Adicione ao menos um item." };

    if (status === "FINALIZADA") {
      for (const it of itens) {
        const p = db.produtos.find((x) => x.id === it.produtoId);
        if (!p) return { ok: false, msg: "Produto inválido." };
        if (p.estoque < it.quantidade)
          return { ok: false, msg: `Produto sem estoque disponível: ${p.descricao}.` };
      }
    }

    const total = itens.reduce((s, i) => s + i.subtotal, 0);
    const venda: Venda = {
      id: uid(),
      numero: db.vendaSeq,
      clienteId,
      clienteNome: cliente.nome,
      vendedorId: currentUser.id,
      vendedorNome: currentUser.nome,
      itens,
      total,
      formaPagamento,
      status,
      data: now(),
    };

    setDB((d) => {
      let produtos = d.produtos;
      const movs: MovimentacaoEstoque[] = [];
      let financeiro = d.financeiro;

      if (status === "FINALIZADA") {
        produtos = produtos.map((p) => {
          const it = itens.find((i) => i.produtoId === p.id);
          if (!it) return p;
          const novo = p.estoque - it.quantidade;
          movs.push({
            id: uid(),
            produtoId: p.id,
            produtoDescricao: p.descricao,
            qtdAnterior: p.estoque,
            qtdAtual: novo,
            delta: -it.quantidade,
            tipo: "SAIDA_VENDA",
            origem: venda.id,
            usuarioId: currentUser.id,
            usuarioNome: currentUser.nome,
            data: now(),
          });
          return { ...p, estoque: novo };
        });
        financeiro = [
          {
            id: uid(),
            categoria: "Vendas",
            tipo: "RECEITA",
            valor: total,
            vencimento: now(),
            descricao: `Venda #${venda.numero} - ${cliente.nome}`,
            status: formaPagamento === "BOLETO" ? "PENDENTE" : "RECEBIDO",
            origemTipo: "VENDA",
            origemId: venda.id,
            criadoEm: now(),
          },
          ...financeiro,
        ];
      }
      const log = audit("CREATE", "venda", `${status === "ORCAMENTO" ? "Orçamento" : "Venda"} #${venda.numero} - R$ ${total.toFixed(2)}`);
      return {
        ...d,
        vendas: [venda, ...d.vendas],
        produtos,
        movimentacoes: [...movs, ...d.movimentacoes],
        financeiro,
        vendaSeq: d.vendaSeq + 1,
        auditoria: log ? [log, ...d.auditoria] : d.auditoria,
      };
    });
    return {
      ok: true,
      msg: status === "ORCAMENTO" ? "Orçamento gerado com sucesso." : "Venda finalizada com sucesso.",
      vendaId: venda.id,
    };
  };

  const finalizarOrcamento: DataContextValue["finalizarOrcamento"] = (vendaId) => {
    const v = db.vendas.find((x) => x.id === vendaId);
    if (!v) return { ok: false, msg: "Venda não encontrada." };
    if (v.status !== "ORCAMENTO") return { ok: false, msg: "Apenas orçamentos podem ser finalizados." };
    for (const it of v.itens) {
      const p = db.produtos.find((x) => x.id === it.produtoId);
      if (!p || p.estoque < it.quantidade)
        return { ok: false, msg: `Produto sem estoque disponível: ${it.descricao}.` };
    }
    setDB((d) => {
      const movs: MovimentacaoEstoque[] = [];
      const produtos = d.produtos.map((p) => {
        const it = v.itens.find((i) => i.produtoId === p.id);
        if (!it) return p;
        const novo = p.estoque - it.quantidade;
        movs.push({
          id: uid(),
          produtoId: p.id,
          produtoDescricao: p.descricao,
          qtdAnterior: p.estoque,
          qtdAtual: novo,
          delta: -it.quantidade,
          tipo: "SAIDA_VENDA",
          origem: v.id,
          usuarioId: currentUser!.id,
          usuarioNome: currentUser!.nome,
          data: now(),
        });
        return { ...p, estoque: novo };
      });
      const financeiro = [
        {
          id: uid(),
          categoria: "Vendas",
          tipo: "RECEITA" as const,
          valor: v.total,
          vencimento: now(),
          descricao: `Venda #${v.numero} - ${v.clienteNome}`,
          status: v.formaPagamento === "BOLETO" ? "PENDENTE" as const : "RECEBIDO" as const,
          origemTipo: "VENDA" as const,
          origemId: v.id,
          criadoEm: now(),
        },
        ...d.financeiro,
      ];
      const log = audit("UPDATE", "venda", `Orçamento #${v.numero} finalizado`);
      return {
        ...d,
        produtos,
        movimentacoes: [...movs, ...d.movimentacoes],
        vendas: d.vendas.map((x) => (x.id === vendaId ? { ...x, status: "FINALIZADA" as const } : x)),
        financeiro,
        auditoria: log ? [log, ...d.auditoria] : d.auditoria,
      };
    });
    return { ok: true, msg: "Venda finalizada com sucesso." };
  };

  const cancelarVenda: DataContextValue["cancelarVenda"] = (vendaId, motivo) => {
    if (!currentUser) return { ok: false, msg: "Não autenticado." };
    if (currentUser.perfil !== "ADMIN")
      return { ok: false, msg: "Usuário sem permissão para cancelar venda." };
    if (!motivo.trim()) return { ok: false, msg: "Motivo do cancelamento obrigatório." };
    const v = db.vendas.find((x) => x.id === vendaId);
    if (!v) return { ok: false, msg: "Venda não encontrada." };
    if (v.status === "CANCELADA") return { ok: false, msg: "Venda já cancelada." };
    if (v.status !== "FINALIZADA")
      return { ok: false, msg: "Apenas vendas finalizadas podem ser canceladas." };

    setDB((d) => {
      const movs: MovimentacaoEstoque[] = [];
      const produtos = d.produtos.map((p) => {
        const it = v.itens.find((i) => i.produtoId === p.id);
        if (!it) return p;
        const novo = p.estoque + it.quantidade;
        movs.push({
          id: uid(),
          produtoId: p.id,
          produtoDescricao: p.descricao,
          qtdAnterior: p.estoque,
          qtdAtual: novo,
          delta: it.quantidade,
          tipo: "CANCELAMENTO",
          origem: v.id,
          usuarioId: currentUser.id,
          usuarioNome: currentUser.nome,
          motivo,
          data: now(),
        });
        return { ...p, estoque: novo };
      });
      const financeiro = d.financeiro.map((l) =>
        l.origemTipo === "VENDA" && l.origemId === v.id ? { ...l, status: "ESTORNADO" as const } : l
      );
      const log = audit("CANCELAR_VENDA", "venda", `Venda #${v.numero} cancelada. Motivo: ${motivo}`);
      return {
        ...d,
        produtos,
        movimentacoes: [...movs, ...d.movimentacoes],
        vendas: d.vendas.map((x) =>
          x.id === vendaId
            ? {
                ...x,
                status: "CANCELADA" as const,
                motivoCancelamento: motivo,
                canceladaPor: currentUser.nome,
                canceladaEm: now(),
              }
            : x
        ),
        financeiro,
        auditoria: log ? [log, ...d.auditoria] : d.auditoria,
      };
    });
    return { ok: true, msg: "Venda cancelada com sucesso." };
  };

  // ---------- COMPRAS ----------
  const criarCompra: DataContextValue["criarCompra"] = (fornecedorId, numeroNota, dataEmissao, itens) => {
    if (!currentUser) return { ok: false, msg: "Não autenticado." };
    const f = db.fornecedores.find((x) => x.id === fornecedorId);
    if (!f) return { ok: false, msg: "Fornecedor inválido." };
    if (!numeroNota.trim()) return { ok: false, msg: "Número da nota fiscal obrigatório." };
    if (!itens.length) return { ok: false, msg: "Adicione ao menos um item." };
    if (itens.some((i) => i.precoCusto <= 0 || i.quantidade <= 0))
      return { ok: false, msg: "Valores devem ser maiores que zero." };

    const total = itens.reduce((s, i) => s + i.subtotal, 0);
    const compra: Compra = {
      id: uid(),
      numero: db.compraSeq,
      fornecedorId,
      fornecedorNome: f.nomeFantasia,
      numeroNota,
      dataEmissao,
      itens,
      total,
      data: now(),
      usuarioId: currentUser.id,
      usuarioNome: currentUser.nome,
    };

    setDB((d) => {
      const movs: MovimentacaoEstoque[] = [];
      const produtos = d.produtos.map((p) => {
        const it = itens.find((i) => i.produtoId === p.id);
        if (!it) return p;
        const novo = p.estoque + it.quantidade;
        const totalAnterior = p.precoCusto * p.estoque;
        const totalEntrada = it.precoCusto * it.quantidade;
        const novoCusto = novo > 0 ? (totalAnterior + totalEntrada) / novo : it.precoCusto;
        movs.push({
          id: uid(),
          produtoId: p.id,
          produtoDescricao: p.descricao,
          qtdAnterior: p.estoque,
          qtdAtual: novo,
          delta: it.quantidade,
          tipo: "ENTRADA_COMPRA",
          origem: compra.id,
          usuarioId: currentUser.id,
          usuarioNome: currentUser.nome,
          data: now(),
        });
        return { ...p, estoque: novo, precoCusto: Number(novoCusto.toFixed(2)) };
      });
      const financeiro: LancamentoFinanceiro[] = [
        {
          id: uid(),
          categoria: "Compras",
          tipo: "DESPESA",
          valor: total,
          vencimento: dataEmissao,
          descricao: `Compra #${compra.numero} - NF ${numeroNota} - ${f.nomeFantasia}`,
          status: "PENDENTE",
          origemTipo: "COMPRA",
          origemId: compra.id,
          criadoEm: now(),
        },
        ...d.financeiro,
      ];
      const log = audit("CREATE", "compra", `Compra #${compra.numero} registrada - R$ ${total.toFixed(2)}`);
      return {
        ...d,
        compras: [compra, ...d.compras],
        produtos,
        movimentacoes: [...movs, ...d.movimentacoes],
        financeiro,
        compraSeq: d.compraSeq + 1,
        auditoria: log ? [log, ...d.auditoria] : d.auditoria,
      };
    });
    return { ok: true, msg: "Entrada registrada com sucesso." };
  };

  // ---------- FINANCEIRO ----------
  const criarLancamento: DataContextValue["criarLancamento"] = (l) => {
    if (l.valor <= 0) return { ok: false, msg: "Valor deve ser maior que zero." };
    if (!l.categoria) return { ok: false, msg: "Categoria obrigatória." };
    const novo: LancamentoFinanceiro = { ...l, id: uid(), criadoEm: now() };
    const log = audit("MOV_FINANCEIRO", "financeiro", `Lançamento ${l.tipo}: ${l.descricao} - R$ ${l.valor.toFixed(2)}`);
    setDB((d) => ({
      ...d,
      financeiro: [novo, ...d.financeiro],
      auditoria: log ? [log, ...d.auditoria] : d.auditoria,
    }));
    return { ok: true, msg: "Lançamento financeiro realizado com sucesso." };
  };
  const confirmarLancamento: DataContextValue["confirmarLancamento"] = (id) => {
    const l = db.financeiro.find((x) => x.id === id);
    if (!l) return;
    const newStatus = l.tipo === "RECEITA" ? "RECEBIDO" : "PAGO";
    const log = audit("MOV_FINANCEIRO", "financeiro", `${newStatus} - ${l.descricao}`);
    setDB((d) => ({
      ...d,
      financeiro: d.financeiro.map((x) => (x.id === id ? { ...x, status: newStatus } : x)),
      auditoria: log ? [log, ...d.auditoria] : d.auditoria,
    }));
  };
  const estornarLancamento: DataContextValue["estornarLancamento"] = (id) => {
    const l = db.financeiro.find((x) => x.id === id);
    if (!l) return;
    const log = audit("MOV_FINANCEIRO", "financeiro", `Estornado - ${l.descricao}`);
    setDB((d) => ({
      ...d,
      financeiro: d.financeiro.map((x) => (x.id === id ? { ...x, status: "ESTORNADO" } : x)),
      auditoria: log ? [log, ...d.auditoria] : d.auditoria,
    }));
  };

  const resetDB = useCallback(() => {
    const fresh = seed();
    setDB(fresh);
    setCurrentUser(null);
  }, []);

  const value = useMemo<DataContextValue>(
    () => ({
      db,
      currentUser,
      login,
      logout,
      createUser,
      updateUser,
      toggleUserActive,
      createCliente,
      updateCliente,
      deleteCliente,
      createFornecedor,
      updateFornecedor,
      deleteFornecedor,
      createProduto,
      updateProduto,
      deleteProduto,
      ajustarEstoque,
      criarVenda,
      finalizarOrcamento,
      cancelarVenda,
      criarCompra,
      criarLancamento,
      confirmarLancamento,
      estornarLancamento,
      resetDB,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [db, currentUser]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
