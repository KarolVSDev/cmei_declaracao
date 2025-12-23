import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  AppBar,
  Toolbar,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

const declarationTypes = [
  { value: "matricula", label: "Declaração de Matrícula" },
  { value: "frequencia", label: "Declaração de Frequência" },
  { value: "renda", label: "Declaração de Renda" },
];

export default function Home() {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      alunoNome: "",
      maeNome: "",
      nascimento: "",
      tipoDeclaracao: "matricula",
      observacoes: "",
    },
  });

  const [records, setRecords] = useState([]);
  const [openSnack, setOpenSnack] = useState(false);

  const onSubmit = (data) => {
    setRecords((prev) => [...prev, { id: Date.now(), ...data }]);
    setOpenSnack(true);
    reset();
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CMEI - Sistema de Emissão de Declarações
          </Typography>
          <Typography variant="body2">Usuário: Visitante</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Cadastro de Alunos / Emissão de Declaração
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Preencha os dados abaixo e clique em "Emitir declaração" para salvar.
          </Typography>

          <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="alunoNome"
                  control={control}
                  rules={{ required: "Nome do aluno é obrigatório" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Nome do aluno"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="maeNome"
                  control={control}
                  rules={{ required: "Nome da mãe é obrigatório" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Nome da mãe"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="nascimento"
                  control={control}
                  rules={{ required: "Data de nascimento é obrigatória" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Data de nascimento"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="tipoDeclaracao"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Tipo de declaração" fullWidth>
                      {declarationTypes.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="observacoes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Observações (opcional)"
                      fullWidth
                      multiline
                      minRows={3}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                <Button variant="outlined" color="inherit" onClick={() => reset()}>
                  Limpar
                </Button>
                <Button type="submit" variant="contained">
                  Emitir declaração
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Lista de alunos/declarações cadastradas */}
        <Paper elevation={1} sx={{ p: 2, mt: 3 }}>
          <Typography variant="h6">Alunos cadastrados</Typography>
          {records.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Nenhum registro ainda.
            </Typography>
          ) : (
            <List>
              {records.map((r) => (
                <React.Fragment key={r.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={`${r.alunoNome} — ${r.tipoDeclaracao}`}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            Mãe: {r.maeNome}
                          </Typography>
                          {" — "}
                          Nasc.: {r.nascimento}
                          {r.observacoes ? ` — Obs: ${r.observacoes}` : ""}
                        </>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Container>

      <Snackbar
        open={openSnack}
        autoHideDuration={3000}
        onClose={() => setOpenSnack(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setOpenSnack(false)} severity="success" sx={{ width: "100%" }}>
          Declaração emitida com sucesso.
        </Alert>
      </Snackbar>
    </>
  );
}
