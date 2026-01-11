import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore, collection, addDoc, query, where, orderBy, getDocs, deleteDoc, doc, serverTimestamp, updateDoc, getDoc } from 'firebase/firestore';

// Helper to get env vars from either import.meta.env (Vite) or process.env (Node/Compat)
const getEnv = (key: string) => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
  }
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
      // @ts-ignore
      return process.env[key];
  }
  return undefined;
};

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID')
};

let app: FirebaseApp | undefined;
let auth: Auth;
let db: Firestore;
let googleProvider: GoogleAuthProvider;

try {
    // Singleton pattern
    if (firebaseConfig.apiKey) {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    }
} catch (e) {
    console.warn("Firebase initialization failed:", e);
}

// Export services. Note: If config is missing, these might be undefined or mock objects.
// Consumers should check isFirebaseConfigured() before using them.
if (app) {
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
} else {
    // @ts-ignore
    auth = {};
    // @ts-ignore
    db = {};
    // @ts-ignore
    googleProvider = {};
}

export { auth, googleProvider, db };

export const isFirebaseConfigured = () => {
    return !!(app && firebaseConfig.apiKey);
};

// --- HISTORY & CLOUD SAVE SERVICES ---

export interface SavedContentItem {
    id?: string;
    uid: string;
    type: 'assignment' | 'notes' | 'report' | 'viva';
    title: string;
    content: string;
    diagrams?: Record<string, string>;
    createdAt?: any;
    updatedAt?: any;
    config?: any; // To store settings like font, color etc.
}

export const saveToHistory = async (data: Omit<SavedContentItem, 'createdAt' | 'updatedAt'>, docId?: string) => {
    if (!db) throw new Error("Database not initialized");
    
    const collectionRef = collection(db, 'saved_content');
    
    try {
        if (docId) {
            // Update existing
            const docRef = doc(db, 'saved_content', docId);
            await updateDoc(docRef, {
                ...data,
                updatedAt: serverTimestamp()
            });
            return docId;
        } else {
            // Create new
            const docRef = await addDoc(collectionRef, {
                ...data,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return docRef.id;
        }
    } catch (error) {
        console.error("Error saving to history:", error);
        throw error;
    }
};

export const fetchUserHistory = async (uid: string) => {
    if (!db) return [];
    
    try {
        const q = query(
            collection(db, 'saved_content'), 
            where("uid", "==", uid),
            orderBy("updatedAt", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as SavedContentItem[];
    } catch (error) {
        console.error("Error fetching history:", error);
        throw error;
    }
};

export const deleteHistoryItem = async (docId: string) => {
    if (!db) return;
    try {
        await deleteDoc(doc(db, 'saved_content', docId));
    } catch (error) {
        console.error("Error deleting history item:", error);
        throw error;
    }
};

export const getHistoryItem = async (docId: string) => {
    if (!db) return null;
    try {
        const docSnap = await getDoc(doc(db, 'saved_content', docId));
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as SavedContentItem;
        }
        return null;
    } catch (error) {
        console.error("Error fetching item:", error);
        throw error;
    }
};