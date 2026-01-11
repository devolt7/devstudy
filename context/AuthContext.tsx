import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider, db, isFirebaseConfigured } from '../services/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile, StudentDetails } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (details: Partial<StudentDetails>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync User Profile from Firestore
  const fetchUserProfile = async (uid: string) => {
    if (!isFirebaseConfigured()) return;
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
      } else {
        // Create new profile if it doesn't exist
        const newProfile: UserProfile = {
          uid,
          email: auth.currentUser?.email || null,
          photoURL: auth.currentUser?.photoURL || null,
          name: auth.currentUser?.displayName || '',
          instituteName: '',
          branch: '',
          semester: '',
          enrollmentNo: '',
          subjectCode: '',
          stream: 'Engineering', // Default
          defaultSubject: '',
          isProfileComplete: false,
          createdAt: serverTimestamp(),
        };
        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    if (!isFirebaseConfigured()) {
        setLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured()) {
        console.error("Firebase not configured");
        return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const logout = async () => {
    if (!isFirebaseConfigured()) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const updateUserProfile = async (details: Partial<StudentDetails>) => {
    if (!currentUser || !isFirebaseConfigured()) return;
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      // Mark profile as complete if name and institute are present
      const isComplete = !!(details.name || userProfile?.name) && !!(details.instituteName || userProfile?.instituteName);
      
      const updates = {
        ...details,
        isProfileComplete: isComplete,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(userDocRef, updates);
      
      // Update local state optimistically
      setUserProfile(prev => prev ? ({ ...prev, ...updates }) : null);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (currentUser) await fetchUserProfile(currentUser.uid);
  };

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, signInWithGoogle, logout, updateUserProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};