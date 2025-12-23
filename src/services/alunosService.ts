// src/services/alunosService.ts
import { db } from "../firebase";
import { collection, addDoc, query, where, getDocs, Timestamp } from "firebase/firestore";
import type { Aluno, Declarations } from "../types/Aluno";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";

const alunosCollection = collection(db, "alunos");
const declarationsCollection = collection(db, "declarations");

export const cadastrarAluno = async (aluno: Aluno) => {
  return await addDoc(alunosCollection, aluno);
};

export const buscarAlunos = async (): Promise<Aluno[]> => {
  const snapshot = await getDocs(alunosCollection);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Aluno[];
};

export const salvarDeclaracao = async (declaracao: Omit<Declarations, 'dataEmissao'>) => {
  return await addDoc(declarationsCollection, {
    ...declaracao,
    dataEmissao: Timestamp.now()
  });
};

// Adicione ao src/services/alunosService.ts
export const buscarDeclaracoesPorMes = async (mes: string, ano: number) => {
  const q = query(
    declarationsCollection, 
    where("mesReferencia", "==", mes),
    where("anoReferencia", "==", ano)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
};

export const editarAluno = async (id: string, dados: Partial<Aluno>) => {
  const alunoRef = doc(db, "alunos", id);
  return await updateDoc(alunoRef, dados);
};

export const excluirAluno = async (id: string) => {
  const alunoRef = doc(db, "alunos", id);
  return await deleteDoc(alunoRef);
};