import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./admin.css";
import {
    getServices,
    updateService,
    getOrders,
    deleteOrder,
    getUsers,
    setUserRole,
    logout,
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
    const nav = useNavigate();

    const [tab, setTab] = useState("services"); // services | orders | users
    const [q, setQ] = useState("");

    const [loading, setLoading] = useState(true);

    const [services, setServices] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);

    // ✅ Филтри давраи фармоишҳо
    const [ordersRange, setOrdersRange] = useState("day"); // day | week | month

    // паёми зуд (toast/banner)
    const [msg, setMsg] = useState("");

    const doLogout = () => {
        logout(); // localStorage token тоза мешавад
        nav("/login", { replace: true });
    };

    // ✅ беҳтар: ҳатто агар orders/users хато диҳад, services нишон медиҳад
    const loadAll = async () => {
        setLoading(true);
        setMsg("");

        const errors = [];

        try {
            const sv = await getServices();
            setServices(sv || []);
        } catch (e) {
            errors.push("Хизматҳо: " + (e?.message || "хатогӣ"));
        }

        try {
            const od = await getOrders();
            setOrders(od || []);
        } catch (e) {
            errors.push("Фармоишҳо: " + (e?.message || "хатогӣ"));
        }

        try {
            const us = await getUsers();
            setUsers(us || []);
        } catch (e) {
            errors.push("Истифодабарандаҳо: " + (e?.message || "хатогӣ"));
        }

        if (errors.length) setMsg(errors.join(" | "));
        setLoading(false);
    };

    useEffect(() => {
        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ===== SEARCH FILTERS =====
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
        return users.filter((x) => `${x.email} ${x.role}`.toLowerCase().includes(s));
    }, [users, q]);

    // ✅ Orders range filter (универсалӣ)
    const rangeFilteredOrders = useMemo(() => {
        const now = new Date();
        let from = null;

        if (ordersRange === "day") {
            from = new Date();
            from.setHours(0, 0, 0, 0);
        } else if (ordersRange === "week") {
            from = new Date(now);
            from.setDate(from.getDate() - 7); // 7 рӯзи охир
        } else if (ordersRange === "month") {
            from = new Date(now);
            from.setDate(from.getDate() - 30); // 30 рӯзи охир
        }

        if (!from) return filteredOrders;

        return filteredOrders.filter((o) => {
            const d = new Date(o.createdAt);
            return d >= from;
        });
    }, [filteredOrders, ordersRange]);

    // ===== Хизмат: нигоҳ доштан =====
    const saveService = async (s) => {
        try {
            await updateService(s._id, {
                title: s.title,
                price: Number(s.price),
                key: s.key,
            });
            setMsg("✅ Хизмат нигоҳ дошта шуд");
        } catch (e) {
            setMsg(e?.message || "Хатогӣ ҳангоми нигоҳ доштан");
        }
    };

    // ===== Фармоиш: нест кардан =====
    const removeOrder = async (id) => {
        if (!confirm("Фармоишро нест мекунем?")) return;
        try {
            await deleteOrder(id);
            setOrders((p) => p.filter((x) => x._id !== id));
            setMsg("🗑️ Фармоиш нест шуд");
        } catch (e) {
            setMsg(e?.message || "Хатогӣ ҳангоми нест кардан");
        }
    };

    // ===== User: role иваз кардан =====
    const changeRole = async (id, role) => {
        try {
            await setUserRole(id, role);
            setUsers((p) => p.map((u) => (u._id === id ? { ...u, role } : u)));
            setMsg("✅ Нақш (Role) нав шуд");
        } catch (e) {
            setMsg(e?.message || "Хатогӣ ҳангоми иваз кардани нақш");
        }
    };

    return (
        <div className="adm-root">
            <header className="adm-topbar">
                <div className="adm-brand">
                    <div className="adm-logo">A</div>
                    <div>
                        <div className="adm-title">Панели Админ</div>
                        <div className="adm-sub">
                            Хизматҳо • Фармоишҳо • Истифодабарандаҳо
                        </div>
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
                        ⟳ Навсозӣ
                    </button>

                    <button className="adm-btn danger" onClick={doLogout}>
                        ⎋ Баромадан
                    </button>
                </div>
            </header>

            <nav className="adm-tabs">
                <button
                    className={`adm-tab ${tab === "services" ? "active" : ""}`}
                    onClick={() => setTab("services")}
                >
                    Хизматҳо <span className="adm-pill">{services.length}</span>
                </button>

                <button
                    className={`adm-tab ${tab === "orders" ? "active" : ""}`}
                    onClick={() => setTab("orders")}
                >
                    Фармоишҳо <span className="adm-pill">{orders.length}</span>
                </button>

                <button
                    className={`adm-tab ${tab === "users" ? "active" : ""}`}
                    onClick={() => setTab("users")}
                >
                    Истифодабарандаҳо <span className="adm-pill">{users.length}</span>
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
                        {/* ================== ХИЗМАТҲО ================== */}
                        {tab === "services" && (
                            <Section title="Хизматҳо">
                                {/* Desktop table */}
                                <div className="adm-tableWrap desktopOnly">
                                    <table className="adm-table">
                                        <thead>
                                        <tr>
                                            <th>Калид</th>
                                            <th>Ном</th>
                                            <th>Нарх</th>
                                            <th style={{ width: 160 }}>Амалиёт</th>
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
                                                        Нигоҳ доштан
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
                                                    Нигоҳ доштан
                                                </button>
                                            </div>

                                            <label className="adm-field">
                                                <span>Ном</span>
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
                                                <span>Нарх</span>
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

                        {/* ================== ФАРМОИШҲО ================== */}
                        {tab === "orders" && (
                            <Section
                                title="Фармоишҳо"
                                right={
                                    <div className="adm-range">
                                        <button
                                            className={`adm-rangeBtn ${
                                                ordersRange === "day" ? "on" : ""
                                            }`}
                                            onClick={() => setOrdersRange("day")}
                                            type="button"
                                        >
                                            1 рӯз
                                        </button>
                                        <button
                                            className={`adm-rangeBtn ${
                                                ordersRange === "week" ? "on" : ""
                                            }`}
                                            onClick={() => setOrdersRange("week")}
                                            type="button"
                                        >
                                            1 ҳафта
                                        </button>
                                        <button
                                            className={`adm-rangeBtn ${
                                                ordersRange === "month" ? "on" : ""
                                            }`}
                                            onClick={() => setOrdersRange("month")}
                                            type="button"
                                        >
                                            1 моҳ
                                        </button>
                                    </div>
                                }
                            >
                                <div className="adm-tableWrap desktopOnly">
                                    <table className="adm-table">
                                        <thead>
                                        <tr>
                                            <th>Мизоҷ</th>
                                            <th>Телефон</th>
                                            <th>Мошин</th>
                                            <th>Мӯҳлат</th>
                                            <th>Ҷамъ</th>
                                            <th>Сана</th>
                                            <th style={{ width: 120 }}>Амалиёт</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {rangeFilteredOrders.map((o) => (
                                            <tr key={o._id}>
                                                <td className="adm-strong">{o.customerName}</td>
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
                                                        Нест кардан
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}

                                        {rangeFilteredOrders.length === 0 && (
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
                                    {rangeFilteredOrders.map((o) => (
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
                                                    Нест кардан
                                                </button>
                                            </div>

                                            <div className="adm-grid2">
                                                <div className="adm-kv">
                                                    <span>Мошин</span>
                                                    <b>{o.carType}</b>
                                                </div>
                                                <div className="adm-kv">
                                                    <span>Мӯҳлат</span>
                                                    <b>
                                                        {o.periodType} × {o.periodCount}
                                                    </b>
                                                </div>
                                                <div className="adm-kv">
                                                    <span>Ҷамъ</span>
                                                    <b>{money(o.total)}</b>
                                                </div>
                                                <div className="adm-kv">
                                                    <span>Сана</span>
                                                    <b>{fmtDate(o.createdAt)}</b>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {rangeFilteredOrders.length === 0 && (
                                        <div className="adm-emptyBox">Натиҷа нест</div>
                                    )}
                                </div>
                            </Section>
                        )}

                        {/* ================== ИСТИФОДАБАРАНДАҲО ================== */}
                        {tab === "users" && (
                            <Section title="Истифодабарандаҳо">
                                <div className="adm-tableWrap desktopOnly">
                                    <table className="adm-table">
                                        <thead>
                                        <tr>
                                            <th>Email</th>
                                            <th>Нақш</th>
                                            <th>Сана</th>
                                            <th style={{ width: 240 }}>Амалиёт</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {filteredUsers.map((u) => (
                                            <tr key={u._id}>
                                                <td className="adm-strong">{u.email}</td>
                                                <td>
                            <span
                                className={`adm-badge ${
                                    u.role === "admin" ? "" : "soft"
                                }`}
                            >
                              {u.role === "admin"
                                  ? "админ"
                                  : "истифодабаранда"}
                            </span>
                                                </td>
                                                <td className="adm-muted">{fmtDate(u.createdAt)}</td>
                                                <td className="adm-actionsRow">
                                                    <button
                                                        className="adm-btn ghost"
                                                        onClick={() => changeRole(u._id, "user")}
                                                        disabled={u.role === "user"}
                                                    >
                                                        Корбар
                                                    </button>
                                                    <button
                                                        className="adm-btn primary"
                                                        onClick={() => changeRole(u._id, "admin")}
                                                        disabled={u.role === "admin"}
                                                    >
                                                        Админ
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
                                                    <div className="adm-muted">
                                                        Сана: {fmtDate(u.createdAt)}
                                                    </div>
                                                </div>
                                                <span
                                                    className={`adm-badge ${
                                                        u.role === "admin" ? "" : "soft"
                                                    }`}
                                                >
                          {u.role === "admin"
                              ? "админ"
                              : "истифодабаранда"}
                        </span>
                                            </div>

                                            <div className="adm-row">
                                                <button
                                                    className="adm-btn ghost"
                                                    onClick={() => changeRole(u._id, "user")}
                                                    disabled={u.role === "user"}
                                                >
                                                    Корбар
                                                </button>
                                                <button
                                                    className="adm-btn primary"
                                                    onClick={() => changeRole(u._id, "admin")}
                                                    disabled={u.role === "admin"}
                                                >
                                                    Админ
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

function Section({ title, right, children }) {
    return (
        <section className="adm-section">
            <div className="adm-sectionHead">
                <h3>{title}</h3>
                {right ? <div className="adm-sectionRight">{right}</div> : null}
            </div>
            {children}
        </section>
    );
}

/*
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./admin.css";
import {
    getServices,
    updateService,
    getOrders,
    deleteOrder,
    getUsers,
    setUserRole,
    logout,
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
    const nav = useNavigate();

    const [tab, setTab] = useState("services"); // services | orders | users
    const [q, setQ] = useState("");

    const [loading, setLoading] = useState(true);

    const [services, setServices] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);

    // паёми зуд (toast/banner)
    const [msg, setMsg] = useState("");

    const doLogout = () => {
        logout();              // localStorage token тоза мешавад
        nav("/login", { replace: true });
    };

    // ✅ беҳтар: ҳатто агар orders/users хато диҳад, services нишон медиҳад
    const loadAll = async () => {
        setLoading(true);
        setMsg("");

        const errors = [];

        try {
            const sv = await getServices();
            setServices(sv || []);
        } catch (e) {
            errors.push("Хизматҳо: " + (e?.message || "хатогӣ"));
        }

        try {
            const od = await getOrders();
            setOrders(od || []);
        } catch (e) {
            errors.push("Фармоишҳо: " + (e?.message || "хатогӣ"));
        }

        try {
            const us = await getUsers();
            setUsers(us || []);
        } catch (e) {
            errors.push("Истифодабарандаҳо: " + (e?.message || "хатогӣ"));
        }

        if (errors.length) setMsg(errors.join(" | "));
        setLoading(false);
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

    // ===== Хизмат: нигоҳ доштан =====
    const saveService = async (s) => {
        try {
            await updateService(s._id, {
                title: s.title,
                price: Number(s.price),
                key: s.key,
            });
            setMsg("✅ Хизмат нигоҳ дошта шуд");
        } catch (e) {
            setMsg(e?.message || "Хатогӣ ҳангоми нигоҳ доштан");
        }
    };

    // ===== Фармоиш: нест кардан =====
    const removeOrder = async (id) => {
        if (!confirm("Фармоишро нест мекунем?")) return;
        try {
            await deleteOrder(id);
            setOrders((p) => p.filter((x) => x._id !== id));
            setMsg("🗑️ Фармоиш нест шуд");
        } catch (e) {
            setMsg(e?.message || "Хатогӣ ҳангоми нест кардан");
        }
    };

    // ===== User: role иваз кардан =====
    const changeRole = async (id, role) => {
        try {
            await setUserRole(id, role);
            setUsers((p) => p.map((u) => (u._id === id ? { ...u, role } : u)));
            setMsg("✅ Нақш (Role) нав шуд");
        } catch (e) {
            setMsg(e?.message || "Хатогӣ ҳангоми иваз кардани нақш");
        }
    };

    return (
        <div className="adm-root">
            <header className="adm-topbar">
                <div className="adm-brand">
                    <div className="adm-logo">A</div>
                    <div>
                        <div className="adm-title">Панели Админ</div>
                        <div className="adm-sub">Хизматҳо • Фармоишҳо • Истифодабарандаҳо</div>
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
                        ⟳ Навсозӣ
                    </button>

                    <button className="adm-btn danger" onClick={doLogout}>
                        ⎋ Баромадан
                    </button>
                </div>
            </header>

            <nav className="adm-tabs">
                <button
                    className={`adm-tab ${tab === "services" ? "active" : ""}`}
                    onClick={() => setTab("services")}
                >
                    Хизматҳо
                    <span className="adm-pill">{services.length}</span>
                </button>

                <button
                    className={`adm-tab ${tab === "orders" ? "active" : ""}`}
                    onClick={() => setTab("orders")}
                >
                    Фармоишҳо
                    <span className="adm-pill">{orders.length}</span>
                </button>

                <button
                    className={`adm-tab ${tab === "users" ? "active" : ""}`}
                    onClick={() => setTab("users")}
                >
                    Истифодабарандаҳо
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
                        {/!* ================== ХИЗМАТҲО ================== *!/}
                        {tab === "services" && (
                            <Section title="Хизматҳо">
                                {/!* Desktop table *!/}
                                <div className="adm-tableWrap desktopOnly">
                                    <table className="adm-table">
                                        <thead>
                                        <tr>
                                            <th>Калид</th>
                                            <th>Ном</th>
                                            <th>Нарх</th>
                                            <th style={{ width: 160 }}>Амалиёт</th>
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
                                                    <button className="adm-btn primary" onClick={() => saveService(s)}>
                                                        Нигоҳ доштан
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

                                {/!* Mobile cards *!/}
                                <div className="adm-cards mobileOnly">
                                    {filteredServices.map((s) => (
                                        <div className="adm-card" key={s._id}>
                                            <div className="adm-cardHead">
                                                <span className="adm-badge">{s.key}</span>
                                                <button className="adm-btn primary" onClick={() => saveService(s)}>
                                                    Нигоҳ доштан
                                                </button>
                                            </div>

                                            <label className="adm-field">
                                                <span>Ном</span>
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
                                                <span>Нарх</span>
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

                        {/!* ================== ФАРМОИШҲО ================== *!/}
                        {tab === "orders" && (
                            <Section title="Фармоишҳо">
                                <div className="adm-tableWrap desktopOnly">
                                    <table className="adm-table">
                                        <thead>
                                        <tr>
                                            <th>Мизоҷ</th>
                                            <th>Телефон</th>
                                            <th>Мошин</th>
                                            <th>Мӯҳлат</th>
                                            <th>Ҷамъ</th>
                                            <th>Сана</th>
                                            <th style={{ width: 120 }}>Амалиёт</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {filteredOrders.map((o) => (
                                            <tr key={o._id}>
                                                <td className="adm-strong">{o.customerName}</td>
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
                                                    <button className="adm-btn danger" onClick={() => removeOrder(o._id)}>
                                                        Нест кардан
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
                                                <button className="adm-btn danger" onClick={() => removeOrder(o._id)}>
                                                    Нест кардан
                                                </button>
                                            </div>

                                            <div className="adm-grid2">
                                                <div className="adm-kv">
                                                    <span>Мошин</span>
                                                    <b>{o.carType}</b>
                                                </div>
                                                <div className="adm-kv">
                                                    <span>Мӯҳлат</span>
                                                    <b>
                                                        {o.periodType} × {o.periodCount}
                                                    </b>
                                                </div>
                                                <div className="adm-kv">
                                                    <span>Ҷамъ</span>
                                                    <b>{money(o.total)}</b>
                                                </div>
                                                <div className="adm-kv">
                                                    <span>Сана</span>
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

                        {/!* ================== ИСТИФОДАБАРАНДАҲО ================== *!/}
                        {tab === "users" && (
                            <Section title="Истифодабарандаҳо">
                                <div className="adm-tableWrap desktopOnly">
                                    <table className="adm-table">
                                        <thead>
                                        <tr>
                                            <th>Email</th>
                                            <th>Нақш</th>
                                            <th>Сана</th>
                                            <th style={{ width: 240 }}>Амалиёт</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {filteredUsers.map((u) => (
                                            <tr key={u._id}>
                                                <td className="adm-strong">{u.email}</td>
                                                <td>
                            <span className={`adm-badge ${u.role === "admin" ? "" : "soft"}`}>
                              {u.role === "admin" ? "админ" : "истифодабаранда"}
                            </span>
                                                </td>
                                                <td className="adm-muted">{fmtDate(u.createdAt)}</td>
                                                <td className="adm-actionsRow">
                                                    <button
                                                        className="adm-btn ghost"
                                                        onClick={() => changeRole(u._id, "user")}
                                                        disabled={u.role === "user"}
                                                    >
                                                        Корбар
                                                    </button>
                                                    <button
                                                        className="adm-btn primary"
                                                        onClick={() => changeRole(u._id, "admin")}
                                                        disabled={u.role === "admin"}
                                                    >
                                                        Админ
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
                                                    <div className="adm-muted">Сана: {fmtDate(u.createdAt)}</div>
                                                </div>
                                                <span className={`adm-badge ${u.role === "admin" ? "" : "soft"}`}>
                          {u.role === "admin" ? "админ" : "истифодабаранда"}
                        </span>
                                            </div>

                                            <div className="adm-row">
                                                <button
                                                    className="adm-btn ghost"
                                                    onClick={() => changeRole(u._id, "user")}
                                                    disabled={u.role === "user"}
                                                >
                                                    Корбар
                                                </button>
                                                <button
                                                    className="adm-btn primary"
                                                    onClick={() => changeRole(u._id, "admin")}
                                                    disabled={u.role === "admin"}
                                                >
                                                    Админ
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
*/
