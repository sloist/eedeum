import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setLoading(false);

        // OAuth 신규 유저: 프로필 자동 생성
        if (currentUser && event === "SIGNED_IN" && currentUser.app_metadata?.provider !== "email") {
          const { data: existing } = await supabase
            .from("users")
            .select("id")
            .eq("id", currentUser.id)
            .maybeSingle();

          if (!existing) {
            const meta = currentUser.user_metadata;
            const displayName = meta?.full_name || meta?.name || "이듬 사용자";
            const baseHandle = (meta?.email?.split("@")[0] || "user").replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20);
            const handle = `${baseHandle}${Math.floor(Math.random() * 1000)}`;

            await supabase.rpc("create_user_profile", {
              user_id: currentUser.id,
              user_name: displayName,
              user_handle: handle,
              user_bio: "이듬에서 기록하는 사람",
            });
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
