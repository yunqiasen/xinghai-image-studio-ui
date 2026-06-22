import { useEffect, useState } from "react";

import { getCurrentUser, loadCurrentUser, onAuthChange, type LocalUser } from "./local-session";

export function useSessionUser() {
  const [user, setUser] = useState<LocalUser | null>(() => getCurrentUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const sync = () => setUser(getCurrentUser());
    const unsubscribe = onAuthChange(sync);
    loadCurrentUser()
      .then((next) => {
        if (mounted) setUser(next);
      })
      .catch(() => {
        if (mounted) setUser(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return { user, loading };
}
