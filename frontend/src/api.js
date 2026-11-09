import { useEffect, useState } from "react";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export async function get(path) {
  const r = await fetch(BASE + path);
  if (!r.ok) throw new Error(`API error ${r.status} on ${path}`);
  return r.json();
}

export async function post(path, body) {
  const r = await fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`API error ${r.status} on ${path}`);
  return r.json();
}

export function useApi(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    get(path)
      .then((d) => active && setData(d))
      .catch((e) => active && setError(e))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [path, nonce]);

  return { data, error, loading, refetch: () => setNonce((n) => n + 1) };
}