// src/types/Aluno.ts
export interface Aluno {
  id?: string;
  nome: string;
  turma: string;
  matricula: string;
  dataNascimento: string;
  fase: string;
  status: 'ativo' | 'egresso';
  turno: string;
  cpf: string;
}

export interface Declarations {
  id?: string;
  alunoId: string;
  alunoNome: string;
  mesReferencia: string;
  anoReferencia: number;
  diasLetivos: number;
  presencas: number;
  percentual: number;
  dataEmissao: any; // Timestamp do Firebase
}