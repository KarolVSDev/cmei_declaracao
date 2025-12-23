import { useState, useEffect } from "react";
import { addAluno, getAlunos } from "../../services/alunosService";
import type { Aluno } from "../../types/Aluno";

export default function CadastroAlunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [form, setForm] = useState<Aluno>({
    nome: "",
    matricula: "",
    cpf: "",
    data_nascimento: "",
    turma: "",
    turno: "",
  });

  // Buscar alunos ao carregar
  useEffect(() => {
    carregarAlunos();
  }, []);

  async function carregarAlunos() {
    const data = await getAlunos();
    setAlunos(data);
  }

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault(); // previne refresh da página
  try {
    await addAluno(form); // salva no Firestore
    setForm({ nome: "", matricula: "", cpf: "", data_nascimento: "", turma: "", turno: "" }); // limpa form
    carregarAlunos(); // atualiza lista
  } catch (error) {
    console.error("Erro ao adicionar aluno:", error);
  }
}


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Cadastro de Alunos</h1>
      
      {/* Formulário */}
      <form onSubmit={handleSubmit} className="grid gap-3 mb-6 p-4 border rounded shadow-md max-w-md">
        <input className="border p-2 rounded" placeholder="Nome" value={form.nome} 
          onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Matrícula" value={form.matricula} 
          onChange={(e) => setForm({ ...form, matricula: e.target.value })} />
        <input className="border p-2 rounded" placeholder="CPF" value={form.cpf} 
          onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
        <input className="border p-2 rounded" type="date" value={form.data_nascimento} 
          onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Turma" value={form.turma} 
          onChange={(e) => setForm({ ...form, turma: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Turno" value={form.turno} 
          onChange={(e) => setForm({ ...form, turno: e.target.value })} />

        <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Salvar
        </button>
      </form>


      {/* Lista de alunos */}
      <h2 className="text-xl font-semibold mb-2">Alunos Cadastrados</h2>
      <ul className="space-y-2">
        {alunos.map((a) => (
          <li key={a.id} className="border p-2 rounded shadow">
            <p className="font-semibold">{a.nome}</p>
            <p>{a.matricula} — {a.turma} ({a.turno})</p>
          </li>
        ))}
      </ul>

        
    </div>
  );
}
