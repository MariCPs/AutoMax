// Domain types for the AutoMax system

export type UserRole = "ADMIN" | "VENDEDOR" | "ESTOQUISTA";

export interface User {
  id: string;
  nome: string;
  email: string;
  login: string;
  senha: string;
  perfil: UserRole;
  ativo: boolean;
  criadoEm: string;
}

export type ClienteTipo = "PF" | "PJ";

export interface Cliente {
  id: string;
  nome: string;
  documento: string;
  tipo: ClienteTipo;
  telefone: string;
  email: string;
  endereco: string;
  criadoEm: string;
}

export interface Fornecedor {
  id: string;
  nomeFantasia: string;
  cnpj: string;
  telefone: string;
  endereco: string;
  produtosFornecidos: string;
  criadoEm: string;
}

export interface Produto {
  id: string;
  codigoInterno: string;
  descricao: string;
  marca: string;
  fabricante: string;
  codigoBarras: string;
  compatibilidade: string;
  precoCusto: number;
  precoVenda: number;
  categoria: string;
  localizacao: string;
  estoque: number;
  estoqueMinimo: number;
  ativo: boolean;
  criadoEm: string;
}

export type MovTipo =
  | "ENTRADA_COMPRA"
  | "SAIDA_VENDA"
  | "AJUSTE_MANUAL"
  | "CANCELAMENTO"
  | "DEVOLUCAO";

export interface MovimentacaoEstoque {
  id: string;
  produtoId: string;
  produtoDescricao: string;
  qtdAnterior: number;
  qtdAtual: number;
  delta: number;
  tipo: MovTipo;
  origem: string; // venda/compra/ajuste id
  usuarioId: string;
  usuarioNome: string;
  motivo?: string;
  data: string;
}

export type VendaStatus =
  | "ORCAMENTO"
  | "FINALIZADA"
  | "CANCELADA"
  | "PENDENTE"
  | "ESTORNADA";

export type FormaPagamento =
  | "DINHEIRO"
  | "PIX"
  | "DEBITO"
  | "CREDITO"
  | "BOLETO";

export interface VendaItem {
  produtoId: string;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface Venda {
  id: string;
  numero: number;
  clienteId: string;
  clienteNome: string;
  vendedorId: string;
  vendedorNome: string;
  itens: VendaItem[];
  total: number;
  formaPagamento: FormaPagamento;
  status: VendaStatus;
  data: string;
  motivoCancelamento?: string;
  canceladaPor?: string;
  canceladaEm?: string;
}

export interface CompraItem {
  produtoId: string;
  descricao: string;
  quantidade: number;
  precoCusto: number;
  subtotal: number;
}

export interface Compra {
  id: string;
  numero: number;
  fornecedorId: string;
  fornecedorNome: string;
  numeroNota: string;
  dataEmissao: string;
  itens: CompraItem[];
  total: number;
  data: string;
  usuarioId: string;
  usuarioNome: string;
}

export type LancamentoTipo = "RECEITA" | "DESPESA";
export type LancamentoStatus = "PENDENTE" | "PAGO" | "RECEBIDO" | "ESTORNADO";

export interface LancamentoFinanceiro {
  id: string;
  categoria: string;
  tipo: LancamentoTipo;
  valor: number;
  vencimento: string;
  descricao: string;
  status: LancamentoStatus;
  origemTipo?: "VENDA" | "COMPRA" | "MANUAL";
  origemId?: string;
  criadoEm: string;
}

export type AuditAcao =
  | "LOGIN"
  | "LOGOUT"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "CANCELAR_VENDA"
  | "MOV_ESTOQUE"
  | "MOV_FINANCEIRO";

export interface AuditoriaLog {
  id: string;
  data: string;
  usuarioId: string;
  usuarioNome: string;
  acao: AuditAcao;
  entidade: string;
  detalhes: string;
}
