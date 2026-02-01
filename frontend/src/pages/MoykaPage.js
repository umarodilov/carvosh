import { getStats } from "./api";

const [stats, setStats] = useState(null);

useEffect(() => {
    const load = async () => {
        try {
            const s = await getStats();
            setStats(s);
        } catch {}
    };
    load();
    const t = setInterval(load, 15000); // ҳар 15 сония нав шавад
    return () => clearInterval(t);
}, []);
