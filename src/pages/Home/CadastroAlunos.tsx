// src/pages/Home/CadastroAlunos.tsx
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import { useForm } from "react-hook-form";
import type { Aluno } from "../../types/Aluno";
import { cadastrarAluno } from "../../services/alunosService";

export const CadastroAlunos = () => {
  const { register, handleSubmit, reset } = useForm<Aluno>();

  const onSubmit = async (data: Aluno) => {
    try {
      await cadastrarAluno({ ...data, status: 'ativo' });
      alert("Aluno cadastrado com sucesso!");
      reset();
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
    }
  };

  return (
    <Paper sx={{ p: 4, mt: 4 }}>
      <Typography variant="h5" gutterBottom>Cadastro de Aluno</Typography>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField {...register("nome")} label="Nome Completo" fullWidth required />
        <TextField {...register("turma")} label="Turma" fullWidth required />
        <TextField {...register("matricula")} label="Matrícula" fullWidth required />
        <TextField {...register("dataNascimento")} label="Data de Nascimento" type="date" InputLabelProps={{ shrink: true }} fullWidth required />
        <Button type="submit" variant="contained" color="primary">Salvar Aluno</Button>
      </Box>
    </Paper>
  );
};