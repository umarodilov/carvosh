// src/api.js
const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

// ===== helper барои token =====
function authHeaders() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// ===== helper барои гирифтани message аз backend =====
async function readError(r, fallback) {
    try {
        const data = await r.json();
        return data?.message || fallback;
    } catch {
        return fallback;
    }
}

// =====================
// ===== SERVICES ======
// =====================
export async function getServices() {
    const r = await fetch(`${API}/api/services`);
    if (!r.ok) throw new Error(await readError(r, "services load failed"));
    return r.json();
}

export async function insertService(payload) {
    const r = await fetch(`${API}/api/services`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
        },
        body: JSON.stringify(payload),
    });

    if (!r.ok) throw new Error(await readError(r, "service insert failed"));
    return r.json();
}

export async function updateService(id, payload) {
    const r = await fetch(`${API}/api/services/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
        },
        body: JSON.stringify(payload),
    });

    if (!r.ok) throw new Error(await readError(r, "service update failed"));
    return r.json();
}

export async function deleteService(id) {
    const r = await fetch(`${API}/api/services/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
    });

    if (!r.ok) throw new Error(await readError(r, "service delete failed"));
    return r.json();
}

// =====================
// ====== ORDERS =======
// =====================
export async function createOrder(payload) {
    const r = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!r.ok) throw new Error(await readError(r, "order create failed"));
    return r.json();
}

// 👉 ADMIN: гирифтани ҳама orders
export async function getOrders() {
    const r = await fetch(`${API}/api/orders`, {
        headers: authHeaders(),
    });

    if (!r.ok) throw new Error(await readError(r, "orders load failed"));
    return r.json();
}

// 👉 ADMIN: delete order
export async function deleteOrder(id) {
    const r = await fetch(`${API}/api/orders/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
    });

    if (!r.ok) throw new Error(await readError(r, "order delete failed"));
    return r.json();
}

// =====================
// ====== STATS ========
// =====================
export async function getStats() {
    const r = await fetch(`${API}/api/stats`);
    if (!r.ok) throw new Error(await readError(r, "stats load failed"));
    return r.json();
}

// =====================
// ======= AUTH ========
// =====================
export async function login(email, password) {
    const r = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!r.ok) throw new Error(await readError(r, "login failed"));

    const data = await r.json();
    localStorage.setItem("token", data.token);
    return data.user;
}

export async function getMe() {
    const r = await fetch(`${API}/api/auth/me`, {
        headers: authHeaders(),
    });

    if (!r.ok) return null;
    return r.json();
}

export function logout() {
    localStorage.removeItem("token");
}

// =====================
// ======= USERS =======
// =====================

// 👉 ADMIN: гирифтани ҳама users
export async function getUsers() {
    const r = await fetch(`${API}/api/users`, {
        headers: authHeaders(),
    });

    if (!r.ok) throw new Error(await readError(r, "users load failed"));
    return r.json();
}

// 👉 ADMIN: тағйири role
export async function setUserRole(id, role) {
    const r = await fetch(`${API}/api/users/${id}/role`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
        },
        body: JSON.stringify({ role }),
    });

    if (!r.ok) throw new Error(await readError(r, "role update failed"));
    return r.json();
}