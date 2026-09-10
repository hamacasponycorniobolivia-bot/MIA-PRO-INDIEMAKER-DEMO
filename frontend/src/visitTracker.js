const VISITOR_KEY = 'mia_pro_visitor_id';

function getVisitorId() {
  let visitorId = localStorage.getItem(VISITOR_KEY);

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, visitorId);
  }

  return visitorId;
}

export async function trackVisit() {
  try {
    await fetch('/api/visits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        visitor_id: getVisitorId(),
        path: window.location.pathname,
      }),
      keepalive: true,
    });
  } catch {
    // El tracking nunca debe afectar el funcionamiento de MIA.
  }
}
