import { API_ENDPOINTS } from './config';

// Prédiction pour une seule ligne (live)
export async function predictOne(payload) {
  const res = await fetch(API_ENDPOINTS.predictOne, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ features: payload }),
  });

  if (!res.ok) throw new Error("Erreur API predict/one");
  return res.json();
}
