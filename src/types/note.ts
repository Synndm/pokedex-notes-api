// Anotação completa, do jeito que fica salva no crudcrud
export interface Note {
    _id: string;
    pokemonId: number;
    description: string;
    createdAt: string;
    updatedAt?: string;
}

// O que o front precisa mandar para criar uma anotação
export type NoteInput = Pick<Note, 'pokemonId' | 'description'>;
