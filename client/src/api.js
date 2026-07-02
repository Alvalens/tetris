// Fetch wrappers for the scores API. Non-2xx responses carry an
// { error: { code, message } } body; surface that message as a thrown Error.

async function request(path, options) {
  const res = await fetch(`/api${path}`, options);
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok) {
    const message = body?.error?.message ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
  return body;
}

export function getScores({ difficulty = 'all', limit = 20 } = {}) {
  const params = new URLSearchParams({ difficulty, limit: String(limit) });
  return request(`/scores?${params}`, { method: 'GET' });
}

export function postScore(payload) {
  return request('/scores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
