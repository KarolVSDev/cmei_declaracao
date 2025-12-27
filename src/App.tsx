// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import Home from "./pages/Home";
import Login from "./pages/Home/Login";
import ConsultaAluno from "./pages/ConsultaAluno"; 
import { CircularProgress, Box } from "@mui/material";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Monitora o estado de autenticação para proteger as rotas ADM
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Tela de carregamento para evitar redirecionamentos errados (Erro removeChild)
  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* 1. PORTAL DE ENTRADA: Tela de seleção (Aluno ou Secretaria) */}
        <Route 
          path="/" 
          element={!user ? <Login /> : <Navigate to="/home" replace />} 
        />

        {/* 2. PORTAL DO ALUNO: Acesso público via CPF e Nascimento */}
        <Route path="/consulta" element={<ConsultaAluno />} />

        {/* 3. PORTAL DA SECRETARIA: Home administrativa protegida */}
        <Route 
          path="/home" 
          element={user ? <Home /> : <Navigate to="/" replace />} 
        />

        {/* 4. REDIRECIONAMENTO: Qualquer rota desconhecida volta para a seleção */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}