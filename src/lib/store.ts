import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface StoredMovie {
  id: string;
  title: string;
  posterPath: string | null;
  backdropPath?: string | null;
  releaseDate: string | null;
  rating: number;
  type: 'movie' | 'series';
  quality: string | null;
}

// Settings Store
interface SettingsState {
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  siteName: string;
  setSiteName: (name: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      primaryColor: '#E53935',
      setPrimaryColor: (color) => set({ primaryColor: color }),
      siteName: 'KUMASTREAM',
      setSiteName: (name) => set({ siteName: name }),
    }),
    {
      name: 'bioscope-settings',
    }
  )
);

// User Store
interface UserState {
  isAdmin: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  bookmarkedMovies: StoredMovie[];
  isBookmarked: (id: string) => boolean;
  addBookmark: (movie: StoredMovie) => void;
  removeBookmark: (id: string) => void;
  downloadEnabled: boolean;
  toggleDownload: () => void;
  viewedMovies: StoredMovie[];
  addViewedMovie: (movie: StoredMovie) => void;
  isMovieViewed: (id: string) => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      isAdmin: false,
      login: (username, password) => {
        // Simple admin authentication - in production use proper auth
        if (username === 'Admin8676' && password === 'Admin8676') {
          set({ isAdmin: true });
          return true;
        }
        return false;
      },
      logout: () => set({ isAdmin: false }),
      bookmarkedMovies: [],
      isBookmarked: (id) => get().bookmarkedMovies.some((m) => m.id === id),
      addBookmark: (movie) =>
        set((state) => ({
          bookmarkedMovies: state.bookmarkedMovies.some((m) => m.id === movie.id)
            ? state.bookmarkedMovies
            : [movie, ...state.bookmarkedMovies],
        })),
      removeBookmark: (id) =>
        set((state) => ({
          bookmarkedMovies: state.bookmarkedMovies.filter((m) => m.id !== id),
        })),
      downloadEnabled: false,
      toggleDownload: () =>
        set((state) => ({ downloadEnabled: !state.downloadEnabled })),
      viewedMovies: [],
      addViewedMovie: (movie) =>
        set((state) => {
          const filtered = state.viewedMovies.filter((m) => m.id !== movie.id);
          return { viewedMovies: [movie, ...filtered] };
        }),
      isMovieViewed: (id) => get().viewedMovies.some((m) => m.id === id),
    }),
    {
      name: 'bioscope-user',
    }
  )
);

// Sidebar Store
interface SidebarState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useSidebarStore = create<SidebarState>()((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
