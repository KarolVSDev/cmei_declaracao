import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Container, Paper, Typography, Box, Grid, TextField, 
  MenuItem, Button, AppBar, Toolbar, Snackbar, Alert, Dialog, 
  DialogTitle, DialogContent, DialogActions, Fab, IconButton, Tooltip
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout'; 
import { auth } from "../firebase"; 
import { signOut } from "firebase/auth";
import { cadastrarAluno } from "../services/alunosService"; 
import { ListagemAlunos } from "./Home/ListagemAlunos";
import type { Aluno } from "../types/Aluno";

export default function Home() {
  const [openSnack, setOpenSnack] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [openModal, setOpenModal] = useState(false);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      alunoNome: "",
      matricula: "",
      nascimento: "",
      fase: "2º Período",
      turma: "",
      turno: "Matutino",
    },
  });

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const novoAluno: Aluno = {
        nome: data.alunoNome,
        matricula: data.matricula,
        dataNascimento: data.nascimento,
        fase: data.fase,
        turma: data.turma,
        turno: data.turno,
        status: 'ativo' as const, 
      };

      await cadastrarAluno(novoAluno); 
      setOpenSnack(true);
      setRefreshKey(old => old + 1); 
      setOpenModal(false);
      reset();
    } catch (error) {
      console.error("Erro ao cadastrar aluno:", error);
    }
  };

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
        <Toolbar>
          {/* LOGO NO LUGAR DO TEXTO */}
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <img 
              src="/logo.jpeg" 
              alt="Logo CMEI Jean Piaget" 
              style={{ height: '40px', width: 'auto', backgroundColor: 'white', borderRadius: '4px', padding: '2px' }} 
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button 
              variant="contained" 
              color="secondary" 
              startIcon={<AddIcon />}
              onClick={() => setOpenModal(true)}
              sx={{ fontWeight: 'bold' }}
            >
              Novo Aluno
            </Button>

            <Tooltip title="Sair do Sistema">
              <IconButton color="inherit" onClick={handleLogout}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <ListagemAlunos key={refreshKey} />

        <Fab 
          color="primary" 
          aria-label="add" 
          sx={{ position: 'fixed', bottom: 32, right: 32 }}
          onClick={() => setOpenModal(true)}
        >
          <AddIcon />
        </Fab>

        <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
          <DialogTitle sx={{ borderBottom: '1px solid #eee' }}>
            Cadastrar Novo Aluno
          </DialogTitle>
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12 }}>
                  <Controller name="alunoNome" control={control} render={({ field }) => (
                    <TextField {...field} label="Nome do Aluno" fullWidth required />
                  )} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="nascimento" control={control} render={({ field }) => (
                    <TextField {...field} label="Data de Nascimento" type="date" fullWidth InputLabelProps={{ shrink: true }} required />
                  )} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="matricula" control={control} render={({ field }) => (
                    <TextField {...field} label="Código do Aluno" fullWidth />
                  )} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="fase" control={control} render={({ field }) => (
                    <TextField {...field} select label="Fase" fullWidth>
                      {["Maternal I", "Maternal II", "Maternal III", "1º Período", "2º Período"].map((f) => (
                        <MenuItem key={f} value={f}>{f}</MenuItem>
                      ))}
                    </TextField>
                  )} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="turma" control={control} render={({ field }) => (
                    <TextField {...field} label="Turma" fullWidth />
                  )} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Controller name="turno" control={control} render={({ field }) => (
                    <TextField {...field} select label="Turno" fullWidth>
                      {["Matutino", "Vespertino", "Integral"].map((t) => (
                        <MenuItem key={t} value={t}>{t}</MenuItem>
                      ))}
                    </TextField>
                  )} />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
              <Button type="submit" variant="contained">Salvar</Button>
            </DialogActions>
          </Box>
        </Dialog>
      </Container>

      <Snackbar open={openSnack} autoHideDuration={3000} onClose={() => setOpenSnack(false)}>
        <Alert severity="success">Cadastro realizado!</Alert>
      </Snackbar>
    </>
  );
}