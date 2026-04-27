const BASE = "http://localhost:5000/api";

async function fetchIncidents() {
  const res = await fetch(`${BASE}/incidents`);
  return res.json();
}

async function fetchNearby(lat, lng) {
  const res = await fetch(`${BASE}/incidents/near?lat=${lat}&lng=${lng}`);
  return res.json();
}

async function createIncident(data) {
  return fetch(`${BASE}/incidents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
}