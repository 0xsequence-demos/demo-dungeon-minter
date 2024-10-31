import { useState } from "react";
import sequence from "./SequenceEmbeddedWallet.ts";

import { useEffect } from "react";

export function useSessionHash() {
  const [sessionHash, setSessionHash] = useState("");
  const [error, setError] = useState<unknown>(undefined);

  useEffect(() => {
    const handler = async () => {
      try {
        setSessionHash(await sequence.getSessionHash());
      } catch (error) {
        console.error(error);
        setError(error);
      }
    };
    handler();
    return sequence.onSessionStateChanged(handler);
  }, [setSessionHash, setError]);

  return {
    sessionHash,
    error,
    loading: !!sessionHash,
  };
}
