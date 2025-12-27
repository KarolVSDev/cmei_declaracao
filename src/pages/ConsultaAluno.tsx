import { useState } from "react";
import { Container, Paper, TextField, Button, Box, Typography, Alert, IconButton, CircularProgress } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { db } from "../firebase";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { gerarPDFDeclaracao } from "../services/pdfService";
import type { Aluno } from "../types/Aluno";

export default function ConsultaAluno() {
  const [cpf, setCpf] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState("");
  const navigate = useNavigate();

  const handleConsulta = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    try {
      // 1. Busca o aluno pelo CPF e Data de Nascimento
      const qAluno = query(
        collection(db, "alunos"),
        where("cpf", "==", cpf.trim()),
        where("dataNascimento", "==", nascimento)
      );

      const alunoSnapshot = await getDocs(qAluno);
      
      if (alunoSnapshot.empty) {
        setErro("Dados incorretos ou aluno não cadastrado.");
        setLoading(false);
        return;
      }

      const alunoDoc = alunoSnapshot.docs[0];
      const alunoDados = { id: alunoDoc.id, ...alunoDoc.data() } as Aluno;

      // 2. Busca a última declaração/frequência lançada para este aluno
      const qFreq = query(
        collection(db, "declarations"),
        where("alunoId", "==", alunoDoc.id),
        orderBy("mesReferencia", "desc"), // Pega a mais recente
        limit(1)
      );

      const freqSnapshot = await getDocs(qFreq);

      if (freqSnapshot.empty) {
        setErro("Nenhuma frequência foi lançada para este aluno ainda. Entre em contato com a secretaria.");
      } else {
        const freqDados = freqSnapshot.docs[0].data();
        
        // 3. Executa o download do PDF de verdade
        gerarPDFDeclaracao(alunoDados, {
          mes: freqDados.mesReferencia,
          dias: freqDados.diasLetivos,
          presencas: freqDados.presencas
        });
        
        setSucesso(`Declaração de ${alunoDados.nome} gerada com sucesso!`);
      }
    } catch (err: any) {
      console.error(err);
      setErro(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ height: "100vh", display: "flex", alignItems: "center" }}>
      <Paper sx={{ p: 4, width: "100%", textAlign: "center", position: 'relative', borderRadius: 3 }} elevation={4}>
        <IconButton onClick={() => navigate("/")} sx={{ position: 'absolute', left: 8, top: 8 }}>
          <ArrowBackIcon />
        </IconButton>

        <Box sx={{ mb: 2, mt: 2 }}>
          <img src="/logo.jpeg" alt="Logo" style={{ maxWidth: '120px' }} />
        </Box>

        <Typography variant="h5" fontWeight="bold" gutterBottom>Portal do Aluno</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Digite seus dados para baixar a declaração
        </Typography>
        
        {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}
        {sucesso && <Alert severity="success" sx={{ mb: 2 }}>{sucesso}</Alert>}

        <Box component="form" onSubmit={handleConsulta}>
          <TextField 
            fullWidth label="CPF do Aluno" sx={{ mb: 2 }} 
            placeholder="000.000.000-00"
            value={cpf} onChange={(e) => setCpf(e.target.value)} required 
          />
          <TextField 
            fullWidth label="Data de Nascimento" type="date" 
            InputLabelProps={{ shrink: true }} sx={{ mb: 3 }}
            value={nascimento} onChange={(e) => setNascimento(e.target.value)} required 
          />
          <Button 
            fullWidth variant="contained" size="large" type="submit" 
            disabled={loading} sx={{ py: 1.5, fontWeight: 'bold' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Baixar Declaração (PDF)"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}