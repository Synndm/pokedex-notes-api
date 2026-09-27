import { Router, type Response } from 'express';
import {
    createNote,
    deleteNote,
    listNotes,
    NotFoundError,
    updateNote,
} from '../services/crudcrud.js';

export const notesRouter = Router();

// Traduz o erro para o status HTTP certo
function handleError(error: unknown, res: Response) {
    if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
        return;
    }

    console.error(error);

    // 502: o nosso servidor está bem, quem falhou foi o crudcrud
    res.status(502).json({ error: 'Serviço de anotações indisponível. Tente novamente.' });
}

function isValidDescription(description: unknown): description is string {
    return typeof description === 'string' && description.trim().length > 0;
}

// GET /notes ou GET /notes?pokemonId=25
notesRouter.get('/', async (req, res) => {
    const pokemonId = req.query.pokemonId
        ? Number(req.query.pokemonId)
        : undefined;

    if (pokemonId !== undefined && Number.isNaN(pokemonId)) {
        res.status(400).json({ error: 'pokemonId precisa ser um número' });
        return;
    }

    try {
        res.json(await listNotes(pokemonId));
    } catch (error) {
        handleError(error, res);
    }
});

// POST /notes  body: { pokemonId, description }
notesRouter.post('/', async (req, res) => {
    const { pokemonId, description } = req.body ?? {};

    if (typeof pokemonId !== 'number' || !isValidDescription(description)) {
        res.status(400).json({ error: 'Envie pokemonId (número) e description (texto)' });
        return;
    }

    try {
        const note = await createNote({ pokemonId, description: description.trim() });

        res.status(201).json(note);
    } catch (error) {
        handleError(error, res);
    }
});

// PUT /notes/:id  body: { description }
notesRouter.put('/:id', async (req, res) => {
    const { description } = req.body ?? {};

    if (!isValidDescription(description)) {
        res.status(400).json({ error: 'Envie description (texto)' });
        return;
    }

    try {
        res.json(await updateNote(req.params.id, description.trim()));
    } catch (error) {
        handleError(error, res);
    }
});

// DELETE /notes/:id
notesRouter.delete('/:id', async (req, res) => {
    try {
        await deleteNote(req.params.id);

        // 204: deu certo e não há conteúdo para devolver
        res.status(204).end();
    } catch (error) {
        handleError(error, res);
    }
});
