import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDOotKMjkpZnTBplb5E7JvlWf3PYMZR6uw",
  authDomain: "agenda-aclh.firebaseapp.com",
  projectId: "agenda-aclh",
  storageBucket: "agenda-aclh.firebasestorage.app",
  messagingSenderId: "150964381639",
  appId: "1:150964381639:web:aa2c158e154005346adbe2",
  measurementId: "G-K33L6TZKNY"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
