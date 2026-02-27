import { useEffect, useState } from "react";
import { getAllUsers } from "../services/userService";
import { getCurrentUser } from "../services/authService";
import OnboardingModal from "../components/OnboardingModal";
import confetti from "canvas-confetti";
import { Users, Code, Activity, Network } from "lucide-react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        mostCommonSkill: "-",
        collabDept: "-"
    });
    const [chartData, setChartData] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const users = await getAllUsers();

            let allSkills = {};
            let depts = {};

            users.forEach(u => {
                (u.skills || []).forEach(s => {
                    allSkills[s] = (allSkills[s] || 0) + 1;
                });
                if (u.department) {
                    depts[u.department] = (depts[u.department] || 0) + 1;
                }
            });

            const topSkill = Object.keys(allSkills).sort((a, b) => allSkills[b] - allSkills[a])[0] || "-";
            const topDept = Object.keys(depts).sort((a, b) => depts[b] - depts[a])[0] || "-";

            const sortedSkills = Object.entries(allSkills)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            setChartData({
                labels: sortedSkills.map(s => s[0]),
                datasets: [
                    {
                        label: 'Users with Skill',
                        data: sortedSkills.map(s => s[1]),
                        backgroundColor: '#f472b6',
                        borderColor: '#1e293b',
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false,
                    }
                ]
            });

            setStats({
                totalUsers: users.length,
                mostCommonSkill: topSkill,
                collabDept: topDept
            });
            setCurrentUser(getCurrentUser());
            setLoading(false);
        };

        fetchStats();
    }, []);

    const triggerConfetti = () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    return (
        <div>
            <OnboardingModal onComplete={triggerConfetti} />
            <h1 className="text-4xl font-display font-black mb-8 text-slate-900">System <span className="text-blue-500">Overview</span></h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<Users className="text-blue-500" size={32} />}
                    title="Total Users"
                    value={loading ? "..." : stats.totalUsers}
                />
                <StatCard
                    icon={<Code className="text-pink-500" size={32} />}
                    title="Trending Skill"
                    value={loading ? "..." : stats.mostCommonSkill}
                />
                <StatCard
                    icon={<Network className="text-purple-500" size={32} />}
                    title="Most Active Dept"
                    value={loading ? "..." : stats.collabDept}
                />
                <StatCard
                    icon={<Activity className="text-green-500" size={32} />}
                    title="System Status"
                    value="Online"
                />
            </div>

            <div className="mt-12 doodle-card p-8 bg-[#f5f3ff] relative overflow-hidden">
                <div className="absolute -right-10 -top-10 text-[120px] opacity-10 rotate-12">👋</div>
                <h2 className="text-2xl font-display font-bold mb-4 flex items-center gap-2 relative z-10">
                    Welcome to LinkInPark{currentUser && currentUser.displayName ? `, ${currentUser.displayName.split(' ')[0]}` : ""} 🚀
                </h2>
                <p className="text-slate-600 font-medium leading-relaxed max-w-3xl text-lg relative z-10">
                    The central hub for NHCE students to connect, find project collaborators, and build powerful teams.
                    Use the navigation menu to optimize your profile, discover compatible teammates, and view the campus skills network.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <div className="doodle-card p-8 bg-white">
                    <h2 className="text-2xl font-display font-bold mb-6 border-b-2 border-slate-800 pb-2">Top 5 Campus Skills</h2>
                    <div className="h-64">
                        {chartData && !loading ? (
                            <Bar
                                data={chartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { family: 'Outfit', weight: 'bold' } } },
                                        x: { grid: { display: false }, ticks: { font: { family: 'Outfit', weight: 'bold' } } }
                                    }
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">Loading chart...</div>
                        )}
                    </div>
                </div>

                <div className="doodle-card p-8 bg-white">
                    <h2 className="text-2xl font-display font-bold mb-6 border-b-2 border-slate-800 pb-2">Recent Activity</h2>
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 font-bold border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
                        <p className="text-4xl mb-2">📡</p>
                        <p>No recent global activity.</p>
                        <p className="text-sm font-normal mt-1">Start matching to populate the feed!</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, title, value }) {
    return (
        <div className="doodle-card p-6 flex flex-col items-start gap-4 hover:-translate-y-2 transition-transform cursor-default">
            <div className="p-4 bg-slate-100 rounded-2xl border-2 border-slate-800 shadow-[2px_2px_0px_#1e293b]">
                {icon}
            </div>
            <div>
                <p className="text-sm font-bold text-slate-500 mb-1">{title}</p>
                <h3 className="text-3xl font-display font-black tracking-tight text-slate-900">{value}</h3>
            </div>
        </div>
    )
}
