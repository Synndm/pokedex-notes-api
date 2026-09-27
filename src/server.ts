import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { notesRouter } from './routes/notes.js';

const app = express();
const PORT = process.env.PORT ?? 3333;

// Em produção, só o endereço do front pode chamar a API.
// Sem a variável (no seu computador), qualquer origem é aceita.
app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }));
app.use(express.json());

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.use('/notes', notesRouter);

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
