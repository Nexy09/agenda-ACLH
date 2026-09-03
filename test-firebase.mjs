import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, setDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDOotKMjkpZnTBplb5E7JvlWf3PYMZR6uw",
  authDomain: "agenda-aclh.firebaseapp.com",
  projectId: "agenda-aclh",
  storageBucket: "agenda-aclh.firebasestorage.app",
  messagingSenderId: "150964381639",
  appId: "1:150964381639:web:aa2c158e154005346adbe2",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function test() {
  try {
    console.log("Creating user...");
    const { user } = await createUserWithEmailAndPassword(auth, "testagent@agenda.local", "password123");
    console.log("Auth success. UID:", user.uid);
    
    console.log("Fetching users...");
    const snap = await getDocs(collection(db, "users"));
    console.log("Firestore read success. Empty:", snap.empty);
    
    console.log("Writing to users...");
    await setDoc(doc(db, "users", user.uid), { test: true });
    console.log("Firestore write success.");
  } catch (e) {
    console.error("ERROR CAUGHT:");
    console.error(e.code, e.message);
  }
  process.exit();
}

test();
