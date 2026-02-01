import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

import Admin from "./pages/Admin.jsx"; // ✅ админкаи нав (tabs)
import { getServices, createOrder, getStats, getMe, login as apiLogin, logout as apiLogout } from "./api";

const money = (n) => (Math.round((Number(n) + Number.EPSILON) * 100) / 100).toFixed(2);

function waLink(phone, text) {
    const digits = String(phone || "").replace(/[^\d+]/g, "").replace("+", "");
    return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

/* =========================
   User icon menu (Login/Logout)
========================= */
function UserMenu({ user, setUser }) {
    const [open, setOpen] = useState(false);
    const nav = useNavigate();

    const goLogin = () => {
        setOpen(false);
        nav("/login");
    };

    const doLogout = () => {
        apiLogout();
        setUser(null);
        setOpen(false);
        nav("/");
    };

    return (
        <div style={{ position: "relative", display: "inline-block" }}>
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                aria-label="менюи корбар"
                style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    display: "grid",
                    placeItems: "center",
                    color: "white",
                }}
            >
                <FaUserCircle size={28} />
            </button>

            {open && (
                <div
                    style={{
                        position: "absolute",

                        /* 👉 аз бараш, аз ТАРАФИ РОСТ */
                        left: "100%",
                        top: "50%",
                        transform: "translateY(-50%)",
                        marginLeft: 10,

                        width: 220,
                        maxWidth: "90vw",

                        background: "rgba(7,11,22,.9)",
                        border: "1px solid rgba(255,255,255,.14)",
                        borderRadius: 14,
                        padding: 12,
                        boxShadow: "0 18px 60px rgba(0,0,0,.45)",
                        backdropFilter: "blur(12px)",
                        zIndex: 9999,
                    }}
                >
                    {user ? (
                        <>
                            {/* INFO */}
                            <div
                                style={{
                                    fontSize: 12,
                                    color: "rgba(169,178,212,.85)",
                                    marginBottom: 10,
                                }}
                            >
                                Ворид шудӣ ҳамчун:
                                <br />
                                <b style={{ color: "white" }}>{user.email}</b>
                                <br />
                                Нақш: <b>{user.role}</b>
                            </div>

                            {/* ADMIN */}
                            {user.role === "admin" && (
                                <button
                                    className="btn btnPri"
                                    style={{ width: "100%", marginBottom: 8 }}
                                    onClick={() => {
                                        setOpen(false);
                                        nav("/admin");
                                    }}
                                >
                                    ⚙️ Admin panel
                                </button>
                            )}

                            {/* LOGOUT */}
                            <button
                                className="btn"
                                style={{ width: "100%" }}
                                onClick={doLogout}
                            >
                                🚪 Баромадан
                            </button>
                        </>
                    ) : (
                        <button
                            className="btn btnPri"
                            style={{ width: "100%" }}
                            onClick={goLogin}
                        >
                            🔐 Ворид шудан
                        </button>
                    )}
                </div>
            )}
        </div>
    );





    /* return (
         <div style={{ position: "relative" }}>
             <button
                 type="button"
                 onClick={() => setOpen((v) => !v)}
                 style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
                 aria-label="user menu"
             >
                 <FaUserCircle size={28} />
             </button>

             {open && (
                 <div
                     style={{
                         position: "absolute",
                         right: 0,
                         top: "120%",
                         background: "#fff",
                         border: "1px solid rgba(0,0,0,.12)",
                         borderRadius: 12,
                         padding: 10,
                         minWidth: 160,
                         boxShadow: "0 10px 30px rgba(0,0,0,.10)",
                         zIndex: 999,
                     }}
                 >
                     {user ? (
                         <>
                             <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
                                 Role: <b>{user.role}</b>
                             </div>
                             {user.role === "admin" && (
                                 <button className="btn btnPri" style={{ width: "100%", marginBottom: 8 }} onClick={() => nav("/admin")}>
                                     Admin
                                 </button>
                             )}
                             <button className="btn" style={{ width: "50%" }} onClick={doLogout}>
                                 Logout
                             </button>
                         </>
                     ) : (
                         <button className="btn btnPri" style={{ width: "100%" }} onClick={goLogin}>
                             Login
                         </button>
                     )}
                 </div>
             )}
         </div>
     );*/
}

/* =========================
   Login Page (simple)
========================= */
function LoginPage({ setUser }) {
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr("");

        try {
            const user = await apiLogin(email, password); // api.js token-ро save мекунад
            setUser(user);

            if (user?.role === "admin") nav("/admin");
            else nav("/");
        } catch (e2) {
            setErr(e2?.message || "Login failed (email/password ё backend).");
        }
    };

    return (
        <div className="wrap" style={{ maxWidth: 520 }}>
            <header style={{ marginBottom: 20 }}>
                <div className="logo">
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <b>Login</b>
                        <span>Воридшавӣ</span>
                    </div>
                </div>
            </header>

            <div className="panel" style={{ padding: 16 }}>
                <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
                    <div className="field">
                        <label>Email</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@mail.com"
                            autoComplete="email"
                        />
                    </div>

                    <div className="field">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="current-password"
                        />
                    </div>

                    {err && <div className="toast" style={{ display: "block" }}>{err}</div>}

                    <button className="btn btnOk" type="submit">
                        Ворид шудан
                    </button>
                </form>
            </div>
        </div>
    );
}

/* =========================
   Home Page (UI-и ту)
========================= */
function HomePage({ user, setUser }) {
    const WA_PHONE = import.meta.env.VITE_WA_PHONE || "+992988290699";

    // ===== Services (default 10/10/15, backend override) =====
    const [services, setServices] = useState({
        wash: { key: "wash", title: "Об задан", subtitle: "Шустани берунӣ", price: 10 },
        clean: { key: "clean", title: "Пок кардан", subtitle: "Тозакунии дохил", price: 10 },
        vacuum: { key: "vacuum", title: "Пласос кардан", subtitle: "Вакуум", price: 15 },
    });

    const serviceCards = useMemo(
        () => [
            { key: "wash", subtitleFallback: "Шустани берунӣ" },
            { key: "clean", subtitleFallback: "Тозакунии дохил" },
            { key: "vacuum", subtitleFallback: "Вакуум" },
        ],
        []
    );

    const [selected, setSelected] = useState({ wash: true, clean: true, vacuum: true });
    const [discount, setDiscount] = useState(0);

    // ===== Customer =====
    const [custName, setCustName] = useState("");
    const [carType, setCarType] = useState("");
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("Исфара, Чоркӯҳ, Гузар");

    // ===== UI =====
    const [toast, setToast] = useState("");
    const [savedOrder, setSavedOrder] = useState(null);

    // ===== Stats report tabs =====
    const [stats, setStats] = useState(null);
    const [reportTab, setReportTab] = useState("day"); // day | week | month

    // ===== Load services =====
    useEffect(() => {
        (async () => {
            try {
                const items = await getServices();
                setServices((prev) => {
                    const next = { ...prev };
                    for (const s of items) {
                        const key = s.key;
                        if (!key) continue;
                        next[key] = {
                            key,
                            title: s.title || prev[key]?.title || key,
                            subtitle: s.subtitle || prev[key]?.subtitle || "",
                            price: Number(s.price || 0),
                        };
                    }
                    return next;
                });
            } catch {
                // ok if backend not ready
            }
        })();
    }, []);

    // ===== Load stats =====
    useEffect(() => {
        const load = async () => {
            try {
                const s = await getStats();
                setStats(s);
            } catch {
                // ignore
            }
        };
        load();
        const t = setInterval(load, 15000);
        return () => clearInterval(t);
    }, []);

    // ===== Clock =====
    const [clock, setClock] = useState("");
    useEffect(() => {
        const tick = () => {
            const d = new Date();
            setClock(
                `${String(d.getHours()).padStart(2, "0")}:` +
                `${String(d.getMinutes()).padStart(2, "0")}:` +
                `${String(d.getSeconds()).padStart(2, "0")}`
            );
        };
        tick();
        const t = setInterval(tick, 1000);
        return () => clearInterval(t);
    }, []);

    // ===== Toast timer =====
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(""), 2400);
        return () => clearTimeout(t);
    }, [toast]);

    // ===== Calc per order =====
    const perOrder = useMemo(() => {
        const aWash = selected.wash ? Number(services.wash?.price || 0) : 0;
        const aClean = selected.clean ? Number(services.clean?.price || 0) : 0;
        const aVac = selected.vacuum ? Number(services.vacuum?.price || 0) : 0;
        return { aWash, aClean, aVac, sum: aWash + aClean + aVac };
    }, [selected, services]);

    const totalLocal = useMemo(() => {
        const disc = Math.max(0, Number(discount || 0));
        return Math.max(0, perOrder.sum - disc);
    }, [perOrder.sum, discount]);

    // ===== Report computed =====
    const report = useMemo(() => {
        if (!stats) return { revenue: 0, count: 0, label: "" };
        if (reportTab === "day") return { ...stats.day, label: "" };
        if (reportTab === "week") return { ...stats.week, label: "" };
        return { ...stats.month, label: "" };
    }, [stats, reportTab]);

    // ===== Actions =====
    function toggle(key) {
        setSelected((s) => ({ ...s, [key]: !s[key] }));
    }

    function resetSel() {
        setSelected({ wash: false, clean: false, vacuum: false });
        setToast("Интихобҳо тоза шуданд.");
    }

    function buildOrderText(totalForText = totalLocal) {
        const items = [];
        if (selected.wash) items.push(`Об задан: ${money(services.wash.price)} сомонӣ`);
        if (selected.clean) items.push(`Пок кардан: ${money(services.clean.price)} сомонӣ`);
        if (selected.vacuum) items.push(`Пласос кардан: ${money(services.vacuum.price)} сомонӣ`);

        const lines = [
            "Салом! Фармоиш барои мойка:",
            custName ? `Ном: ${custName}` : null,
            carType ? `Мошин: ${carType}` : null,
            phone ? `Тел: ${phone}` : null,
            location ? `Ҷой: ${location}` : null,
            "",
            ...items,
            `Тахфиф: ${money(discount)} сомонӣ`,
            `Ҷамъ: ${money(totalForText)} сомонӣ`,
        ].filter(Boolean);

        return lines.join("\n");
    }

    async function copyText() {
        const txt = buildOrderText(savedOrder?.total ?? totalLocal);
        try {
            await navigator.clipboard.writeText(txt);
            setToast("Текст copy шуд ✅");
        } catch {
            setToast("Copy нашуд. Дастӣ интихоб кун.");
        }
    }

    async function saveToMongo() {
        try {
            const order = await createOrder({
                customerName: custName,
                phone,
                carType,
                location,
                selected,
                discount: Number(discount || 0),
            });
            setSavedOrder(order);
            setToast("Фармоиш сабт шуд ✅");

            try {
                const s = await getStats();
                setStats(s);
            } catch {}
        } catch {
            setToast("Сабт нашуд (API/Backend check кунед).");
        }
    }

    return (
        <div className="wrap">
            <header>
                <div className="logo" style={{ gap: 12 }}>
                    {/* ✅ ИКОНКАИ ОДАМЧА */}
                    <UserMenu user={user} setUser={setUser} />

                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <b>Мойка</b>
                        <span>Тозагӣ • Суръат • Сифат</span>
                    </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <a className="btn btnPri" href={`tel:${WA_PHONE}`}>
                        📞 Занг
                    </a>
                    <a
                        className="btn btnOk"
                        target="_blank"
                        rel="noreferrer"
                        href={waLink(WA_PHONE, "Салом! Ман мехоҳам мойка фармоиш диҳам.")}
                    >
                        💬 WhatsApp
                    </a>
                </div>
            </header>

            <section className="hero">
                <div className="panel heroLeft">
                    <h1>Мойкаи мошин — 3 хизмат дар як ҷо</h1>
                    <p className="sub">
                        Интихоб кун: <b>об задан</b>, <b>пок кардан</b>, <b>пласос кардан</b>. Нархҳоро
                        иваз карда метавонӣ — ҳисобкунак худкор ҷамъ мекунад.
                    </p>

                    <div className="chips">
                        <div className="chip">⏱️ 15–30 дақиқа</div>
                        <div className="chip">✨ Тозакунии бодиққат</div>
                        <div className="chip">🧼 Маводҳои бехатар</div>
                        <div className="chip">📍 Наздик ва қулай</div>
                    </div>

                    <div className="heroActions">
                        <a className="btn btnPri" href="#services">
                            Хизматҳо
                        </a>
                        <a className="btn btnOk" href="#calc">
                            Ҳисобкунак
                        </a>
                    </div>
                </div>

                <div className="panel heroRight">
                    <div className="kpiGrid">
                        <div className="kpi">
                            <div className="k">Хизматҳо</div>
                            <div className="v mono">3</div>
                        </div>

                        <div className="kpi">
                            <div className="k">Реҷаи корӣ</div>
                            <div className="v">Ҳар рӯз</div>
                        </div>

                        {/* Report block */}
                        <div className="field" style={{ marginTop: 12 }}>
                            <div className="k">Ҳисобот</div>

                            <div className="seg">
                                <button
                                    className={`segBtn ${reportTab === "day" ? "on" : ""}`}
                                    onClick={() => setReportTab("day")}
                                >
                                    1 рӯз
                                </button>
                                <button
                                    className={`segBtn ${reportTab === "week" ? "on" : ""}`}
                                    onClick={() => setReportTab("week")}
                                >
                                    1 ҳафта
                                </button>
                                <button
                                    className={`segBtn ${reportTab === "month" ? "on" : ""}`}
                                    onClick={() => setReportTab("month")}
                                >
                                    1 моҳ
                                </button>
                            </div>

                            <div className="miniStat">
                                <div className="miniRow">
                                    <span>{report.label || "..."}</span>
                                    <b className="mono">{money(report.revenue || 0)} см</b>
                                </div>
                                <div className="miniHint">
                                    Фармоишҳо: <b className="mono">{report.count || 0}</b>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="field" style={{ marginTop: 12 }}>
                        <label>📍 Ҷойгиршавӣ</label>
                        <input value={location} onChange={(e) => setLocation(e.target.value)} />
                    </div>

                    <div className="foot">
                        <span>Вақти ҷорӣ :</span>
                        <span className="mono">{clock}</span>
                    </div>
                </div>
            </section>

            <div className="sectionTitle" id="services">
                <div>
                    <h2>3 хизмат</h2>
                    <p>Ҳар хизматро интихоб/хомӯш кун — нархҳо дар ҳисобкунак ҷамъ мешаванд.</p>
                </div>
                <div className="muted" style={{ fontSize: 12 }}>
                    Нархҳо сомонӣ
                </div>
            </div>

            <section className="grid">
                {serviceCards.map(({ key, subtitleFallback }) => (
                    <div className="panel svc" key={key}>
                        <div className="svcTop">
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div className="icon"></div>
                                <div>
                                    <b>{services[key]?.title}</b>
                                    <br />
                                    <span className="muted" style={{ fontSize: 12 }}>
                    {services[key]?.subtitle || subtitleFallback}
                  </span>
                                </div>
                            </div>

                            <div
                                className="toggle"
                                data-on={selected[key] ? "true" : "false"}
                                onClick={() => toggle(key)}
                            >
                                <div className="tick"></div>
                                <span>Интихоб</span>
                            </div>
                        </div>

                        <div className="desc"></div>

                        <div className="priceRow">
                            <span className="muted small">Нарх</span>
                            <span className="p mono">
                <input
                    type="number"
                    value={services[key]?.price ?? 0}
                    min="0"
                    step="1"
                    onChange={(e) =>
                        setServices((s) => ({
                            ...s,
                            [key]: { ...s[key], price: Number(e.target.value || 0) },
                        }))
                    }
                />
              </span>
                        </div>
                    </div>
                ))}
            </section>

            <section className="calc" id="calc">
                <div className="sectionTitle">
                    <div>
                        <h2>Ҳисобкунак</h2>
                        <p>Интихоби хизматҳо + ҷамъ. Метавонӣ тахфиф ҳам диҳӣ.</p>
                    </div>
                    <button className="btn" onClick={resetSel}>
                        Тоза кардани интихоб
                    </button>
                </div>

                <div className="panel calcInner">
                    <div className="box">
                        <h3>Интихобҳо</h3>

                        <div className="row">
                            <span className="l">Об задан</span>
                            <span className="r mono">{money(perOrder.aWash)}</span>
                        </div>
                        <div className="row">
                            <span className="l">Пок кардан</span>
                            <span className="r mono">{money(perOrder.aClean)}</span>
                        </div>
                        <div className="row">
                            <span className="l">Пласос кардан</span>
                            <span className="r mono">{money(perOrder.aVac)}</span>
                        </div>

                        <div className="row">
                            <span className="l">Тахфиф</span>
                            <span className="r mono">-{money(discount)}</span>
                        </div>

                        <div className="row">
              <span className="l">
                <b>Ҷамъ</b>
              </span>
                            <span className="r mono">{money(totalLocal)}</span>
                        </div>

                        <div className="field">
                            <label>Тахфиф (сомонӣ)</label>
                            <input
                                type="number"
                                min="0"
                                value={discount}
                                onChange={(e) => setDiscount(Number(e.target.value || 0))}
                            />
                        </div>

                        <div className="foot">
                            <span>WhatsApp-ро пахш кун — фармоиш тайёр мешавад.</span>
                            <span className="muted">Нархҳо: таҳриршаванда</span>
                        </div>
                    </div>

                    <div className="box">
                        <h3>Фармоиши зуд</h3>

                        <div className="field">
                            <label>Ном (ихтиёрӣ)</label>
                            <input
                                value={custName}
                                onChange={(e) => setCustName(e.target.value)}
                                placeholder="Масалан: Умар"
                            />
                        </div>

                        <div className="field">
                            <label>Навъи мошин</label>
                            <input
                                value={carType}
                                onChange={(e) => setCarType(e.target.value)}
                                placeholder="Седан / Джип / ..."
                            />
                        </div>

                        <div className="field">
                            <label>Телефон (ихтиёрӣ)</label>
                            <input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+992 ..."
                            />
                        </div>

                        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <a
                                className="btn btnOk"
                                target="_blank"
                                rel="noreferrer"
                                href={waLink(WA_PHONE, buildOrderText(savedOrder?.total ?? totalLocal))}
                            >
                                💬 Фармоиш дар WhatsApp
                            </a>
                            <button className="btn btnPri" onClick={copyText}>
                                📋 Copy текст
                            </button>
                            <button className="btn" onClick={saveToMongo}>
                                💾 Сабт кардан
                            </button>
                        </div>

                        {savedOrder && (
                            <p className="sub" style={{ marginTop: 12, fontSize: 13 }}>
                                ✅ Сабт шуд. Ҷамъ: <span className="mono">{money(savedOrder.total)}</span>
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {toast && (
                <div className="toast" style={{ display: "block" }}>
                    {toast}
                </div>
            )}
        </div>
    );
}

/* =========================
   App Router + Auth bootstrap
========================= */
export default function App() {
    const [user, setUser] = useState(null);
    const [loadingMe, setLoadingMe] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const u = await getMe();
                setUser(u);
            } catch {
                setUser(null);
            } finally {
                setLoadingMe(false);
            }
        })();
    }, []);

    if (loadingMe) return null;

    return (
        <Routes>
            <Route path="/login" element={<LoginPage setUser={setUser} />} />

            <Route
                path="/admin"
                element={user?.role === "admin" ? <Admin /> : <Navigate to="/" replace />}
            />

            <Route
                path="/"
                element={
                    user?.role === "admin"
                        ? <Navigate to="/admin" replace />
                        : <HomePage user={user} setUser={setUser} />
                }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
