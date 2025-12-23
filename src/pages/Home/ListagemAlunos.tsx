import { useState, useEffect, useMemo } from "react";
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Typography, CircularProgress, IconButton, Tooltip,
  Modal, Box, TextField, Button, MenuItem, Grid 
} from "@mui/material";
import { 
  Search, Save, PictureAsPdf, CheckCircle, Edit, Delete 
} from "@mui/icons-material";
import { 
  buscarAlunos, salvarDeclaracao, buscarDeclaracoesPorMes, editarAluno, excluirAluno 
} from "../../services/alunosService";
import { gerarPDFDeclaracao } from "../../services/pdfService";
import type { Aluno } from "../../types/Aluno";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const FASES = ["Maternal I", "Maternal II", "Maternal III", "1º Período", "2º Período"];
const TURNOS = ["Matutino", "Vespertino", "Integral"];

export const ListagemAlunos = () => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [declaracoesMes, setDeclaracoesMes] = useState<Record<string, any>>({});
  
  const [busca, setBusca] = useState("");
  const [filtroTurma, setFiltroTurma] = useState("Todas");
  const [mesAtual, setMesAtual] = useState(MESES[new Date().getMonth()]);

  // Modais
  const [modalFreq, setModalFreq] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null);
  
  // Alterado para focar em faltas
  const [dadosFreq, setDadosFreq] = useState({ dias: 20, faltas: 0 });
  const [dadosEdit, setDadosEdit] = useState<Partial<Aluno>>({});

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [listaAlunos, historicoMes] = await Promise.all([
        buscarAlunos(),
        buscarDeclaracoesPorMes(mesAtual, 2025)
      ]);
      setAlunos(listaAlunos);
      const mapeado = historicoMes.reduce((acc: any, item: any) => {
        acc[item.alunoId] = item;
        return acc;
      }, {});
      setDeclaracoesMes(mapeado);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDados(); }, [mesAtual]);

  const handleExcluir = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este aluno? Todos os dados serão perdidos.")) {
      await excluirAluno(id);
      carregarDados();
    }
  };

  const handleSalvarEdicao = async () => {
    if (alunoSelecionado?.id) {
      await editarAluno(alunoSelecionado.id, dadosEdit);
      setModalEdit(false);
      carregarDados();
    }
  };

  const handleSalvarFrequencia = async () => {
    if (!alunoSelecionado) return;
    
    // Cálculo automático de presenças com base nas faltas informadas
    const presencasCalculadas = dadosFreq.dias - dadosFreq.faltas;
    const percentualCalculado = (presencasCalculadas / dadosFreq.dias) * 100;

    await salvarDeclaracao({
      alunoId: alunoSelecionado.id!,
      alunoNome: alunoSelecionado.nome,
      mesReferencia: mesAtual,
      anoReferencia: 2025,
      diasLetivos: dadosFreq.dias,
      presencas: presencasCalculadas,
      percentual: percentualCalculado
    });
    
    setModalFreq(false);
    carregarDados();
  };

  const alunosFiltrados = useMemo(() => {
    return alunos.filter(a => 
      a.nome.toLowerCase().includes(busca.toLowerCase()) && 
      (filtroTurma === "Todas" || a.turma === filtroTurma)
    );
  }, [alunos, busca, filtroTurma]);

  const turmasDisponiveis = useMemo(() => ["Todas", ...Array.from(new Set(alunos.map(a => a.turma)))], [alunos]);

  if (loading) return <CircularProgress sx={{ display: 'block', margin: '40px auto' }} />;

  return (
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField size="small" fullWidth placeholder="Buscar pelo nome..." value={busca} onChange={(e) => setBusca(e.target.value)} InputProps={{ startAdornment: <Search /> }} />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <TextField select size="small" fullWidth label="Filtrar Turma" value={filtroTurma} onChange={(e) => setFiltroTurma(e.target.value)}>
              {turmasDisponiveis.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <TextField select size="small" fullWidth label="Mês de Referência" value={mesAtual} onChange={(e) => setMesAtual(e.target.value)}>
              {MESES.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Fase / Turma</TableCell>
              <TableCell>Turno</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alunosFiltrados.map((aluno) => {
              const freqSalva = declaracoesMes[aluno.id!];
              return (
                <TableRow key={aluno.id} hover>
                  <TableCell>{freqSalva ? <CheckCircle color="success" /> : <CheckCircle sx={{ color: '#eee' }} />}</TableCell>
                  <TableCell><strong>{aluno.nome.toUpperCase()}</strong></TableCell>
                  <TableCell>{`${aluno.fase} - ${aluno.turma}`}</TableCell>
                  <TableCell>{aluno.turno}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Lançar Faltas"><IconButton color="primary" onClick={() => { setAlunoSelecionado(aluno); setDadosFreq({ dias: freqSalva?.diasLetivos || 20, faltas: freqSalva ? (freqSalva.diasLetivos - freqSalva.presencas) : 0 }); setModalFreq(true); }}><Save /></IconButton></Tooltip>
                    <Tooltip title="Gerar PDF Oficial"><IconButton color="error" disabled={!freqSalva} onClick={() => gerarPDFDeclaracao(aluno, { mes: mesAtual, dias: freqSalva.diasLetivos, presencas: freqSalva.presencas })}><PictureAsPdf /></IconButton></Tooltip>
                    <Tooltip title="Editar Cadastro"><IconButton onClick={() => { setAlunoSelecionado(aluno); setDadosEdit(aluno); setModalEdit(true); }}><Edit /></IconButton></Tooltip>
                    <Tooltip title="Excluir"><IconButton color="default" onClick={() => handleExcluir(aluno.id!)}><Delete /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* MODAL LANÇAMENTO DE FALTAS */}
      <Modal open={modalFreq} onClose={() => setModalFreq(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', p: 4, borderRadius: 2, boxShadow: 24 }}>
          <Typography variant="h6" gutterBottom>Lançar Frequência ({mesAtual})</Typography>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
            {alunoSelecionado?.nome.toUpperCase()}
          </Typography>
          
          <TextField fullWidth label="Total de Dias Letivos" type="number" sx={{ mb: 2 }} value={dadosFreq.dias} onChange={(e) => setDadosFreq({...dadosFreq, dias: Number(e.target.value)})} />
          
          <TextField 
            fullWidth 
            label="Número de Faltas no Mês" 
            type="number" 
            sx={{ mb: 3 }} 
            value={dadosFreq.faltas} 
            onChange={(e) => setDadosFreq({...dadosFreq, faltas: Number(e.target.value)})} 
            helperText={`O sistema calculará: ${dadosFreq.dias - dadosFreq.faltas} presenças.`}
          />
          
          <Button variant="contained" fullWidth onClick={handleSalvarFrequencia} sx={{ py: 1.5 }}>
            Salvar no Sistema
          </Button>
        </Box>
      </Modal>

      {/* MODAL EDIÇÃO ALUNO */}
      <Modal open={modalEdit} onClose={() => setModalEdit(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 450, bgcolor: 'background.paper', p: 4, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>Editar Cadastro do Aluno</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Nome" value={dadosEdit.nome || ''} onChange={(e) => setDadosEdit({...dadosEdit, nome: e.target.value})} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Matrícula" value={dadosEdit.matricula || ''} onChange={(e) => setDadosEdit({...dadosEdit, matricula: e.target.value})} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField select fullWidth label="Fase" value={dadosEdit.fase || ''} onChange={(e) => setDadosEdit({...dadosEdit, fase: e.target.value})}>
                {FASES.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField fullWidth label="Turma" value={dadosEdit.turma || ''} onChange={(e) => setDadosEdit({...dadosEdit, turma: e.target.value})} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField select fullWidth label="Turno" value={dadosEdit.turno || ''} onChange={(e) => setDadosEdit({...dadosEdit, turno: e.target.value})}>
                {TURNOS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Button variant="contained" fullWidth onClick={handleSalvarEdicao}>Atualizar Dados</Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </Box>
  );
};