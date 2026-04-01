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
  getDocs,
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

  // Initialize users and session from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        // 1. Load users from localStorage
        const storedUsers = localStorage.getItem('flix_users');
        let currentUsers: User[] = storedUsers ? JSON.parse(storedUsers) : [];

        // 2. Create default admin if no users exist
        if (currentUsers.length === 0) {
          const defaultAdmin: User = {
            id: 'admin-001',
            name: "Admin",
            email: "admin@flixbr.com",
            password: "123",
            role: "admin",
            plan: "premium",
            createdAt: Date.now()
          };
          currentUsers = [defaultAdmin];
          localStorage.setItem('flix_users', JSON.stringify(currentUsers));
        }
        setUsers(currentUsers);

        // 3. Check for existing session
        const storedSession = localStorage.getItem('session');
        if (storedSession) {
          const sessionData = JSON.parse(storedSession);
          const foundUser = currentUsers.find(u => u.email === sessionData.email);
          if (foundUser) {
            setUser(foundUser);
          } else {
            localStorage.removeItem('session');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const foundUser = users.find(u => u.email.toLowerCase() === trimmedEmail && u.password === password);

    if (foundUser) {
      const sessionData = {
        email: foundUser.email,
        role: foundUser.role,
        plan: foundUser.plan
      };
      localStorage.setItem('session', JSON.stringify(sessionData));
      setUser(foundUser);
      return true;
    } else {
      throw new Error('Login inválido');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (password.length < 4) {
      throw new Error('A senha deve ter pelo menos 4 caracteres.');
    }

    if (users.some(u => u.email.toLowerCase() === trimmedEmail)) {
      throw new Error('Usuário já cadastrado');
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: trimmedName,
      email: trimmedEmail,
      password: password,
      role: 'user',
      plan: 'free',
      createdAt: Date.now()
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('flix_users', JSON.stringify(updatedUsers));

    // Auto login after register
    const sessionData = {
      email: newUser.email,
      role: newUser.role,
      plan: newUser.plan
    };
    localStorage.setItem('session', JSON.stringify(sessionData));
    setUser(newUser);
    
    return true;
  };

  const loginWithGoogle = async () => {
    // Keep Google login as an option but integrate with localStorage
    try {
      const provider = new GoogleAuthProvider();
      const { user: firebaseUser } = await signInWithPopup(auth, provider);
      
      const email = firebaseUser.email || '';
      let foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!foundUser) {
        foundUser = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Usuário',
          email: email,
          role: email === 'redmi11jogos@gmail.com' ? 'admin' : 'user',
          plan: 'free',
          createdAt: Date.now()
        };
        const updatedUsers = [...users, foundUser];
        setUsers(updatedUsers);
        localStorage.setItem('flix_users', JSON.stringify(updatedUsers));
      }

      const sessionData = {
        email: foundUser.email,
        role: foundUser.role,
        plan: foundUser.plan
      };
      localStorage.setItem('session', JSON.stringify(sessionData));
      setUser(foundUser);
      return true;
    } catch (error: any) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    localStorage.removeItem('session');
    setUser(null);
  };

  const updateUserPlan = async (userId: string, plan: UserPlan) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, plan } : u);
    setUsers(updatedUsers);
    localStorage.setItem('flix_users', JSON.stringify(updatedUsers));
    
    // Update current user if it's the one being changed
    if (user && user.id === userId) {
      const updatedUser = { ...user, plan };
      setUser(updatedUser);
      localStorage.setItem('session', JSON.stringify({
        email: updatedUser.email,
        role: updatedUser.role,
        plan: updatedUser.plan
      }));
    }
  };

  const updateUserDetails = async (userId: string, details: Partial<User>) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, ...details } : u);
    setUsers(updatedUsers);
    localStorage.setItem('flix_users', JSON.stringify(updatedUsers));

    if (user && user.id === userId) {
      const updatedUser = { ...user, ...details };
      setUser(updatedUser);
      localStorage.setItem('session', JSON.stringify({
        email: updatedUser.email,
        role: updatedUser.role,
        plan: updatedUser.plan
      }));
    }
  };

  const createUser = async (name: string, email: string, password: string, role: UserRole = 'user', plan: UserPlan = 'free') => {
    const trimmedEmail = email.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === trimmedEmail)) {
      return false;
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      email: trimmedEmail,
      password: password,
      role,
      plan,
      createdAt: Date.now()
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('flix_users', JSON.stringify(updatedUsers));
    return true;
  };

  const deleteUser = async (userId: string) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('flix_users', JSON.stringify(updatedUsers));
    if (user?.id === userId) logout();
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
      {loading ? (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-netflix-red border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
