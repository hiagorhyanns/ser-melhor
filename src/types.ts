export interface BaseItem {
  id: string;
  completed: boolean;
  createdAt: number;
}

export interface Marca extends BaseItem {
  nome: string;
  categoria: string;
  observacao: string;
  nivelInteresse: number; // 1-5
  favorita: boolean;
  foto?: string;
}

export interface Loja extends BaseItem {
  nome: string;
  link: string;
  categoria: string;
  faixaPreco: string;
  observacao: string;
  status: 'ver depois' | 'comprar' | 'favorita';
}

export interface BarbaItem extends BaseItem {
  estilo: string;
  frequencia: string;
  produtos: string;
  observacoes: string;
  checklist: { text: string; done: boolean }[];
}

export interface CabeloItem extends BaseItem {
  tipoCorte: string;
  referencia: string;
  frequencia: string;
  produtos: string;
  barbeiro: string;
  observacoes: string;
  foto?: string;
}

export interface Produto extends BaseItem {
  nome: string;
  categoria: string;
  marca: string;
  frequenciaUso: string;
  nota: number;
  status: 'uso diário' | 'testar' | 'comprar';
}

export interface Roupa extends BaseItem {
  nome: string;
  categoria: string;
  cor: string;
  ocasiao: string;
  combinacoes: string;
  status: 'tenho' | 'comprar' | 'substituir';
  foto?: string;
}

export interface PosturaItem extends BaseItem {
  titulo: string;
  descricao: string;
}

export interface MusculoItem extends BaseItem {
  musculo: string;
  objetivo: string;
  exercicio: string;
  frequenciaSemanal: string;
  observacao: string;
}

export type AppData = {
  marcas: Marca[];
  lojas: Loja[];
  barba: BarbaItem[];
  cabelo: CabeloItem[];
  produtos: Produto[];
  roupas: Roupa[];
  postura: PosturaItem[];
  musculos: MusculoItem[];
};
