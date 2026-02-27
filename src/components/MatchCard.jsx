import { Link } from "react-router-dom";
import Avatar from "./Avatar";

export default function MatchCard({ match }) {
    return (
        <div className="doodle-card p-6 flex flex-col h-full bg-white relative overflow-hidden group">
            {match.score > 80 && (
                <div className="absolute top-0 right-0 bg-yellow-300 text-slate-900 text-xs font-bold px-3 py-1 rounded-bl-xl border-l-2 border-b-2 border-slate-800 shadow-[-2px_2px_0px_#1e293b] flex items-center gap-1 z-10">
                    <Star size={12} className="fill-slate-900" /> Top Match
                </div>
            )}

            <div className="flex items-center gap-4 mb-4">
                <Avatar user={match.user} config={match.user.avatarConfig} className="w-16 h-16 text-xl" />
                <div>
                    <h3 className="text-xl font-display font-black text-slate-900">
                        {match.user.displayName === "Peer" || !match.user.displayName
                            ? (match.user.email?.split('@')[0] || "Student")
                            : match.user.displayName}
                    </h3>
                    <p className="text-sm font-bold text-slate-500">{match.user.department || "No Department"}</p>
                </div>
            </div>

            <div className="mb-4">
                <p className="text-sm text-slate-600 line-clamp-2 italic">
                    "{match.user.bio || "Hi, I'm new here!"}"
                </p>
            </div>

            <div className="mb-4 flex-1">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Top Skills</h4>
                <div className="flex flex-wrap gap-1">
                    {(match.user.skills || []).slice(0, 3).map((skill, i) => (
                        <span key={i} className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
                            {skill}
                        </span>
                    ))}
                </div>
            </div>

            <div className="mt-4 pt-4 border-t-2 border-slate-100 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-2xl font-black text-pink-500">{match.score}%</span>
                    <span className="text-xs font-bold text-slate-400">Match</span>
                </div>

                <Link to={`/room/new?partner=${match.user.uid}`} className="btn-doodle btn-doodle-primary py-2 px-4 text-sm">
                    Connect <ArrowRight size={16} />
                </Link>
            </div>

            {match.explanation && (
                <div className="mt-3 text-xs font-semibold text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    💡 {match.explanation}
                </div>
            )}
        </div>
    );
}
