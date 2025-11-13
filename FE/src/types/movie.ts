export interface Movie {
  id: number;
  title: string;
  genre?: string | null;
  rating?: number | null;
  posterUrl?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface MoviePayload {
  title: string;
  genre?: string | null;
  rating?: number | null;
  posterUrl?: string | null;
}

export interface MovieQuery {
  search?: string;
  genre?: string;
  sortBy?: 'title' | 'rating' | 'created';
  sortDirection?: 'asc' | 'desc';
}
