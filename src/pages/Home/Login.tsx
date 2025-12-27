import React, { useState } from "react";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { 
  Container, Paper, TextField, Button, Box, Alert, CircularProgress 
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home"); 
    } catch (err: any) {
      setError("E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ height: "100vh", display: "flex", alignItems: "center" }}>
      <Paper sx={{ p: 4, width: "100%", textAlign: "center", borderRadius: 3 }} elevation={4}>
        
        {/* LOGO DA ESCOLA */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
          <img 
            src="/logo.jpeg" 
            alt="Logo CMEI Jean Piaget" 
            style={{ maxWidth: '200px', height: 'auto' }} 
          />
        </Box>

        {/* <Typography variant="h6" fontWeight="bold" sx={{ color: '#1976d2', mb: 0.5 }}>
          CMEI Jean Piaget 
        </Typography> */}
        
        {/* <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Gestão Municipal de Educação 
        </Typography> */}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleLogin}>
          <TextField
            fullWidth label="E-mail" variant="outlined" sx={{ mb: 2 }}
            value={email} onChange={(e) => setEmail(e.target.value)} required
          />
          <TextField
            fullWidth label="Senha" type="password" variant="outlined" sx={{ mb: 3 }}
            value={password} onChange={(e) => setPassword(e.target.value)} required
          />
          <Button 
            fullWidth size="large" type="submit" variant="contained" 
            disabled={loading} sx={{ py: 1.5, fontWeight: 'bold' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Entrar"}
          </Button>
        </Box>
        
        {/* <Typography variant="caption" display="block" sx={{ mt: 3, color: 'text.disabled' }}>
          Prefeitura de Manaus 
        </Typography> */}
      </Paper>
    </Container>
  );
}