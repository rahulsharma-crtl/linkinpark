import { Link } from "react-router-dom";
import Avatar from "./Avatar";
import { ArrowRight, UserPlus, X, CheckCircle2, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
import { createTeam } from "../services/teamService";
import { useNavigate } from "react-router-dom";

export default function MatchCard({ match }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hasConnected, setHasConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const navigate = useNavigate();

    const handleConnectClick = () => {
        setIsModalOpen(true);
    };

    const confirmConnection = async () => {
        setIsConnecting(true);
        try {
            // Create a 1-on-1 team with the specific peer
            const roomId = await createTeam(
                `Collaboration with ${match.user?.displayName?.split(' ')[0] || "Student"}`,
                "Private 1-on-1 collaboration space",
                [],
                [match.user]
            );

            setIsModalOpen(false);
            setHasConnected(true);
            toast.success(`Connection established with ${match.user?.displayName?.split(' ')[0] || "Student"}!`);

            // Navigate to the new project room
            setTimeout(() => {
                navigate(`/room/${roomId}`);
            }, 500);
        } catch (error) {
            console.error("Failed to establish connection:", error);
            toast.error("Failed to connect. Please try again.");
        } finally {
            setIsConnecting(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-primary';
        if (score >= 60) return 'text-accent';
        return 'text-warning';
    };

    return (
        <>
            <motion.div
                whileHover={{ y: -6 }}
                className="saas-card p-6 flex flex-col h-full relative group transition-all"
            >
                {/* Header: Score & More */}
                <div className="flex justify-between items-start mb-6">
                    <div className="relative">
                        <svg className="w-16 h-16 transform -rotate-90">
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100" />
                            <motion.circle
                                cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent"
                                strokeDasharray={2 * Math.PI * 28}
                                initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - (match.score || 0) / 100) }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className={getScoreColor(match.score)}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-base font-extrabold ${getScoreColor(match.score)}`}>{match.score}%</span>
                        </div>
                    </div>
                    <button className="p-2 text-slate-300 hover:text-slate-500 transition-colors">
                        <MoreHorizontal size={20} />
                    </button>
                </div>

                {/* Profile Info */}
                <div className="flex flex-col items-center text-center mb-6">
                    <Avatar user={match.user} config={match.user?.avatarConfig} className="w-20 h-20 text-3xl mb-4 ring-4 ring-slate-50 shadow-soft" />
                    <h3 className="text-xl font-bold text-heading leading-tight">
                        {match.user?.displayName || match.user?.email?.split('@')[0] || "Student"}
                    </h3>
                    <p className="text-sm font-bold text-primary mt-1 uppercase tracking-widest">{match.user?.department || "Campus Hub"}</p>
                </div>

                {/* Bio / Skills */}
                <div className="mb-6 flex-1 text-center">
                    <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed mb-4">
                        {match.user?.bio || "Exploring new opportunities and looking for passionate collaborators."}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {(match.user?.skills || []).slice(0, 3).map((skill, i) => (
                            <span key={i} className="text-[11px] font-bold bg-slate-50 text-slate-500 px-3 py-1.5 rounded-full border border-slate-100">
                                {skill}
                            </span>
                        ))}
                        {(match.user?.skills?.length > 3) && (
                            <span className="text-[11px] font-bold text-primary py-1.5">+{match.user.skills.length - 3} more</span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleConnectClick}
                        disabled={hasConnected}
                        className={`flex-1 h-12 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${hasConnected
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'btn-primary'
                            }`}
                    >
                        {hasConnected ? <><CheckCircle2 size={18} /> Sent</> : <><UserPlus size={18} /> Connect</>}
                    </button>
                    <button
                        onClick={confirmConnection}
                        disabled={isConnecting}
                        className="w-12 h-12 flex items-center justify-center bg-slate-50 border border-border text-slate-400 hover:text-primary hover:border-primary/20 rounded-2xl transition-all disabled:opacity-50"
                        title="Quick Chat"
                    >
                        {isConnecting ? (
                            <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        ) : (
                            <ArrowRight size={20} />
                        )}
                    </button>
                </div>
            </motion.div>

            {/* Connect Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white rounded-[32px] shadow-premium overflow-hidden max-w-sm w-full p-8"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                    <UserPlus size={28} />
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <h3 className="text-2xl font-bold text-heading mb-3">Connect with {match.user?.displayName ? match.user.displayName.split(' ')[0] : (match.user?.email?.split('@')[0] || "Student")}?</h3>
                            <p className="text-slate-500 font-medium leading-relaxed mb-8">
                                We'll notify them and once accepted, you can start collaborating in a Project Room.
                            </p>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 h-14 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmConnection}
                                    disabled={isConnecting}
                                    className="flex-1 h-14 btn-primary relative flex items-center justify-center disabled:opacity-70"
                                >
                                    {isConnecting ? (
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        "Connect Now"
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
