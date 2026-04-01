import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc,
  query,
  orderBy,
  limit,
  writeBatch
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { Movie, ContentProgress } from '../types';
import { useAuth } from './AuthContext';

interface AppContextType {
  favorites: Movie[];
  toggleFavorite: (movie: Movie) => Promise<void>;
  isFavorite: (id: number) => boolean;
  manualContent: Movie[];
  addManualContent: (movie: Movie) => Promise<void>;
  removeManualContent: (id: number) => Promise<void>;
  pinnedContentId: number | null;
  setPinnedContent: (id: number | null) => Promise<void>;
  progress: ContentProgress[];
  saveProgress: (p: ContentProgress) => Promise<void>;
  resetAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [manualContent, setManualContent] = useState<Movie[]>([]);
  const [pinnedContentId, setPinnedContentId] = useState<number | null>(null);
  const [progress, setProgress] = useState<ContentProgress[]>([]);

  // Listen to manual content (Global)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'content'), (snapshot) => {
      const content = snapshot.docs.map(doc => doc.data() as Movie);
      setManualContent(content);
    });
    return unsubscribe;
  }, []);

  // Listen to global settings (Pinned content)
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (snapshot) => {
      if (snapshot.exists()) {
        setPinnedContentId(snapshot.data().pinnedContentId || null);
      }
    });
    return unsubscribe;
  }, []);

  // Listen to user-specific data (Favorites and Progress)
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setProgress([]);
      return;
    }

    const unsubFavorites = onSnapshot(collection(db, 'users', user.id, 'favorites'), (snapshot) => {
      setFavorites(snapshot.docs.map(doc => doc.data() as Movie));
    });

    const qProgress = query(
      collection(db, 'users', user.id, 'progress'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    const unsubProgress = onSnapshot(qProgress, (snapshot) => {
      setProgress(snapshot.docs.map(doc => doc.data() as ContentProgress));
    });

    return () => {
      unsubFavorites();
      unsubProgress();
    };
  }, [user]);

  const toggleFavorite = async (movie: Movie) => {
    if (!user) return;
    const path = `users/${user.id}/favorites/${movie.id}`;
    try {
      const favRef = doc(db, path);
      if (isFavorite(movie.id)) {
        await deleteDoc(favRef);
      } else {
        await setDoc(favRef, movie);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const isFavorite = (id: number) => favorites.some(m => m.id === id);

  const addManualContent = async (movie: Movie) => {
    const path = `content/${movie.id}`;
    try {
      await setDoc(doc(db, path), movie);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const removeManualContent = async (id: number) => {
    const path = `content/${id}`;
    try {
      await deleteDoc(doc(db, path));
      if (pinnedContentId === id) await setPinnedContent(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const setPinnedContent = async (id: number | null) => {
    const path = 'settings/global';
    try {
      await setDoc(doc(db, path), { pinnedContentId: id }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const saveProgress = async (p: ContentProgress) => {
    if (!user) return;
    const path = `users/${user.id}/progress/${p.id}`;
    try {
      await setDoc(doc(db, path), p);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const resetAllData = async () => {
    if (!user) return;
    
    try {
      // Clear favorites
      const favBatch = writeBatch(db);
      favorites.forEach(f => {
        favBatch.delete(doc(db, 'users', user.id, 'favorites', f.id.toString()));
      });
      await favBatch.commit();

      // Clear progress
      const progBatch = writeBatch(db);
      progress.forEach(p => {
        progBatch.delete(doc(db, 'users', user.id, 'progress', p.id.toString()));
      });
      await progBatch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.id}`);
    }
  };

  return (
    <AppContext.Provider value={{
      favorites, toggleFavorite, isFavorite,
      manualContent, addManualContent, removeManualContent,
      pinnedContentId, setPinnedContent,
      progress, saveProgress, resetAllData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
}
