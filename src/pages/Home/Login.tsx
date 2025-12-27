import React, { useState, useEffect } from "react";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { Container, Paper, TextField, Button, Box, Alert, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
      await signInWithEmailAndPassword(auth, email, password);
      // O replace: true limpa a rota de login do histórico, evitando a tela branca
      navigate("/home", { replace: true }); 
    } catch (err: any) {
      setError("E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ height: "100vh", display: "flex", alignItems: "center" }}>
      <Paper sx={{ p: 4, width: "100%", textAlign: "center", borderRadius: 3 }} elevation={4}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
          <img src="/logo.jpeg" alt="Logo CMEI Jean Piaget" style={{ maxWidth: '200px', height: 'auto' }} />
        </Box>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleLogin}>
          <TextField fullWidth label="E-mail" variant="outlined" sx={{ mb: 2 }} value={email} onChange={(e) => setEmail(e.target.value)} required />
          <TextField fullWidth label="Senha" type="password" variant="outlined" sx={{ mb: 3 }} value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button fullWidth size="large" type="submit" variant="contained" disabled={loading} sx={{ py: 1.5, fontWeight: 'bold' }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Entrar"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}