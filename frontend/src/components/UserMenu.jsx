import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function UserMenu() {
    const [open, setOpen] = useState(false);
    const { user, logout } = useAuth();
    const nav = useNavigate();

    const onClickMain = () => setOpen((v) => !v);

    const goLogin = () => {
        setOpen(false);
        nav("/login");
    };

    const doLogout = () => {
        setOpen(false);
        logout();
        nav("/"); // баргаштан
    };

    return (
        <div style={{ position: "relative" }}>
            <button
                type="button"
                onClick={onClickMain}
                style={{ background: "transparent", border: "none", cursor: "pointer" }}
                aria-label="User menu"
            >
                <FaUserCircle size={28} />
            </button>

            {open && (
                <div
                    style={{
                        position: "absolute",
                        right: 0,
                        top: "120%",
                        background: "white",
                        border: "1px solid #ddd",
                        borderRadius: 10,
                        padding: 10,
                        minWidth: 140,
                        boxShadow: "0 10px 30px rgba(0,0,0,.08)",
                        zIndex: 50,
                    }}
                >
                    {user ? (
                        <>
                            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
                                {user.role}
                            </div>
                            <button onClick={doLogout} style={{ width: "100%" }}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <button onClick={goLogin} style={{ width: "100%" }}>
                            Login
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

/*import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { logout } from "../api";
import { useNavigate } from "react-router-dom";

export default function UserMenu({ user, setUser }) {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const onLogout = () => {
        logout();
        setUser(null);
        setOpen(false);
        navigate("/login");
    };

    return (
        <div style={{ position: "relative" }}>
            <FaUserCircle
                size={28}
                style={{ cursor: "pointer" }}
                onClick={() => setOpen(!open)}
            />

            {open && (
                <div className="user-menu">
                    {user ? (
                        <button onClick={onLogout}>Logout</button>
                    ) : (
                        <button onClick={() => navigate("/login")}>Login</button>
                    )}
                </div>
            )}
        </div>
    );
}*/
