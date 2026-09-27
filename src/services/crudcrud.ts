import type { Note, NoteInput } from '../types/note.js';

const BASE_URL = process.env.CRUDCRUD_URL;

// Falha cedo: sem a URL o servidor nem liga
if (!BASE_URL) {
    throw new Error('A variável CRUDCRUD_URL não foi definida no .env');
}

const NOTES_URL = `${BASE_URL.replace(/\/$/, '')}/notes`;

// Erro próprio para a rota saber que deve responder 404
export class NotFoundError extends Error {}

async function request(url: string, options?: RequestInit) {
    const response = await fetch(url, {
        ...options,
        headers: { 'Content-Type': 'application/json' },
    });

    if (response.status === 404) {
        throw new NotFoundError('Anotação não encontrada');
    }

    if (!response.ok) {
        throw new Error(`crudcrud respondeu ${response.status}`);
    }

    return response;
}

export async function listNotes(pokemonId?: number): Promise<Note[]> {
    const response = await request(NOTES_URL);
    const notes: Note[] = await response.json();

    // O crudcrud não sabe filtrar, então filtramos aqui
    if (pokemonId === undefined) {
        return notes;
    }

    return notes.filter((note) => note.pokemonId === pokemonId);
}

export async function getNote(id: string): Promise<Note> {
    const response = await request(`${NOTES_URL}/${id}`);

    return response.json();
}

export async function createNote(data: NoteInput): Promise<Note> {
    const response = await request(NOTES_URL, {
        method: 'POST',
        body: JSON.stringify({
            ...data,
            createdAt: new Date().toISOString(),
        }),
    });

    return response.json();
}

export async function updateNote(id: string, description: string): Promise<Note> {
    // O PUT do crudcrud substitui o objeto inteiro,
    // então buscamos o atual para não perder os outros campos
    const { _id, ...current } = await getNote(id);

    const updated = {
        ...current,
        description,
        updatedAt: new Date().toISOString(),
    };

    // O crudcrud recusa o PUT se o body tiver _id
    await request(`${NOTES_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updated),
    });

    return { _id, ...updated };
}

export async function deleteNote(id: string): Promise<void> {
    await request(`${NOTES_URL}/${id}`, { method: 'DELETE' });
}
