import React, { useState, useEffect } from "react";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { 
  Container, Paper, TextField, Button, Box, Alert, 
  CircularProgress, Typography, IconButton, Stack 
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SchoolIcon from '@mui/icons-material/School';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Estado para alternar entre a tela de seleção e o formulário admin
  const [modoAcesso, setModoAcesso] = useState<'selecao' | 'admin'>('selecao');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/home");
      }
    });
    return unsubscribe;
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // 1. Faz o login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // 2. Pequena pausa para o Firebase estabilizar o token no navegador (Evita o erro removeChild)
      if (userCredential.user) {
        setTimeout(() => {
          navigate("/home", { replace: true });
        }, 500); // 500ms é o suficiente para o DOM estabilizar
      }
    } catch (err: any) {
      console.error("Erro de login:", err);
      setError("E-mail ou senha incorretos.");
      setLoading(false);
    }
  };

  // 1. TELA DE SELEÇÃO INICIAL
  if (modoAcesso === 'selecao') {
    return (
      <Container maxWidth="xs" sx={{ height: "100vh", display: "flex", alignItems: "center" }}>
        <Paper sx={{ p: 4, width: "100%", textAlign: "center", borderRadius: 3 }} elevation={4}>
          <Box sx={{ mb: 3 }}>
            <img src="/logo.jpeg" alt="Logo CMEI Jean Piaget" style={{ maxWidth: '180px', height: 'auto' }} />
          </Box>
          
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Bem-vindo
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
            Escolha como deseja acessar o sistema:
          </Typography>

          <Stack spacing={2}>
            <Button 
              fullWidth 
              variant="contained" 
              size="large" 
              startIcon={<SchoolIcon />}
              onClick={() => navigate("/consulta")} // Rota para CPF e Nascimento
              sx={{ py: 1.5, fontSize: '1rem' }}
            >
              Sou Aluno / Responsável
            </Button>

            <Button 
              fullWidth 
              variant="outlined" 
              size="large" 
              startIcon={<AdminPanelSettingsIcon />}
              onClick={() => setModoAcesso('admin')}
              sx={{ py: 1.5, fontSize: '1rem' }}
            >
              Acesso Secretaria
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  // 2. FORMULÁRIO DE LOGIN ADMINISTRATIVO
  return (
    <Container maxWidth="xs" sx={{ height: "100vh", display: "flex", alignItems: "center" }}>
      <Paper sx={{ p: 4, width: "100%", textAlign: "center", borderRadius: 3, position: 'relative' }} elevation={4}>
        <IconButton 
          onClick={() => setModoAcesso('selecao')}
          sx={{ position: 'absolute', left: 16, top: 16 }}
        >
          <ArrowBackIcon />
        </IconButton>

        <Box sx={{ mb: 2, mt: 2 }}>
          <img src="/logo.jpeg" alt="Logo CMEI Jean Piaget" style={{ maxWidth: '150px', height: 'auto' }} />
        </Box>

        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
          Login Administrativo
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleLogin}>
          <TextField 
            fullWidth 
            label="E-mail" 
            variant="outlined" 
            sx={{ mb: 2 }} 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <TextField 
            fullWidth 
            label="Senha" 
            type="password" 
            variant="outlined" 
            sx={{ mb: 3 }} 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <Button 
            fullWidth 
            size="large" 
            type="submit" 
            variant="contained" 
            disabled={loading} 
            sx={{ py: 1.5, fontWeight: 'bold' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Entrar"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}