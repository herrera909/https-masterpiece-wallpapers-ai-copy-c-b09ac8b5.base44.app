import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export default function usePremium() {
  const [premium, setPremium] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("premium-status", {});
      setPremium(!!res.data?.premium);
      setLoggedIn(!!res.data?.loggedIn);
    } catch (e) {
      setPremium(false);
      setLoggedIn(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { premium, loggedIn, loading, refresh };
}