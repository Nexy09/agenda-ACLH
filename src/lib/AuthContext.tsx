/* eslint-disable */
// @ts-nocheck
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth, db } from "./firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  getDocs,
  onSnapshot
} from "firebase/firestore";

export interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  classe?: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  login: (username: string, pass: string) => Promise<boolean>;
  register: (profile: Omit<UserProfile, "id" | "isAdmin">, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  getAllUsers: () => UserProfile[]; // For admin
  getUserById: (id: string) => UserProfile | undefined;
  loginAsUser: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  // Listen to all users so we have them locally for getUserById and getAllUsers
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const users: UserProfile[] = [];
      snapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() } as UserProfile);
      });
      setAllUsers(users);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ id: userDoc.id, ...userDoc.data() } as UserProfile);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoaded(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      if (!user && pathname !== "/login") {
        router.push("/login");
      } else if (user && pathname === "/login") {
        router.push("/");
      }
    }
  }, [user, isLoaded, pathname, router]);

  const toEmail = (username: string) => `${username.toLowerCase()}@agenda.local`;

  const login = async (username: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, toEmail(username), pass);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const register = async (profile: Omit<UserProfile, "id" | "isAdmin">, pass: string) => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, toEmail(profile.username), pass);
      
      // Check if it's the first user to make them admin
      const usersSnap = await getDocs(collection(db, "users"));
      const isAdmin = usersSnap.empty;

      const newUser: UserProfile = {
        id: firebaseUser.uid,
        ...profile,
        isAdmin
      };

      await setDoc(doc(db, "users", firebaseUser.uid), {
        username: profile.username,
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber,
        classe: profile.classe || "",
        isAdmin
      });

      setUser(newUser);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    router.push("/login");
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.id), profile);
      setUser({ ...user, ...profile });
    } catch (e) {
      console.error(e);
    }
  };

  const getAllUsers = () => {
    if (!user?.isAdmin) return [];
    return allUsers;
  };

  const getUserById = (id: string) => {
    return allUsers.find(u => u.id === id);
  };

  const loginAsUser = async (userId: string) => {
    // Firebase auth doesn't support easy "impersonation" without the password or custom tokens.
    // We would need a Cloud Function. Since this is client-side only:
    alert("La connexion en tant qu'un autre utilisateur nécessite une configuration serveur (Cloud Functions) sur Firebase. Cette fonctionnalité est désactivée.");
  };

  if (!isLoaded) return <div className="h-screen w-screen bg-[var(--background)] flex items-center justify-center">Chargement...</div>;

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, getAllUsers, getUserById, loginAsUser }}>
      {children}
    </AuthContext.Provider>
  );
}
