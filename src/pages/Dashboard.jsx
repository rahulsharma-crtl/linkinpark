import { useEffect, useState } from "react";
import { getAllUsers } from "../services/userService";
import { getCurrentUser } from "../services/authService";
import OnboardingModal from "../components/OnboardingModal";
import confetti from "canvas-confetti";
import { Users, Target, Zap, Clock, Rocket, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
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
import { motion } from 'framer-motion';
import { getTeams } from "../services/teamService";

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
        collabDept: "-",
        avgMatch: "85%",
        eligibleTeams: 0
    });
    const [chartData, setChartData] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [myTeams, setMyTeams] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 25 } }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            const users = await getAllUsers();
            let allSkills = {};
            let depts = {};

            users.forEach(u => {
                (u.skills || []).forEach(s => {
                    allSkills[s] = (allSkills[s] || 0) + 1;
                });
                if (u.department) depts[u.department] = (depts[u.department] || 0) + 1;
            });

            const sortedSkills = Object.entries(allSkills)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6);

            const allTeams = await getTeams();
            const user = getCurrentUser();
            setCurrentUser(user);

            if (user) {
                const userTeams = allTeams.filter(t => t.members?.includes(user.uid));
                setMyTeams(userTeams);
            }

            setChartData({
                labels: sortedSkills.map(s => s[0]),
                datasets: [
                    {
                        label: 'Network Saturation',
                        data: sortedSkills.map(s => s[1]),
                        backgroundColor: '#7C3AED',
                        borderRadius: 12,
                        barThickness: 24,
                    }
                ]
            });

            // Generate Activity Feed
            const activities = [];

            // Add latest users
            users.slice(0, 5).forEach(u => {
                activities.push({
                    id: `user-${u.uid}`,
                    user: u.displayName?.split(' ')[0] || "User",
                    action: "joined the",
                    target: "Network",
                    time: "Recently",
                    timestamp: u.createdAt || new Date().toISOString()
                });
            });

            // Add latest teams
            allTeams.slice(0, 5).forEach(t => {
                activities.push({
                    id: `team-${t.id}`,
                    user: "New Room",
                    action: "created:",
                    target: t.name,
                    time: "Recently",
                    timestamp: t.createdAt || new Date().toISOString()
                });
            });

            // Sort by timestamp if available
            setRecentActivity(activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 8));

            setStats({
                totalUsers: users.length,
                mostCommonSkill: sortedSkills[0]?.[0] || "-",
                collabDept: Object.keys(depts).sort((a, b) => depts[b] - depts[a])[0] || "-",
                avgMatch: "88%",
                eligibleTeams: allTeams.length
            });
            setLoading(false);
        };

        fetchDashboardData();
    }, []);

    const triggerConfetti = () => {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#7C3AED', '#F43F5E', '#10B981']
        });
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-10 pb-20"
        >
            <OnboardingModal onComplete={triggerConfetti} />

            {/* Welcome Banner */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <motion.h1 variants={itemVariants} className="text-3xl font-extrabold tracking-tight md:text-5xl text-heading">
                        Welcome back, {currentUser?.displayName ? currentUser.displayName.split(' ')[0] : "Student"}
                    </motion.h1>
                    <motion.p variants={itemVariants} className="text-slate-500 font-medium mt-2 text-lg">
                        Your campus collaboration hub is buzzing with new opportunities.
                    </motion.p>
                </div>
                <motion.div variants={itemVariants} className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-soft border border-border">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <img key={i} src={`https://i.pravatar.cc/100?img=${i + 20}`} className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                        ))}
                    </div>
                    <span className="text-sm font-bold text-slate-500">+12 Active Now</span>
                </motion.div>
            </div>

            {/* Key Metrics */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<Users size={24} className="text-primary" />}
                    label="Active Nodes"
                    value={stats.totalUsers}
                    sub="Total Students"
                />
                <StatCard
                    icon={<Target size={24} className="text-accent" />}
                    label="Network Sync"
                    value={stats.avgMatch}
                    sub="Avg Compatibility"
                />
                <StatCard
                    icon={<Zap size={24} className="text-secondary" />}
                    label="High Demand"
                    value={stats.mostCommonSkill}
                    sub="Top Expertise"
                />
                <StatCard
                    icon={<Rocket size={24} className="text-primary" />}
                    label="Live Projects"
                    value={stats.eligibleTeams}
                    sub="Room Availability"
                    highlight
                />
            </motion.div>

            {/* Dashboard Content */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Visual Analytics */}
                <motion.div variants={itemVariants} className="xl:col-span-2 space-y-10">
                    <div className="saas-card p-10 bg-white min-h-[450px]">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-xl font-black text-heading uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles className="text-primary" size={20} /> Skills Spectrum
                                </h2>
                                <p className="text-slate-400 font-medium text-sm mt-1">Real-time demand across the campus network</p>
                            </div>
                        </div>
                        <div className="h-[300px]">
                            {chartData ? (
                                <Bar
                                    data={chartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false } },
                                        scales: {
                                            y: { beginAtZero: true, grid: { color: '#f8fafc' }, ticks: { font: { family: 'Outfit', weight: '700' }, color: '#94a3b8' } },
                                            x: { grid: { display: false }, ticks: { font: { family: 'Outfit', weight: '700' }, color: '#64748b' } }
                                        }
                                    }}
                                />
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-300 font-black italic">Analyzing Spectrum...</div>
                            )}
                        </div>
                    </div>

                    {/* My Active Projects */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-heading">Your Active Labs</h2>
                            <Link to="/team-builder" className="text-sm font-bold text-primary hover:underline">Launch Sandbox</Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {myTeams.length > 0 ? myTeams.map(team => (
                                <Link key={team.id} to={`/room/${team.id}`} className="saas-card p-6 bg-white hover:border-primary/30 transition-all group">
                                    <div className="flex items-start justify-between">
                                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <Rocket size={24} />
                                        </div>
                                        <ArrowRight size={18} className="text-slate-300 group-hover:text-primary transition-colors" />
                                    </div>
                                    <h3 className="mt-4 font-black text-heading">{team.name}</h3>
                                    <p className="text-slate-400 text-sm mt-1 line-clamp-1">{team.description}</p>
                                    <div className="mt-4 flex -space-x-2">
                                        {(team.members || []).slice(0, 4).map((m, i) => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100" />
                                        ))}
                                    </div>
                                </Link>
                            )) : (
                                <div className="col-span-2 saas-card p-10 text-center border-dashed bg-slate-50 shadow-none">
                                    <p className="text-slate-500 font-bold mb-4">No active labs found.</p>
                                    <Link to="/team-builder" className="btn-primary px-8 py-3 inline-block">Start Your First Project</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Right Sidebar */}
                <motion.div variants={itemVariants} className="space-y-8">
                    {/* Activity Feed */}
                    <div className="saas-card bg-white h-full flex flex-col">
                        <div className="p-8 border-b border-border">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Node Activity</h3>
                        </div>
                        <div className="flex-1 p-8 space-y-8 overflow-y-auto max-h-[600px] custom-scrollbar">
                            {recentActivity.length > 0 ? recentActivity.map(act => (
                                <ActivityCard
                                    key={act.id}
                                    user={act.user}
                                    action={act.action}
                                    target={act.target}
                                    time={act.time}
                                />
                            )) : (
                                <div className="text-center py-10">
                                    <p className="text-slate-400 font-bold text-sm">No recent activity</p>
                                </div>
                            )}
                        </div>
                        <Link to="/graph" className="p-6 text-center text-sm font-black text-primary border-t border-border hover:bg-slate-50 transition-all">
                            EXPLORE NETWORK GRAPH
                        </Link>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

function StatCard({ icon, label, value, sub, highlight }) {
    return (
        <div className={`saas-card p-8 group transition-all duration-300 ${highlight ? 'bg-primary border-primary hover:shadow-primary/30' : 'bg-white hover:border-primary/20'}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${highlight ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-600'}`}>
                {icon}
            </div>
            <div>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${highlight ? 'text-white/60' : 'text-slate-400'}`}>{label}</p>
                <h3 className={`text-3xl font-black tracking-tighter ${highlight ? 'text-white' : 'text-heading'}`}>{value}</h3>
                <p className={`text-xs font-bold mt-1 ${highlight ? 'text-white/80' : 'text-slate-500'}`}>{sub}</p>
            </div>
        </div>
    );
}

function ActivityCard({ user, action, target, time }) {
    return (
        <div className="flex gap-4 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-border flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all shrink-0">
                {user?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-heading leading-relaxed">
                    {user} <span className="text-slate-400 font-medium">{action}</span> <span className="text-primary">{target}</span>
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    <Clock size={10} />
                    {time} AGO
                </div>
            </div>
        </div>
    );
}
