import { useEffect, useState } from "react";
import { getAllUsers } from "../services/userService";
import { getCurrentUser } from "../services/authService";
import { calculateCompatibility } from "../services/matchService";
import { createTeam } from "../services/teamService";
import { useNavigate } from "react-router-dom";
import { Plus, Users, ArrowRight, Wand2, Lightbulb, UserPlus, X, Rocket, Sparkles, Target, BrainCircuit } from "lucide-react";
import MatchCard from "../components/MatchCard";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function TeamBuilder() {
    const [skillsNeeded, setSkillsNeeded] = useState([]);
    const [skillInput, setSkillInput] = useState("");
    const [recommended, setRecommended] = useState([]);
    const [users, setUsers] = useState([]);
    const [me, setMe] = useState(null);
    const [creating, setCreating] = useState(false);

    const [projectIdea, setProjectIdea] = useState("");
    const [isImproving, setIsImproving] = useState(false);

    const [selectedTeammates, setSelectedTeammates] = useState([]);

    const navigate = useNavigate();

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
        const fetchUsers = async () => {
            const currentUser = getCurrentUser();
            if (!currentUser) return;
            const all = await getAllUsers();
            setUsers(all);
            setMe(all.find(u => u.uid === currentUser.uid));
        };
        fetchUsers();
    }, []);

    const handleAddSkill = () => {
        const val = skillInput.trim();
        if (val && !skillsNeeded.includes(val)) {
            setSkillsNeeded([...skillsNeeded, val]);
            findMatches([...skillsNeeded, val]);
        }
        setSkillInput("");
    };

    const handleRemoveSkill = (skill) => {
        const newSkills = skillsNeeded.filter(s => s !== skill);
        setSkillsNeeded(newSkills);
        findMatches(newSkills);
    };

    const findMatches = (skills) => {
        if (!me || skills.length === 0) {
            setRecommended([]);
            return;
        }

        const matches = users
            .filter(u => u.uid !== me.uid)
            .map(u => {
                const hasNeededSkills = (u.skills || []).some(s => skills.some(req => req.toLowerCase() === s.toLowerCase()));
                if (!hasNeededSkills) return null;

                const { score, explanation } = calculateCompatibility(me, u);
                return {
                    user: u,
                    score: Math.min(100, score + 10),
                    explanation: `Requested skill match. ${explanation}`
                };
            })
            .filter(Boolean)
            .sort((a, b) => b.score - a.score);

        setRecommended(matches);
    };

    const handleImproveIdea = () => {
        if (!projectIdea.trim()) {
            toast.error("Enter a concept first!");
            return;
        }
        setIsImproving(true);
        const toastId = toast.loading("AI Engine thinking...");

        setTimeout(() => {
            setIsImproving(false);
            const ideas = [
                "An AI-powered resource optimization platform for campus-wide project collaboration.",
                "A decentralized verification system for student skill certifications using blockchain.",
                "A real-time gamified study environment with integrated focus monitoring and group rewards.",
                "A hyper-personalized career roadmap generator leveraging campus network data."
            ];
            const improved = ideas[Math.floor(Math.random() * ideas.length)];
            setProjectIdea(improved);
            toast.success("Vision enhanced!", { id: toastId });
        }, 1500);
    };

    const toggleTeammate = (user) => {
        if (selectedTeammates.some(t => t.uid === user.uid)) {
            setSelectedTeammates(selectedTeammates.filter(t => t.uid !== user.uid));
        } else {
            if (selectedTeammates.length >= 4) {
                toast.error("Team limit reached (You + 4 peers).");
                return;
            }
            setSelectedTeammates([...selectedTeammates, user]);
            toast.success(`Joined: ${user?.displayName ? user.displayName.split(' ')[0] : "Peer"}`);
        }
    };

    const handleCreateRoom = async () => {
        if (!projectIdea.trim()) {
            toast.error("Idea is required.");
            return;
        }
        setCreating(true);
        try {
            const roomId = await createTeam(
                "New Vision",
                projectIdea,
                skillsNeeded,
                selectedTeammates
            );
            toast.success("Project Room Live!");
            navigate(`/room/${roomId}`);
        } catch (e) {
            console.error(e);
            toast.error("Execution failed.");
        }
        setCreating(false);
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-10 pb-20"
        >
            {/* Header */}
            <motion.div variants={itemVariants}>
                <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl text-heading">Team Sandbox</h1>
                <p className="text-slate-500 font-medium mt-1">Dynamically assemble and visualize your dream project team.</p>
            </motion.div>

            <div className="flex flex-col xl:flex-row gap-10">
                {/* Main Content */}
                <div className="flex-1 space-y-10">

                    {/* Vision Statement */}
                    <motion.div variants={itemVariants} className="saas-card p-10 bg-white relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                <Lightbulb size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-heading">Project Vision</h2>
                        </div>
                        <div className="relative z-10 group">
                            <textarea
                                value={projectIdea}
                                onChange={(e) => setProjectIdea(e.target.value)}
                                placeholder="What's the core mission of this project?"
                                className="saas-input w-full h-40 resize-none text-lg leading-relaxed p-6"
                            />
                            <button
                                onClick={handleImproveIdea}
                                disabled={isImproving}
                                className="absolute bottom-4 right-4 h-12 px-6 btn-secondary shadow-soft flex items-center gap-2"
                            >
                                {isImproving ? <div className="w-4 h-4 border-2 border-primary border-t-white rounded-full animate-spin"></div> : <BrainCircuit size={18} className="text-primary" />}
                                <span className="text-sm font-bold">Enhance with AI</span>
                            </button>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-0" />
                    </motion.div>

                    {/* Team Visualizer */}
                    <motion.div variants={itemVariants} className="saas-card p-10 bg-slate-50/40 border-dashed border-2">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                                <Users size={20} className="text-primary" /> Active Roster
                            </h2>
                            <div className="text-xs font-bold text-slate-400">
                                {selectedTeammates.length + 1} / 5 Selected
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-10 py-10">
                            {/* Me */}
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center text-3xl font-black text-primary shadow-premium border-4 border-primary/20 relative">
                                    {me?.displayName?.charAt(0) || 'U'}
                                    <div className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg border-2 border-white uppercase">Lead</div>
                                </div>
                                <span className="mt-4 text-sm font-bold text-heading">You</span>
                            </div>

                            <div className="h-px bg-slate-200 w-12 hidden md:block" />

                            <AnimatePresence>
                                {selectedTeammates.map((teammate) => (
                                    <motion.div
                                        key={teammate.uid}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="flex flex-col items-center group relative"
                                    >
                                        <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center text-3xl font-black text-slate-300 shadow-soft border-2 border-slate-100 group-hover:border-primary/30 transition-all cursor-pointer overflow-hidden">
                                            {teammate.displayName?.charAt(0)}
                                            <div
                                                onClick={() => toggleTeammate(teammate)}
                                                className="absolute inset-0 bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={32} />
                                            </div>
                                        </div>
                                        <span className="mt-4 text-sm font-bold text-heading">{teammate.displayName?.split(' ')[0]}</span>
                                    </motion.div>
                                ))}

                                {[...Array(Math.max(0, 4 - selectedTeammates.length))].map((_, i) => (
                                    <div key={`empty-${i}`} className="flex flex-col items-center opacity-30">
                                        <div className="w-24 h-24 bg-white/50 border-2 border-dashed border-slate-200 rounded-[32px] flex items-center justify-center text-slate-300">
                                            <UserPlus size={28} />
                                        </div>
                                        <span className="mt-4 text-[10px] font-black uppercase text-slate-300 tracking-widest">Open Slot</span>
                                    </div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Candidate Section */}
                    <div className="space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-heading flex items-center gap-3">
                                <Sparkles className="text-accent" size={20} /> Potential Collaborators
                            </h2>
                            {recommended.length > 0 && (
                                <span className="bg-white px-4 py-1.5 rounded-full text-[11px] font-black text-slate-400 border border-slate-100 shadow-soft uppercase tracking-widest">
                                    {recommended.length} Suggestions
                                </span>
                            )}
                        </div>

                        {skillsNeeded.length === 0 ? (
                            <div className="saas-card p-20 text-center border-dashed bg-slate-50/50 shadow-none">
                                <Target size={40} className="text-slate-200 mx-auto mb-6" />
                                <h3 className="text-lg font-bold text-heading">Identify Project Needs</h3>
                                <p className="text-slate-500 font-medium max-w-xs mx-auto mt-2">Add required skills in the sidebar to start scouting compatible students.</p>
                            </div>
                        ) : recommended.length === 0 ? (
                            <div className="saas-card p-20 text-center border-dashed bg-slate-50/50 shadow-none">
                                <h3 className="text-lg font-bold text-slate-400">No specific matches yet</h3>
                                <p className="text-slate-500 font-medium mt-2">Try broader skills or update your project vision.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <AnimatePresence>
                                    {recommended.map(match => (
                                        <motion.div
                                            key={match.user.uid}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="relative"
                                        >
                                            <MatchCard match={match} />
                                            <button
                                                onClick={() => toggleTeammate(match.user)}
                                                className={`absolute bottom-6 right-6 w-12 h-12 rounded-2xl flex items-center justify-center shadow-premium transition-all active:scale-95 ${selectedTeammates.some(t => t.uid === match.user.uid)
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-primary text-white hover:bg-primary-hover'
                                                    }`}
                                            >
                                                {selectedTeammates.some(t => t.uid === match.user.uid) ? <X size={20} /> : <Plus size={20} />}
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="xl:w-96 space-y-8">
                    <motion.div variants={itemVariants} className="saas-card p-8 sticky top-10">
                        <div className="mb-8">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Expertise Stack</h3>
                            <div className="flex gap-3 mb-6">
                                <input
                                    type="text"
                                    className="saas-input flex-1 h-12 px-4"
                                    placeholder="Add skill..."
                                    value={skillInput}
                                    onChange={e => setSkillInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
                                />
                                <button onClick={handleAddSkill} className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center hover:bg-primary/20 transition-all">
                                    <Plus size={20} />
                                </button>
                            </div>

                            <div className="space-y-3 mb-10 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                <AnimatePresence>
                                    {skillsNeeded.map(skill => (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                                            key={skill}
                                            className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between group"
                                        >
                                            <span className="text-sm font-bold text-heading">{skill}</span>
                                            <button onClick={() => handleRemoveSkill(skill)} className="text-slate-300 hover:text-red-500 transition-colors">
                                                <X size={16} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {skillsNeeded.length === 0 && (
                                    <p className="text-xs font-bold text-slate-400 text-center py-6 border-2 border-dashed border-slate-100 rounded-2xl">No skills added yet</p>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleCreateRoom}
                            disabled={creating}
                            className="w-full h-16 btn-primary shadow-premium relative overflow-hidden group"
                        >
                            {creating ? (
                                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Rocket size={20} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                                    Launch Project Room
                                </>
                            )}
                        </button>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
