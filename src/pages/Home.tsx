import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Container, Box, Grid, TextField, 
  MenuItem, Button, AppBar, Toolbar, Snackbar, Alert, Dialog, 
  DialogTitle, DialogContent, DialogActions, Fab, IconButton, Tooltip
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout'; 
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { auth } from "../firebase"; 
import { signOut } from "firebase/auth";
import { cadastrarAluno } from "../services/alunosService"; 
import { ListagemAlunos } from "./Home/ListagemAlunos";
import type { Aluno } from "../types/Aluno";
import * as XLSX from "xlsx"; // Certifique-se de instalar: npm install xlsx

export default function Home() {
  const [openSnack, setOpenSnack] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      alunoNome: "",
      matricula: "",
      nascimento: "",
      fase: "2º Período",
      turma: "",
      turno: "Matutino",
      cpf: "",
    },
  });

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  // Função para processar o Upload da Planilha
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

      setLoading(true);
      try {
        for (const item of jsonData) {
          const novoAluno: Aluno = {
            nome: String(item.Nome || item.nome || "").toUpperCase(),
            matricula: String(item.Matricula || item.matricula || ""),
            dataNascimento: String(item.Nascimento || item.dataNascimento || ""),
            cpf: String(item.CPF || item.cpf || ""),
            fase: item.Fase || item.fase || "2º Período",
            turma: String(item.Turma || item.turma || ""),
            turno: item.Turno || item.turno || "Matutino",
            status: 'ativo' as const,
          };
          
          if (novoAluno.nome && novoAluno.cpf) {
            await cadastrarAluno(novoAluno);
          }
        }
        setOpenSnack(true);
        setRefreshKey(old => old + 1);
      } catch (error) {
        console.error("Erro no upload:", error);
        alert("Erro ao processar planilha. Verifique os dados.");
      } finally {
        setLoading(false);
        event.target.value = ""; // Limpa o input
      }
    };
    reader.readAsBinaryString(file);
  };

  const onSubmit = async (data: any) => {
    try {
      const novoAluno: Aluno = {
        nome: data.alunoNome.toUpperCase(),
        matricula: data.matricula,
        dataNascimento: data.nascimento,
        fase: data.fase,
        turma: data.turma,
        turno: data.turno,
        cpf: data.cpf,
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
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <img 
              src="/logo.jpeg" 
              alt="Logo CMEI Jean Piaget" 
              style={{ height: '40px', width: 'auto', backgroundColor: 'white', borderRadius: '4px', padding: '2px' }} 
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Botão de Upload de Planilha */}
            <Button
              variant="contained"
              component="label"
              startIcon={<UploadFileIcon />}
              disabled={loading}
              sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' }, display: { xs: 'none', sm: 'flex' } }}
            >
              {loading ? "Processando..." : "Importar Planilha"}
              <input type="file" hidden accept=".xlsx, .xls" onChange={handleFileUpload} />
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
                    <TextField {...field} label="Código do Aluno (Matrícula)" fullWidth />
                  )} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="cpf" control={control} render={({ field }) => (
                    <TextField {...field} label="CPF do Aluno" fullWidth required />
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
                <Grid size={{ xs: 12, sm: 6 }}>
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
              <Button type="submit" variant="contained">Salvar Aluno</Button>
            </DialogActions>
          </Box>
        </Dialog>
      </Container>

      <Snackbar open={openSnack} autoHideDuration={3000} onClose={() => setOpenSnack(false)}>
        <Alert severity="success" variant="filled">Dados atualizados com sucesso!</Alert>
      </Snackbar>
    </>
  );
}