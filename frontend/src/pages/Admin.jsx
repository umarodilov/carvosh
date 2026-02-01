import { useEffect, useMemo, useState } from "react";
import "./admin.css";
import {
    getServices,
    updateService,
    getOrders,
    deleteOrder,
    getUsers,
    setUserRole,
} from "../api";

const fmtDate = (iso) => {
    try {
        return new Date(iso).toLocaleString();
    } catch {
        return iso;
    }
};

const money = (n) => {
    const x = Number(n || 0);
    return x.toLocaleString() + " сом";
};

export default function Admin() {
    const [tab, setTab] = useState("services"); // services | orders | users
    const [q, setQ] = useState("");

    const [loading, setLoading] = useState(true);

    const [services, setServices] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);

    // toast/simple message
    const [msg, setMsg] = useState("");

    const loadAll = async () => {
        setLoading(true);
        setMsg("");
        try {
            const [sv, od, us] = await Promise.all([
                getServices(),
                getOrders(),
                getUsers(),
            ]);
            setServices(sv || []);
            setOrders(od || []);
            setUsers(us || []);
        } catch (e) {
            setMsg(e?.message || "Хатогӣ шуд");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredServices = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return services;
        return services.filter((x) =>
            `${x.key} ${x.title} ${x.price}`.toLowerCase().includes(s)
        );
    }, [services, q]);

    const filteredOrders = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return orders;
        return orders.filter((x) =>
            `${x.customerName} ${x.phone} ${x.carType} ${x.periodType} ${x.total}`
                .toLowerCase()
                .includes(s)
        );
    }, [orders, q]);

    const filteredUsers = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return users;
        return users.filter((x) =>
            `${x.email} ${x.role}`.toLowerCase().includes(s)
        );
    }, [users, q]);

    // SERVICES save
    const saveService = async (s) => {
        try {
            await updateService(s._id, {
                title: s.title,
                price: Number(s.price),
                key: s.key,
            });
            setMsg("✅ Service нигоҳ дошта шуд");
        } catch (e) {
            setMsg(e?.message || "Хатогӣ дар Save");
        }
    };

    // ORDERS delete (optional)
    const removeOrder = async (id) => {
        if (!confirm("Order-ро нест мекунем?")) return;
        try {
            await deleteOrder(id);
            setOrders((p) => p.filter((x) => x._id !== id));
            setMsg("🗑️ Order нест шуд");
        } catch (e) {
            setMsg(e?.message || "Хатогӣ дар delete");
        }
    };

    // USERS role change (optional)
    const changeRole = async (id, role) => {
        try {
            await setUserRole(id, role);
            setUsers((p) => p.map((u) => (u._id === id ? { ...u, role } : u)));
            setMsg("✅ Role нав шуд");
        } catch (e) {
            setMsg(e?.message || "Хатогӣ дар role");
        }
    };

    return (
        <div className="adm-root">
            <header className="adm-topbar">
                <div className="adm-brand">
                    <div className="adm-logo">A</div>
                    <div>
                        <div className="adm-title">Admin Panel</div>
                        <div className="adm-sub">Services • Orders • Users</div>
                    </div>
                </div>

                <div className="adm-actions">
                    <div className="adm-search">
                        <span className="adm-searchIcon">⌕</span>
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Ҷустуҷӯ..."
                        />
                    </div>
                    <button className="adm-btn ghost" onClick={loadAll}>
                        ⟳ Refresh
                    </button>
                </div>
            </header>

            <nav className="adm-tabs">
                <div style={{ color: "white", padding: 10 }}>
                    TAB: {tab}
                </div>

                <button
                    className={`adm-tab ${tab === "services" ? "active" : ""}`}
                    onClick={() => setTab("services")}
                >
                    Services
                    <span className="adm-pill">{services.length}</span>
                </button>
                <button
                    className={`adm-tab ${tab === "orders" ? "active" : ""}`}
                    onClick={() => setTab("orders")}
                >
                    Orders
                    <span className="adm-pill">{orders.length}</span>
                </button>
                <button
                    className={`adm-tab ${tab === "users" ? "active" : ""}`}
                    onClick={() => setTab("users")}
                >
                    Users
                    <span className="adm-pill">{users.length}</span>
                </button>
            </nav>

            {msg && <div className="adm-banner">{msg}</div>}

            <main className="adm-main">
                {loading ? (
                    <div className="adm-skeletonWrap">
                        <div className="adm-skel" />
                        <div className="adm-skel" />
                        <div className="adm-skel" />
                    </div>
                ) : (
                    <>
                        {tab === "services" && (
                            <Section title="Services">
                                {/* Desktop table */}
                                <div className="adm-tableWrap desktopOnly">
                                    <table className="adm-table">
                                        <thead>
                                        <tr>
                                            <th>Key</th>
                                            <th>Title</th>
                                            <th>Price</th>
                                            <th style={{ width: 140 }}>Action</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {filteredServices.map((s) => (
                                            <tr key={s._id}>
                                                <td>
                                                    <span className="adm-badge">{s.key}</span>
                                                </td>
                                                <td>
                                                    <input
                                                        className="adm-input"
                                                        value={s.title || ""}
                                                        onChange={(e) =>
                                                            setServices((prev) =>
                                                                prev.map((x) =>
                                                                    x._id === s._id
                                                                        ? { ...x, title: e.target.value }
                                                                        : x
                                                                )
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        className="adm-input"
                                                        type="number"
                                                        value={s.price ?? ""}
                                                        onChange={(e) =>
                                                            setServices((prev) =>
                                                                prev.map((x) =>
                                                                    x._id === s._id
                                                                        ? { ...x, price: e.target.value }
                                                                        : x
                                                                )
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    <button
                                                        className="adm-btn primary"
                                                        onClick={() => saveService(s)}
                                                    >
                                                        Save
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredServices.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="adm-empty">
                                                    Натиҷа нест
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile cards */}
                                <div className="adm-cards mobileOnly">
                                    {filteredServices.map((s) => (
                                        <div className="adm-card" key={s._id}>
                                            <div className="adm-cardHead">
                                                <span className="adm-badge">{s.key}</span>
                                                <button
                                                    className="adm-btn primary"
                                                    onClick={() => saveService(s)}
                                                >
                                                    Save
                                                </button>
                                            </div>

                                            <label className="adm-field">
                                                <span>Title</span>
                                                <input
                                                    className="adm-input"
                                                    value={s.title || ""}
                                                    onChange={(e) =>
                                                        setServices((prev) =>
                                                            prev.map((x) =>
                                                                x._id === s._id
                                                                    ? { ...x, title: e.target.value }
                                                                    : x
                                                            )
                                                        )
                                                    }
                                                />
                                            </label>

                                            <label className="adm-field">
                                                <span>Price</span>
                                                <input
                                                    className="adm-input"
                                                    type="number"
                                                    value={s.price ?? ""}
                                                    onChange={(e) =>
                                                        setServices((prev) =>
                                                            prev.map((x) =>
                                                                x._id === s._id
                                                                    ? { ...x, price: e.target.value }
                                                                    : x
                                                            )
                                                        )
                                                    }
                                                />
                                            </label>
                                        </div>
                                    ))}
                                    {filteredServices.length === 0 && (
                                        <div className="adm-emptyBox">Натиҷа нест</div>
                                    )}
                                </div>
                            </Section>
                        )}

                        {tab === "orders" && (
                            <Section title="Orders">
                                <div className="adm-tableWrap desktopOnly">
                                    <table className="adm-table">
                                        <thead>
                                        <tr>
                                            <th>Customer</th>
                                            <th>Phone</th>
                                            <th>Car</th>
                                            <th>Period</th>
                                            <th>Total</th>
                                            <th>Created</th>
                                            <th style={{ width: 110 }}>Action</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {filteredOrders.map((o) => (
                                            <tr key={o._id}>
                                                <td>
                                                    <div className="adm-strong">{o.customerName}</div>
                                                </td>
                                                <td>{o.phone}</td>
                                                <td>{o.carType}</td>
                                                <td>
                            <span className="adm-badge soft">
                              {o.periodType} × {o.periodCount}
                            </span>
                                                </td>
                                                <td className="adm-strong">{money(o.total)}</td>
                                                <td className="adm-muted">{fmtDate(o.createdAt)}</td>
                                                <td>
                                                    <button
                                                        className="adm-btn danger"
                                                        onClick={() => removeOrder(o._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredOrders.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="adm-empty">
                                                    Натиҷа нест
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="adm-cards mobileOnly">
                                    {filteredOrders.map((o) => (
                                        <div className="adm-card" key={o._id}>
                                            <div className="adm-cardHead">
                                                <div>
                                                    <div className="adm-strong">{o.customerName}</div>
                                                    <div className="adm-muted">{o.phone}</div>
                                                </div>
                                                <button
                                                    className="adm-btn danger"
                                                    onClick={() => removeOrder(o._id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>

                                            <div className="adm-grid2">
                                                <div className="adm-kv">
                                                    <span>Car</span>
                                                    <b>{o.carType}</b>
                                                </div>
                                                <div className="adm-kv">
                                                    <span>Period</span>
                                                    <b>
                                                        {o.periodType} × {o.periodCount}
                                                    </b>
                                                </div>
                                                <div className="adm-kv">
                                                    <span>Total</span>
                                                    <b>{money(o.total)}</b>
                                                </div>
                                                <div className="adm-kv">
                                                    <span>Created</span>
                                                    <b>{fmtDate(o.createdAt)}</b>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredOrders.length === 0 && (
                                        <div className="adm-emptyBox">Натиҷа нест</div>
                                    )}
                                </div>
                            </Section>
                        )}

                        {tab === "users" && (
                            <Section title="Users">
                                <div className="adm-tableWrap desktopOnly">
                                    <table className="adm-table">
                                        <thead>
                                        <tr>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Created</th>
                                            <th style={{ width: 220 }}>Action</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {filteredUsers.map((u) => (
                                            <tr key={u._id}>
                                                <td className="adm-strong">{u.email}</td>
                                                <td>
                            <span className={`adm-badge ${u.role === "admin" ? "" : "soft"}`}>
                              {u.role}
                            </span>
                                                </td>
                                                <td className="adm-muted">{fmtDate(u.createdAt)}</td>
                                                <td className="adm-actionsRow">
                                                    <button
                                                        className="adm-btn ghost"
                                                        onClick={() => changeRole(u._id, "user")}
                                                        disabled={u.role === "user"}
                                                    >
                                                        Make user
                                                    </button>
                                                    <button
                                                        className="adm-btn primary"
                                                        onClick={() => changeRole(u._id, "admin")}
                                                        disabled={u.role === "admin"}
                                                    >
                                                        Make admin
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredUsers.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="adm-empty">
                                                    Натиҷа нест
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="adm-cards mobileOnly">
                                    {filteredUsers.map((u) => (
                                        <div className="adm-card" key={u._id}>
                                            <div className="adm-cardHead">
                                                <div>
                                                    <div className="adm-strong">{u.email}</div>
                                                    <div className="adm-muted">Created: {fmtDate(u.createdAt)}</div>
                                                </div>
                                                <span className={`adm-badge ${u.role === "admin" ? "" : "soft"}`}>
                          {u.role}
                        </span>
                                            </div>

                                            <div className="adm-row">
                                                <button
                                                    className="adm-btn ghost"
                                                    onClick={() => changeRole(u._id, "user")}
                                                    disabled={u.role === "user"}
                                                >
                                                    Make user
                                                </button>
                                                <button
                                                    className="adm-btn primary"
                                                    onClick={() => changeRole(u._id, "admin")}
                                                    disabled={u.role === "admin"}
                                                >
                                                    Make admin
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <div className="adm-emptyBox">Натиҷа нест</div>
                                    )}
                                </div>
                            </Section>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <section className="adm-section">
            <div className="adm-sectionHead">
                <h3>{title}</h3>
            </div>
            {children}
        </section>
    );
}
