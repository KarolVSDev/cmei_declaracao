import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import type { Aluno } from "../types/Aluno";

const alunosCollection = collection(db, "alunos");

// Adicionar aluno
export async function addAluno(aluno: Aluno) {
  await addDoc(alunosCollection, aluno);
}

// Listar alunos
export async function getAlunos(): Promise<Aluno[]> {
  const snapshot = await getDocs(alunosCollection);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Aluno[];
}
