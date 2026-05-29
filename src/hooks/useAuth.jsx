import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, isMock } from '../firebase/config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Monitor Auth State
  useEffect(() => {
    if (isMock) {
      // Mock Auth State Handler
      const storedUser = localStorage.getItem('social_media_auth_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    } else {
      // Real Firebase Handler
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          console.log('[OmniSocial] Auth state changed: user signed in', firebaseUser.email);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          });
        } else {
          console.log('[OmniSocial] Auth state changed: no user');
          setUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    }
  }, []);

  // Login action
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    if (isMock) {
      // Simulating network latency
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockUsers = JSON.parse(localStorage.getItem('social_media_mock_users') || '[]');
      const existingUser = mockUsers.find(u => u.email === email);
      if (!existingUser) {
        setError('No account found with this email. Please register first.');
        setLoading(false);
        throw new Error('User not found');
      }
      if (existingUser.password !== password) {
        setError('Incorrect password.');
        setLoading(false);
        throw new Error('Incorrect password');
      }
      const loggedUser = { uid: existingUser.uid, email: existingUser.email, displayName: email.split('@')[0] };
      localStorage.setItem('social_media_auth_user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      setLoading(false);
      return loggedUser;
    } else {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        const loggedUser = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email.split('@')[0],
        };
        console.log('[OmniSocial] Login success:', loggedUser.email);
        setUser(loggedUser);
        setLoading(false);
        return loggedUser;
      } catch (err) {
        let msg = 'Authentication failed. Please check your credentials.';
        if (err.code === 'auth/user-not-found') msg = 'No account found with this email.';
        if (err.code === 'auth/wrong-password') msg = 'Incorrect password.';
        if (err.code === 'auth/invalid-email') msg = 'Invalid email address format.';
        setError(msg);
        setLoading(false);
        throw err;
      }
    }
  };

  // Register action
  const register = async (email, password) => {
    setLoading(true);
    setError(null);
    if (isMock) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockUsers = JSON.parse(localStorage.getItem('social_media_mock_users') || '[]');
      if (mockUsers.some(u => u.email === email)) {
        setError('An account with this email already exists.');
        setLoading(false);
        throw new Error('User already exists');
      }
      const newUser = { uid: 'mock_uid_' + Date.now(), email, password };
      mockUsers.push(newUser);
      localStorage.setItem('social_media_mock_users', JSON.stringify(mockUsers));
      
      const loggedUser = { uid: newUser.uid, email: newUser.email, displayName: email.split('@')[0] };
      localStorage.setItem('social_media_auth_user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      setLoading(false);
      return loggedUser;
    } else {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        const loggedUser = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.email.split('@')[0],
        };
        console.log('[OmniSocial] Signup success:', loggedUser.email);
        setUser(loggedUser);
        setLoading(false);
        return loggedUser;
      } catch (err) {
        let msg = 'Registration failed.';
        if (err.code === 'auth/email-already-in-use') msg = 'An account with this email already exists.';
        if (err.code === 'auth/invalid-email') msg = 'Invalid email format.';
        if (err.code === 'auth/weak-password') msg = 'Password must be at least 6 characters.';
        setError(msg);
        setLoading(false);
        throw err;
      }
    }
  };

  // Logout action
  const logout = async () => {
    setLoading(true);
    if (isMock) {
      localStorage.removeItem('social_media_auth_user');
      setUser(null);
      setLoading(false);
    } else {
      try {
        await signOut(auth);
        setUser(null);
        setLoading(false);
      } catch (err) {
        setError('Sign out failed');
        setLoading(false);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, isMock }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
