// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
export let analytics: ReturnType<typeof getAnalytics> | null = null;

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics is optional in development/iframe environments
  });
}

export default app;
