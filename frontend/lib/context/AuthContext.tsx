"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { UserProfile, AuthSession } from "@/backend/types";
import { getClientSession, updateClientSession, signOut, signIn as apiSignIn, signUp as apiSignUp } from "@/backend/auth/client";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  profileImage: string;
  displayName: string;
  login: (
    email: string,
    pass: string,
    category?: string,
    answers?: any,
    computedScore?: number,
    percentage?: number,
    wellnessLevel?: string
  ) => Promise<AuthSession>;
  signUp: (
    name: string,
    email: string,
    pass: string,
    category?: string,
    initialAnswers?: any,
    answers?: any,
    computedScore?: number,
    percentage?: number,
    wellnessLevel?: string,
    phone?: string,
    dob?: string,
    country?: string,
    gender?: string
  ) => Promise<AuthSession>;
  updateUser: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const DEFAULT_AVATAR = "";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const session = getClientSession();
        if (session?.user && session.isAuthenticated) {
          return {
            ...session.user,
            avatar: session.user.avatar || session.user.profileImage || "",
            profileImage: session.user.profileImage || session.user.avatar || "",
          };
        }
      } catch {
        // ignore
      }
    }
    return null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const session = getClientSession();
        return Boolean(session?.isAuthenticated && session?.user?.id);
      } catch {
        // ignore
      }
    }
    return false;
  });
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const session = getClientSession();
        if (session?.isAuthenticated && session?.user?.id) {
          return false;
        }
      } catch {
        // ignore
      }
    }
    return true;
  });

  // Sync state from client session & backend API
  const syncSession = useCallback(async () => {
    if (typeof window === "undefined") return;

    try {
      const session = getClientSession();
      if (session?.user && session.isAuthenticated) {
        const normalizedUser: UserProfile = {
          ...session.user,
          avatar: session.user.avatar || session.user.profileImage || "",
          profileImage: session.user.profileImage || session.user.avatar || "",
        };
        setUser(normalizedUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }

      // Fetch fresh profile from API to ensure DB synchronization
      if (session?.isAuthenticated && session.user?.id) {
        try {
          const res = await fetch("/api/profile");
          if (res.ok) {
            const data = await res.json();
            if (data && !data.error && data.id) {
              const freshUser: UserProfile = {
                id: data.id,
                name: data.name || data.sanctuaryName || session.user?.name || "",
                sanctuaryName: data.sanctuaryName || data.name || session.user?.sanctuaryName || "",
                email: data.email || session.user?.email || "",
                avatar: data.avatar || data.profileImage || session.user?.avatar || "",
                profileImage: data.profileImage || data.avatar || session.user?.profileImage || "",
                selectedCategory: data.category || data.selectedCategory || session.user?.selectedCategory || "student",
                streakDays: typeof data.streakDays === "number" ? data.streakDays : (session.user?.streakDays ?? 1),
                mindfulnessMinutes: typeof data.mindfulnessMinutes === "number" ? data.mindfulnessMinutes : (session.user?.mindfulnessMinutes ?? 0),
                currentMood: data.currentMood || session.user?.currentMood || "Calm",
                role: session.user?.role,
                onboardingCompleted: session.user?.onboardingCompleted,
                hasLoggedInBefore: typeof data.hasLoggedInBefore === "boolean" ? data.hasLoggedInBefore : session.user?.hasLoggedInBefore,
                loginCount: typeof data.loginCount === "number" ? data.loginCount : session.user?.loginCount,
                isFirstLogin: typeof data.isFirstLogin === "boolean" ? data.isFirstLogin : session.user?.isFirstLogin,
              };

              setUser(freshUser);
              setIsAuthenticated(true);

              // Update client storage
              updateClientSession({
                ...session,
                user: freshUser,
                isAuthenticated: true,
              });
            } else if (res.status === 401) {
              setUser(null);
              setIsAuthenticated(false);
            }
          } else if (res.status === 401) {
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (err) {
          console.error("[AuthContext] API sync error:", err);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    syncSession();

    // Listen for custom auth events across components
    const handleAuthChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ session: AuthSession | null }>;
      const s = customEvent.detail?.session;
      if (s?.user && s.isAuthenticated) {
        const u = s.user;
        setUser({
          ...u,
          avatar: u.avatar || u.profileImage || DEFAULT_AVATAR,
          profileImage: u.profileImage || u.avatar || DEFAULT_AVATAR,
        });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    window.addEventListener("manraah_auth_changed", handleAuthChange);
    window.addEventListener("storage", syncSession);

    return () => {
      window.removeEventListener("manraah_auth_changed", handleAuthChange);
      window.removeEventListener("storage", syncSession);
    };
  }, [syncSession]);

  const login = useCallback(
    async (
      email: string,
      pass: string,
      category?: string,
      answers?: any,
      computedScore?: number,
      percentage?: number,
      wellnessLevel?: string
    ): Promise<AuthSession> => {
      setLoading(true);
      try {
        const session = await apiSignIn(
          email,
          pass,
          category,
          answers,
          computedScore,
          percentage,
          wellnessLevel
        );

        if (session?.user && session.isAuthenticated) {
          const normalizedUser: UserProfile = {
            ...session.user,
            avatar: session.user.avatar || session.user.profileImage || "",
            profileImage: session.user.profileImage || session.user.avatar || "",
          };
          setUser(normalizedUser);
          setIsAuthenticated(true);
        }
        return session;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const signUp = useCallback(
    async (
      name: string,
      email: string,
      pass: string,
      category?: string,
      initialAnswers?: any,
      answers?: any,
      computedScore?: number,
      percentage?: number,
      wellnessLevel?: string,
      phone?: string,
      dob?: string,
      country?: string,
      gender?: string
    ): Promise<AuthSession> => {
      setLoading(true);
      try {
        const session = await apiSignUp(
          name,
          email,
          pass,
          category,
          initialAnswers,
          answers,
          computedScore,
          percentage,
          wellnessLevel,
          phone,
          dob,
          country,
          gender
        );

        if (session?.user && session.isAuthenticated) {
          const normalizedUser: UserProfile = {
            ...session.user,
            avatar: session.user.avatar || session.user.profileImage || "",
            profileImage: session.user.profileImage || session.user.avatar || "",
          };
          setUser(normalizedUser);
          setIsAuthenticated(true);
        }
        return session;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateUser = useCallback(async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    const current = user || getClientSession().user;
    if (!current) throw new Error("No active user session to update.");

    const targetAvatar = updates.profileImage || updates.avatar || current.profileImage || current.avatar || DEFAULT_AVATAR;

    // Call backend profile PUT endpoint
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: updates.name || updates.sanctuaryName || current.name || current.sanctuaryName,
        sanctuaryName: updates.sanctuaryName || updates.name || current.sanctuaryName || current.name,
        category: updates.selectedCategory || current.selectedCategory,
        avatar: targetAvatar,
        profileImage: targetAvatar,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to update profile.");
    }

    const resData = await res.json();
    const updatedUserObj: UserProfile = {
      ...current,
      ...updates,
      ...(resData.user || {}),
      avatar: targetAvatar,
      profileImage: targetAvatar,
      name: updates.name || (resData.user && resData.user.name) || current.name,
      sanctuaryName: updates.sanctuaryName || (resData.user && resData.user.sanctuaryName) || current.sanctuaryName,
    };

    setUser(updatedUserObj);

    const existingSession = getClientSession();
    updateClientSession({
      ...existingSession,
      user: updatedUserObj,
      isAuthenticated: true,
    });

    return updatedUserObj;
  }, [user]);

  const refreshUser = useCallback(async () => {
    await syncSession();
  }, [syncSession]);

  const logout = useCallback(async () => {
    setUser(null);
    setIsAuthenticated(false);
    await signOut();
  }, []);

  const profileImage = user?.profileImage || user?.avatar || DEFAULT_AVATAR;
  const displayName = user?.name || user?.sanctuaryName || "";

  const value = {
    user,
    isAuthenticated,
    loading,
    profileImage,
    displayName,
    login,
    signUp,
    updateUser,
    refreshUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
