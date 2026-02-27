import { useEffect, useState } from "react";
import { getUserById, updateUserProfile } from "../services/userService";
import { getCurrentUser } from "../services/authService";
import Toast from "../components/Toast";
import Avatar from "../components/Avatar";
import { AVATAR_COLORS, POPULAR_EMOJIS } from "../utils/constants";
import { Save, X, Plus } from "lucide-react";

export default function Profile() {
    const [profile, setProfile] = useState({
        department: "",
        year: "",
        bio: "",
        github: "",
        linkedin: "",
        portfolio: "",
        rolePreference: "",
        availability: "Available",
        skills: [],
        interests: [],
        projects: [],
        badges: [],
        avatarConfig: { colorId: "blue", emoji: "" }
    });
    const [userContext, setUserContext] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const [skillInput, setSkillInput] = useState("");
    const [interestInput, setInterestInput] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            const user = getCurrentUser();
            if (user) {
                setUserContext(user);
                const data = await getUserById(user.uid);
                if (data) {
                    setProfile({
                        department: data.department || "",
                        year: data.year || "",
                        bio: data.bio || "",
                        github: data.github || "",
                        linkedin: data.linkedin || "",
                        portfolio: data.portfolio || "",
                        rolePreference: data.rolePreference || "",
                        availability: data.availability || "Available",
                        skills: data.skills || [],
                        interests: data.interests || [],
                        projects: data.projects || [],
                        badges: data.badges || [],
                        avatarConfig: data.avatarConfig || { colorId: "blue", emoji: "" }
                    });
                }
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleAddTag = (field, value, setter) => {
        const trimmed = value.trim();
        if (trimmed && !profile[field].includes(trimmed)) {
            setProfile({ ...profile, [field]: [...profile[field], trimmed] });
        }
        setter("");
    };

    const handleRemoveTag = (field, tagToRemove) => {
        setProfile({ ...profile, [field]: profile[field].filter(t => t !== tagToRemove) });
    };

    const handleSave = async () => {
        setSaving(true);
        setToast(null);
        try {
            const user = getCurrentUser();
            if (user) {
                await updateUserProfile(user.uid, profile);
                setToast({ message: "Profile updated successfully!", type: "success" });
            }
        } catch (error) {
            console.error(error);
            setToast({ message: "Failed to update profile.", type: "error" });
        }
        setSaving(false);
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500 font-bold">Loading profile...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto pb-12 relative">
            <h1 className="text-4xl font-display font-black mb-8 text-slate-900">Your <span className="text-blue-500">Profile</span></h1>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="doodle-card p-8 space-y-6 bg-white border border-slate-200">
                    <h2 className="text-2xl font-display font-bold border-b border-slate-200 pb-4 flex items-center gap-2">Basic Information</h2>

                    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        <Avatar user={userContext} config={profile.avatarConfig} className="w-24 h-24 text-4xl shrink-0" />
                        <div className="flex-1 w-full space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Color Theme</label>
                                <div className="flex gap-2 flex-wrap">
                                    {AVATAR_COLORS.map(color => (
                                        <button
                                            key={color.id}
                                            onClick={() => setProfile({ ...profile, avatarConfig: { ...profile.avatarConfig, colorId: color.id } })}
                                            className={`w-8 h-8 rounded-full ${color.bg} border-2 ${profile.avatarConfig.colorId === color.id ? color.border : 'border-transparent'} hover:scale-110 transition-transform`}
                                            title={color.id}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Emoji Icon</label>
                                <div className="flex gap-1 flex-wrap">
                                    <button
                                        onClick={() => setProfile({ ...profile, avatarConfig: { ...profile.avatarConfig, emoji: "" } })}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-white border ${!profile.avatarConfig.emoji ? 'border-slate-800 shadow-sm' : 'border-slate-200 text-slate-400'}`}
                                    >
                                        A
                                    </button>
                                    {POPULAR_EMOJIS.map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => setProfile({ ...profile, avatarConfig: { ...profile.avatarConfig, emoji } })}
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white border ${profile.avatarConfig.emoji === emoji ? 'border-slate-800 shadow-sm' : 'border-slate-200 opacity-60 hover:opacity-100'}`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Department</label>
                        <input
                            type="text" name="department" value={profile.department} onChange={handleChange}
                            className="w-full doodle-input" placeholder="e.g. Computer Science"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Year of Study</label>
                        <select name="year" value={profile.year} onChange={handleChange} className="w-full doodle-input bg-white appearance-none">
                            <option value="">Select Year</option>
                            <option value="1">1st Year</option>
                            <option value="2">2nd Year</option>
                            <option value="3">3rd Year</option>
                            <option value="4">4th Year</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Role Preference (e.g. Frontend, Data Scientist)</label>
                        <input
                            type="text" name="rolePreference" value={profile.rolePreference} onChange={handleChange}
                            className="w-full doodle-input" placeholder="e.g. Frontend Developer"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Short Bio</label>
                        <textarea
                            name="bio" value={profile.bio} onChange={handleChange}
                            className="w-full doodle-input h-24 resize-none text-sm" placeholder="Tell us about yourself..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Availability</label>
                        <select name="availability" value={profile.availability} onChange={handleChange} className="w-full doodle-input bg-white appearance-none">
                            <option value="Available">Available for Projects</option>
                            <option value="Busy">Currently Busy</option>
                            <option value="Looking For Team">Looking for a Team</option>
                        </select>
                    </div>

                    <div className="pt-4 border-t-2 border-slate-200 space-y-4">
                        <label className="block text-sm font-bold text-slate-700">External Links</label>
                        <input
                            type="text" name="github" value={profile.github} onChange={handleChange}
                            className="w-full doodle-input py-2 text-sm" placeholder="GitHub URL"
                        />
                        <input
                            type="text" name="linkedin" value={profile.linkedin} onChange={handleChange}
                            className="w-full doodle-input py-2 text-sm" placeholder="LinkedIn URL"
                        />
                        <input
                            type="text" name="portfolio" value={profile.portfolio} onChange={handleChange}
                            className="w-full doodle-input py-2 text-sm" placeholder="Portfolio URL"
                        />
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="doodle-card p-8 bg-[#fff0f6]">
                        <h2 className="text-2xl font-display font-bold border-b-2 border-slate-800 pb-4 flex items-center gap-2">Attributes</h2>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Skills</label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddTag('skills', skillInput, setSkillInput)}
                                    className="flex-1 doodle-input" placeholder="e.g. React, Python"
                                />
                                <button
                                    onClick={() => handleAddTag('skills', skillInput, setSkillInput)}
                                    className="btn-doodle px-4"
                                >
                                    <Plus size={24} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map(skill => (
                                    <span key={skill} className="px-3 py-1 font-bold bg-blue-100 text-slate-800 text-sm rounded-full flex items-center gap-2 border-2 border-slate-800">
                                        {skill}
                                        <button onClick={() => handleRemoveTag('skills', skill)} className="hover:text-red-500"><X size={14} /></button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 mt-6">Interests</label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text" value={interestInput} onChange={e => setInterestInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddTag('interests', interestInput, setInterestInput)}
                                    className="flex-1 doodle-input" placeholder="e.g. AI, Cybersec"
                                />
                                <button
                                    onClick={() => handleAddTag('interests', interestInput, setInterestInput)}
                                    className="btn-doodle px-4"
                                >
                                    <Plus size={24} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {profile.interests.map(interest => (
                                    <span key={interest} className="px-3 py-1 font-bold bg-pink-100 text-slate-800 text-sm rounded-full flex items-center gap-2 border-2 border-slate-800">
                                        {interest}
                                        <button onClick={() => handleRemoveTag('interests', interest)} className="hover:text-red-500"><X size={14} /></button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="doodle-card p-8 bg-[#fffae6]">
                        <h2 className="text-2xl font-display font-bold border-b-2 border-slate-800 pb-4 flex items-center gap-2 mb-6">Badges & Inventory</h2>

                        {profile.badges && profile.badges.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {profile.badges.map((badge, idx) => (
                                    <div key={idx} className="flex flex-col items-center justify-center p-4 border-2 border-slate-800 bg-white rounded-2xl shadow-[2px_2px_0px_#1e293b]">
                                        <div className="w-12 h-12 bg-yellow-200 border-2 border-slate-800 rounded-full flex items-center justify-center mb-2 text-2xl">
                                            🏆
                                        </div>
                                        <p className="text-xs font-bold text-slate-800 text-center">{badge}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm font-bold text-slate-400 text-center p-6 border-2 border-dashed border-slate-300 rounded-xl">No badges earned yet.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-doodle btn-doodle-primary px-8"
                >
                    {saving ? <div className="w-6 h-6 border-4 border-slate-800 border-t-transparent rounded-full animate-spin"></div> : <><Save size={20} /> Save Profile</>}
                </button>
            </div>
        </div>
    );
}
