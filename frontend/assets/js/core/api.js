const BASE = "/api";

function getAuthHeaders() {
  const headers = { "Content-Type": "application/json" };
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (user && user.token) {
    headers.Authorization = `Bearer ${user.token}`;
  }
  return headers;
}

async function safeJsonResponse(res) {
  const text = await res.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(text.slice(0, 160) || "Unexpected server response");
  }
}

async function fetchIncidents() {
  const res = await fetch(`${BASE}/incidents`, { headers: getAuthHeaders() });
  const data = await safeJsonResponse(res);
  if (!res.ok) throw new Error(data?.msg || "Unable to fetch incidents");
  return data;
}

async function fetchNearby(lat, lng) {
  const res = await fetch(`${BASE}/incidents/near?lat=${lat}&lng=${lng}`, { headers: getAuthHeaders() });
  const data = await safeJsonResponse(res);
  if (!res.ok) throw new Error(data?.msg || "Unable to fetch nearby incidents");
  return data;
}

async function createIncident(data) {
  const res = await fetch(`${BASE}/incidents`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function loginUser(data) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  const json = await safeJsonResponse(res);
  if (!res.ok) throw new Error(json?.msg || "Login failed");
  return json;
}

async function getNotifications(email) {
  const res = await fetch(`${BASE}/auth/notifications?email=${encodeURIComponent(email)}`, { headers: getAuthHeaders() });
  const data = await safeJsonResponse(res);
  if (!res.ok) throw new Error(data?.msg || "Unable to load notifications");
  return data;
}

async function markNotificationsRead(email) {
  const res = await fetch(`${BASE}/auth/notifications/read`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ email })
  });
  const data = await safeJsonResponse(res);
  if (!res.ok) throw new Error(data?.msg || "Unable to mark notifications as read");
  return data;
}

async function updateLocation(data) {
  const res = await fetch(`${BASE}/auth/location`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  const response = await safeJsonResponse(res);
  if (!res.ok) throw new Error(response?.msg || "Unable to update location");
  return response;
}

async function getAdminDashboard(email) {
  const res = await fetch(`${BASE}/admin/dashboard`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ email })
  });
  const data = await safeJsonResponse(res);
  if (!res.ok) throw new Error(data?.msg || "Unable to load admin dashboard");
  return data;
}

async function getAdminUsers(email) {
  const res = await fetch(`${BASE}/admin/users`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ email })
  });
  const data = await safeJsonResponse(res);
  if (!res.ok) throw new Error(data?.msg || "Unable to load users");
  return data;
}

async function getAdminIncidents(email) {
  const res = await fetch(`${BASE}/admin/incidents`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ email })
  });
  const data = await safeJsonResponse(res);
  if (!res.ok) throw new Error(data?.msg || "Unable to load incidents");
  return data;
}

async function updateIncidentStatus(email, incidentId, status) {
  const res = await fetch(`${BASE}/admin/incidents/${incidentId}/status`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ email, status })
  });
  const data = await safeJsonResponse(res);
  if (!res.ok) throw new Error(data?.msg || "Unable to update incident status");
  return data;
}

async function deleteIncidentById(email, incidentId) {
  const res = await fetch(`${BASE}/admin/incidents/${incidentId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    body: JSON.stringify({ email })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}