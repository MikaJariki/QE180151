import type { Movie, MoviePayload, MovieQuery } from '../types/movie';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:5119';
const MOVIES_URL = `${API_BASE_URL}/api/movies`;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export const movieService = {
  async getMovies(params: MovieQuery = {}): Promise<Movie[]> {
    const url = new URL(MOVIES_URL);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(url.toString());
    return handleResponse<Movie[]>(response);
  },

  async getMovie(id: number): Promise<Movie> {
    const response = await fetch(`${MOVIES_URL}/${id}`);
    return handleResponse<Movie>(response);
  },

  async createMovie(payload: MoviePayload): Promise<Movie> {
    const response = await fetch(MOVIES_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    return handleResponse<Movie>(response);
  },

  async updateMovie(id: number, payload: MoviePayload): Promise<Movie> {
    const response = await fetch(`${MOVIES_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    return handleResponse<Movie>(response);
  },

  async deleteMovie(id: number): Promise<void> {
    const response = await fetch(`${MOVIES_URL}/${id}`, { method: 'DELETE' });
    await handleResponse<void>(response);
  }
};
