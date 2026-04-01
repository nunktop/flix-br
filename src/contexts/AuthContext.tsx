import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  onSnapshot,
  query,
  where,
  getDocFromServer
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { User, UserPlan, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserPlan: (userId: string, plan: UserPlan) => Promise<void>;
  updateUserDetails: (userId: string, details: Partial<User>) => Promise<void>;
  createUser: (name: string, email: string, password: string, role: UserRole, plan: UserPlan) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPremium: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Test connection to Firestore
  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          // If user exists in Auth but not in Firestore (shouldn't happen with normal flow)
          const newUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Usuário',
            email: firebaseUser.email || '',
            role: firebaseUser.email === 'redmi11jogos@gmail.com' ? 'admin' : 'user',
            plan: 'free',
            createdAt: Date.now()
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Admin only: listen to all users
  useEffect(() => {
    if (user?.role === 'admin') {
      const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
        const usersList = snapshot.docs.map(doc => doc.data() as User);
        setUsers(usersList);
      }, (error) => {
        console.error('Error fetching users:', error);
      });
      return unsubscribe;
    } else {
      setUsers([]);
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error('E-mail ou senha incorretos.');
      }
      throw new Error('Erro ao entrar. Tente novamente mais tarde.');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      const newUser: User = {
        id: firebaseUser.uid,
        name,
        email,
        role: email === 'redmi11jogos@gmail.com' ? 'admin' : 'user',
        plan: 'free',
        createdAt: Date.now()
      };
      
      const path = `users/${firebaseUser.uid}`;
      try {
        await setDoc(doc(db, path), newUser);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
      
      setUser(newUser);
      return true;
    } catch (error: any) {
      console.error('Register error:', error);
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Este e-mail já está em uso.');
      }
      if (error.code === 'auth/weak-password') {
        throw new Error('A senha deve ter pelo menos 6 caracteres.');
      }
      if (error.code === 'auth/invalid-email') {
        throw new Error('E-mail inválido.');
      }
      throw new Error(error.message || 'Erro ao criar conta. Tente novamente.');
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user: firebaseUser } = await signInWithPopup(auth, provider);
      
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) {
        const newUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Usuário',
          email: firebaseUser.email || '',
          role: firebaseUser.email === 'redmi11jogos@gmail.com' ? 'admin' : 'user',
          plan: 'free',
          createdAt: Date.now()
        };
        const path = `users/${firebaseUser.uid}`;
        try {
          await setDoc(doc(db, path), newUser);
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, path);
        }
        setUser(newUser);
      } else {
        setUser(userDoc.data() as User);
      }
      return true;
    } catch (error: any) {
      console.error('Google login error:', error);
      throw new Error('Erro ao entrar com Google. Tente novamente.');
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const updateUserPlan = async (userId: string, plan: UserPlan) => {
    const path = `users/${userId}`;
    try {
      await updateDoc(doc(db, path), { plan });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const updateUserDetails = async (userId: string, details: Partial<User>) => {
    const path = `users/${userId}`;
    try {
      // Remove sensitive fields if any
      const { password, id, ...safeDetails } = details as any;
      await updateDoc(doc(db, path), safeDetails);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const createUser = async (name: string, email: string, password: string, role: UserRole = 'user', plan: UserPlan = 'free') => {
    const tempId = Math.random().toString(36).substr(2, 9);
    const path = `users/${tempId}`;
    try {
      const newUser: User = {
        id: tempId,
        name,
        email,
        role,
        plan,
        createdAt: Date.now()
      };
      await setDoc(doc(db, path), newUser);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      return false;
    }
  };

  const deleteUser = async (userId: string) => {
    const path = `users/${userId}`;
    try {
      await deleteDoc(doc(db, path));
      if (user?.id === userId) await logout();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      users,
      login, 
      register,
      loginWithGoogle,
      logout, 
      updateUserPlan,
      updateUserDetails,
      createUser,
      deleteUser,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isPremium: user?.plan === 'premium' || user?.role === 'admin',
      loading
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
