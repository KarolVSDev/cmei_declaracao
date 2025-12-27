// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import Home from "./pages/Home";
import Login from "./pages/Home/Login"; 
import { CircularProgress, Box } from "@mui/material";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // SE VOCÊ NÃO TIVER ESTE BLOCO, O PROBLEMA VAI CONTINUAR:
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
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/" 
          element={user ? <Home /> : <Navigate to="/login" replace />} 
        />
        {/* Rota curinga para evitar caminhos inexistentes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}