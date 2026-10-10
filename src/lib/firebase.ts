import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

export const firebaseConfig = {
  apiKey: "AIzaSyAF65y8O0QhWZvgRgSOmLFoYUXUqJQgrf0",
  authDomain: "ravanatitaan.firebaseapp.com",
  projectId: "ravanatitaan",
  storageBucket: "ravanatitaan.firebasestorage.app",
  messagingSenderId: "715524847226",
  appId: "1:715524847226:web:3bfd83536e2141e7562dc3",
  measurementId: "G-BCV85N9TVC"
};

// Initialize Firebase App singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Analytics safely on client side
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics optional in preview containers
  });
}
