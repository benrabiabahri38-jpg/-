import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase/config';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  profile: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  isVendor: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setDemoRole: (role: UserRole) => void;
  updateVendorShop: (shopName: string, shopDescription: string, governorate: string, phone: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'lamia1990ben@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [demoRoleOverride, setDemoRoleOverride] = useState<UserRole | null>(() => {
    return (localStorage.getItem('soukna_demo_role') as UserRole) || null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync profile from Firestore or generate default profile
  const syncProfile = async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);

      const isSuperAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        if (isSuperAdmin && data.role !== 'admin') {
          data.role = 'admin';
          await setDoc(userRef, { role: 'admin' }, { merge: true });
        }
        setProfile(data);
      } else {
        const initialRole: UserRole = isSuperAdmin ? 'admin' : 'customer';
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'مستخدم سوقنا',
          role: initialRole,
          governorate: 'تونس',
          shopStatus: 'active',
          createdAt: new Date().toISOString(),
        };
        await setDoc(userRef, newProfile);
        setProfile(newProfile);
      }
    } catch (err) {
      console.warn('Profile sync fallback:', err);
      // Fallback local profile
      setProfile({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'مستخدم سوقنا',
        role: user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'customer',
        governorate: 'تونس',
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncProfile(user);
      } else {
        // If not signed in with Google, provide default demo guest profile
        const defaultDemoProfile: UserProfile = {
          uid: 'demo_user_1',
          email: 'demo@soukna.tn',
          displayName: 'زائر سوقنا',
          role: demoRoleOverride || 'customer',
          shopName: 'متجر الحرف التونسية الأصيلة',
          shopDescription: 'منتجات يدوية أصيلة من مختلف ربوع تونس',
          governorate: 'نابل',
          phone: '+216 98 123 456',
          shopStatus: 'active',
        };
        setProfile(defaultDemoProfile);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [demoRoleOverride]);

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Sign-in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
      setProfile(null);
      setDemoRoleOverride(null);
      localStorage.removeItem('soukna_demo_role');
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  const setDemoRole = (newRole: UserRole) => {
    setDemoRoleOverride(newRole);
    localStorage.setItem('soukna_demo_role', newRole);
    if (profile) {
      setProfile({
        ...profile,
        role: newRole,
        shopName: newRole === 'vendor' ? (profile.shopName || 'متجر الزيتون والخزف التونسي') : profile.shopName,
      });
    }
  };

  const updateVendorShop = async (shopName: string, shopDescription: string, governorate: string, phone: string) => {
    if (!profile) return;
    const updated: UserProfile = {
      ...profile,
      role: 'vendor',
      shopName,
      shopDescription,
      governorate,
      phone,
      shopStatus: 'active',
    };
    setProfile(updated);

    if (currentUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), {
          role: 'vendor',
          shopName,
          shopDescription,
          governorate,
          phone,
          shopStatus: 'active',
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
      }
    }
  };

  const effectiveRole = demoRoleOverride || profile?.role || 'customer';
  const isAdmin = effectiveRole === 'admin' || (currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());
  const isVendor = effectiveRole === 'vendor' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        role: effectiveRole,
        isAdmin,
        isVendor,
        isLoading,
        signInWithGoogle,
        signOut,
        setDemoRole,
        updateVendorShop,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
