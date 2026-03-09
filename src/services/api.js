// ✅ BASE URL MUST be at the top
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 🔹 Core request helper
async function apiRequest(endpoint, options = {}) {
  if (!BASE_URL) {
    throw new Error("API base URL is not defined");
  }

  const token = localStorage.getItem("token");

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "API Error");
  }

  return data;
}

/* ================= AUTH ================= */

export function loginUser(payload) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ✅ Admin create employee
export function createUser(payload) {
  return apiRequest("/auth/create-user", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ================= EMAILS ================= */

export function fetchEmails() {
  return apiRequest("/emails");
}

export function generateAIReply(emailBody) {
  return apiRequest("/ai/reply", {
    method: "POST",
    body: JSON.stringify({ emailText: emailBody }),
  });
}

/* ================= KNOWLEDGE BASE ================= */

export function fetchKnowledge() {
  return apiRequest("/knowledge");
}

/* ================= SAVED REPLIES ================= */

export function fetchSavedReplies() {
  return apiRequest("/replies");
}

export function saveReply(payload) {
  return apiRequest("/replies", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ================= ADMIN USERS ================= */

export function fetchUsers() {
  return apiRequest("/auth/users");
}

export function deleteUser(id) {
  return apiRequest(`/auth/user/${id}`, {
    method: "DELETE",
  });
}

export function updateUser(id, payload) {
  return apiRequest(`/auth/user/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/* ================= SIGNATURE ================= */

// ✅ Save Signature
export function saveSignature(payload) {
  return apiRequest("/signature/save", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Get Signature
export function fetchSignature() {
  return apiRequest("/signature");
}