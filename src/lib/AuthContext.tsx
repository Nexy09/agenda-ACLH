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
  stopImpersonating: () => void;
  isImpersonating: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [realUser, setRealUser] = useState<UserProfile | null>(null);
  const [impersonatedUserId, setImpersonatedUserId] = useState<string | null>(null);
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
            setRealUser({ id: userDoc.id, ...userDoc.data() } as UserProfile);
          } else {
            setRealUser(null);
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          setRealUser(null);
        }
      } else {
        setRealUser(null);
      }
      setIsLoaded(true);
    });
    return () => unsub();
  }, []);

  const activeUser = impersonatedUserId 
    ? allUsers.find(u => u.id === impersonatedUserId) || realUser 
    : realUser;

  useEffect(() => {
    if (isLoaded) {
      if (!activeUser && pathname !== "/login") {
        router.push("/login");
      } else if (activeUser && pathname === "/login") {
        router.push("/");
      }
    }
  }, [activeUser, isLoaded, pathname, router]);

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

      setRealUser(newUser);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const logout = async () => {
    if (impersonatedUserId) {
      setImpersonatedUserId(null);
      return;
    }
    await signOut(auth);
    setRealUser(null);
    router.push("/login");
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
    if (!activeUser) return;
    try {
      await updateDoc(doc(db, "users", activeUser.id), profile);
      // Wait for onSnapshot to update it automatically
    } catch (e) {
      console.error(e);
    }
  };

  const getAllUsers = () => {
    if (!realUser?.isAdmin) return [];
    return allUsers;
  };

  const getUserById = (id: string) => {
    return allUsers.find(u => u.id === id);
  };

  const loginAsUser = async (userId: string) => {
    if (!realUser?.isAdmin) return;
    setImpersonatedUserId(userId);
    router.push("/");
  };
  
  const stopImpersonating = () => {
    setImpersonatedUserId(null);
    router.push("/admin");
  }

  if (!isLoaded) return <div className="h-screen w-screen bg-[var(--background)] flex items-center justify-center">Chargement...</div>;

  return (
    <AuthContext.Provider value={{ 
      user: activeUser, 
      login, 
      register, 
      logout, 
      updateProfile, 
      getAllUsers, 
      getUserById, 
      loginAsUser,
      stopImpersonating,
      isImpersonating: !!impersonatedUserId 
    }}>
      {children}
    </AuthContext.Provider>
  );
}
