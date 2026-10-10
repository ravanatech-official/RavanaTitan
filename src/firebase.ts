// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocs,
  orderBy,
  query,
  limit
} from "firebase/firestore";
import { ChatThread } from "./types/model";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAF65y8O0QhWZvgRgSOmLFoYUXUqJQgrf0",
  authDomain: "ravanatitaan.firebaseapp.com",
  projectId: "ravanatitaan",
  storageBucket: "ravanatitaan.firebasestorage.app",
  messagingSenderId: "715524847226",
  appId: "1:715524847226:web:3bfd83536e2141e7562dc3",
  measurementId: "G-BCV85N9TVC"
};

// Initialize Firebase
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics is optional in dev environments
  });
}

const STORAGE_KEY = 'ravanatitan_chat_threads';

// 1. Save / Sync Thread to Firestore + LocalStorage
export async function saveThread(thread: ChatThread): Promise<void> {
  // Always update localStorage first for instantaneous 60fps UX
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const threads: ChatThread[] = stored ? JSON.parse(stored) : [];
      const updated = threads.filter(t => t.id !== thread.id);
      updated.unshift(thread);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 50)));
    } catch {
      // Local storage quota exceeded or disabled
    }
  }

  // Sync to Firestore cloud
  try {
    const threadRef = doc(db, 'chat_threads', thread.id);
    await setDoc(threadRef, {
      id: thread.id,
      title: thread.title,
      messages: thread.messages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
        thinkingContent: m.thinkingContent || '',
        thoughtDurationSec: m.thoughtDurationSec || 0,
        model: m.model || 'Titan-314B',
      })),
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt || new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    // Graceful offline fallback
    console.debug('Firestore sync notice:', err);
  }
}

// 2. Load Threads from Firestore with LocalStorage cache
export async function loadThreads(): Promise<ChatThread[]> {
  // Load local cache immediately
  let cachedThreads: ChatThread[] = [];
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        cachedThreads = JSON.parse(stored);
      }
    } catch {
      // Ignore
    }
  }

  // Attempt Firestore load
  try {
    const threadsCol = collection(db, 'chat_threads');
    const q = query(threadsCol, orderBy('updatedAt', 'desc'), limit(30));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const firestoreThreads: ChatThread[] = [];
      snapshot.forEach(docSnap => {
        firestoreThreads.push(docSnap.data() as ChatThread);
      });
      if (firestoreThreads.length > 0) {
        return firestoreThreads;
      }
    }
  } catch (err) {
    console.debug('Firestore load notice:', err);
  }

  return cachedThreads;
}

// 3. Delete Thread from Firestore & LocalStorage
export async function deleteThreadFromStore(threadId: string): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const threads: ChatThread[] = JSON.parse(stored);
        const filtered = threads.filter(t => t.id !== threadId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      }
    } catch {
      // Ignore
    }
  }

  try {
    const threadRef = doc(db, 'chat_threads', threadId);
    await deleteDoc(threadRef);
  } catch {
    // Ignore
  }
}

export default app;
