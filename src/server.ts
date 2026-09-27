import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT ?? 3333;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
    res.json({ status: 'ok'})
})

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
} );