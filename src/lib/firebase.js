import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDG-BFhwGNuShUYUczs5o5Rk0jUWGe7Wig",
  authDomain: "listadepresentes-18705.firebaseapp.com",
  projectId: "listadepresentes-18705",
  storageBucket: "listadepresentes-18705.firebasestorage.app",
  messagingSenderId: "1003809250270",
  appId: "1:1003809250270:web:736940ef6e02d829549b4f",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
