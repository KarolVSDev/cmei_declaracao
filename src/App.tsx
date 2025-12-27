// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import Home from "./pages/Home";
import Login from "./pages/Home/Login"; 
import { CircularProgress, Box } from "@mui/material";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (initialLoad && currentUser) {
        await signOut(auth);
        setInitialLoad(false);
        return;
      }
      setUser(currentUser);
      setLoading(false);
      setInitialLoad(false);
    });
    return () => unsubscribe();
  }, [initialLoad]);

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
        {/* 1. Rota Raiz: Se NÃO houver usuário, mostra Login. Se HOUVER, manda para /home */}
        <Route 
          path="/" 
          element={!user ? <Login /> : <Navigate to="/home" replace />} 
        />
        
        {/* 2. Rota Home: Só acessível se houver usuário. Se não, manda para o Login (/) */}
        <Route 
          path="/home" 
          element={user ? <Home /> : <Navigate to="/" replace />} 
        />

        {/* 3. Rota de Login legada: Redireciona para a raiz oficial */}
        <Route path="/login" element={<Navigate to="/" replace />} />

        {/* 4. Rota Curinga: Qualquer erro volta para a raiz */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}