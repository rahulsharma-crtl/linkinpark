import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getTeamById, getTeamTasks, addTaskToTeam, updateTaskStatus } from "../services/teamService";
import { getUserById } from "../services/userService";
import { subscribeToRoomMessages, sendMessageToRoom } from "../services/chatService";
import { getCurrentUser } from "../services/authService";
import Avatar from "../components/Avatar";
import { Plus, GripVertical, Send, MessageSquare, LayoutDashboard, Layout, CheckCircle2, Clock, ListTodo } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProjectRoom() {
    const { id } = useParams();
    const [team, setTeam] = useState(null);
    const [members, setMembers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState("");

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isChatOpen, setIsChatOpen] = useState(true);
    const chatEndRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const currentUser = getCurrentUser();

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isChatOpen]);

    useEffect(() => {
        const fetchRoomData = async () => {
            if (!id) return;
            const t = await getTeamById(id);
            if (t) {
                setTeam(t);
                const memData = await Promise.all((t.members || []).map(uid => getUserById(uid)));
                setMembers(memData.filter(Boolean));
                const tsks = await getTeamTasks(id);
                setTasks(tsks);
            }
            setLoading(false);
        };
        fetchRoomData();

        const unsubscribeChat = subscribeToRoomMessages(id, (msgs) => {
            setMessages(msgs);
        });

        return () => unsubscribeChat();
    }, [id]);

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        const payload = { title: newTaskTitle, status: "todo", assignee: null };
        const taskId = await addTaskToTeam(id, payload);
        setTasks([...tasks, { id: taskId, ...payload }]);
        setNewTaskTitle("");
    };

    const handleMoveTask = async (taskId, newStatus) => {
        await updateTaskStatus(id, taskId, newStatus);
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser) return;
        const fullUser = members.find(m => m.uid === currentUser.uid) || currentUser;
        try {
            await sendMessageToRoom(id, fullUser, newMessage);
            setNewMessage("");
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    if (loading) return <div className="p-20 text-center font-bold text-slate-400 animate-pulse">Initializing Workspace...</div>;
    if (!team) return <div className="p-20 text-center text-red-500 font-black">404: Workspace vanished.</div>;

    const todoTasks = tasks.filter(t => t.status === "todo");
    const doingTasks = tasks.filter(t => t.status === "doing");
    const doneTasks = tasks.filter(t => t.status === "done");

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="h-[calc(100vh-140px)] flex flex-col"
        >
            {/* Header Section */}
            <div className="flex justify-between items-start mb-10 shrink-0">
                <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-white rounded-3xl shadow-soft border border-border flex items-center justify-center text-primary">
                        <Layout size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-heading">{team.name}</h1>
                        <p className="text-slate-500 font-medium mt-1">{team.description}</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex -space-x-3 pr-4 border-r border-border">
                        {members.map(m => (
                            <div key={m.uid} className="relative ring-4 ring-bg rounded-full">
                                <Avatar user={m} config={m.avatarConfig} className="w-10 h-10 text-xs shadow-soft" />
                            </div>
                        ))}
                        <button className="w-10 h-10 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-all ml-1">
                            <Plus size={16} />
                        </button>
                    </div>
                    <button
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        className={`h-12 px-6 rounded-2xl font-bold flex items-center gap-2 transition-all ${isChatOpen ? 'bg-white text-slate-600 border border-border' : 'btn-primary'}`}
                    >
                        {isChatOpen ? <LayoutDashboard size={18} /> : <MessageSquare size={18} />}
                        {isChatOpen ? 'Focus Mode' : 'Open Discussion'}
                    </button>
                </div>
            </div>

            {/* Kanban + Chat */}
            <div className="flex-1 flex gap-8 min-h-0">
                <div className={`flex-1 grid ${isChatOpen ? 'grid-cols-2 xl:grid-cols-3' : 'grid-cols-3'} gap-6 overflow-hidden`}>

                    {/* Columns */}
                    <BoardColumn
                        title="Ideation"
                        icon={<ListTodo size={18} className="text-slate-400" />}
                        tasks={todoTasks}
                        count={todoTasks.length}
                        onAddSubmit={handleAddTask}
                        inputValue={newTaskTitle}
                        onInputChange={setNewTaskTitle}
                    >
                        {todoTasks.map((t, i) => (
                            <TaskCard key={t.id} task={t} onMove={(status) => handleMoveTask(t.id, status)} />
                        ))}
                    </BoardColumn>

                    <BoardColumn
                        title="Active Execution"
                        icon={<Clock size={18} className="text-primary" />}
                        tasks={doingTasks}
                        count={doingTasks.length}
                        variant="active"
                    >
                        {doingTasks.map((t, i) => (
                            <TaskCard key={t.id} task={t} onMove={(status) => handleMoveTask(t.id, status)} />
                        ))}
                    </BoardColumn>

                    <BoardColumn
                        title="Validated"
                        icon={<CheckCircle2 size={18} className="text-accent" />}
                        tasks={doneTasks}
                        count={doneTasks.length}
                    >
                        {doneTasks.map((t, i) => (
                            <TaskCard key={t.id} task={t} onMove={(status) => handleMoveTask(t.id, status)} />
                        ))}
                    </BoardColumn>
                </div>

                <AnimatePresence>
                    {isChatOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="w-96 saas-card bg-white flex flex-col border border-border shadow-premium overflow-hidden shrink-0"
                        >
                            <div className="p-6 border-b border-border bg-slate-50/30 flex items-center justify-between">
                                <h3 className="font-extrabold text-heading text-sm uppercase tracking-widest flex items-center gap-2">
                                    <MessageSquare size={18} className="text-primary" /> Team Relay
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black text-slate-400">SYNCED</span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white/50">
                                {messages.map((msg, i) => {
                                    const isMe = currentUser?.uid === msg.senderId;
                                    return (
                                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-end gap-3 max-w-[85%]">
                                                {!isMe && <Avatar user={{ displayName: msg.senderName }} config={msg.senderAvatarConfig} className="w-8 h-8 text-[10px]" />}
                                                <div className={`px-5 py-3 rounded-2xl text-sm font-medium leading-relaxed ${isMe ? 'bg-primary text-white rounded-br-none' : 'bg-slate-100 text-slate-600 rounded-bl-none'}`}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-black text-slate-300 mt-1.5 px-1 uppercase tracking-tighter">
                                                {isMe ? 'Sent' : (msg.senderName || 'Peer')?.split(' ')[0]}
                                            </span>
                                        </div>
                                    );
                                })}
                                <div ref={chatEndRef} />
                            </div>

                            <form onSubmit={handleSendMessage} className="p-6 border-t border-border bg-white">
                                <div className="flex items-center gap-2 saas-input p-1 focus-within:ring-2 ring-primary/10">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        placeholder="Discuss anything..."
                                        className="bg-transparent border-none focus:ring-0 text-sm flex-1 ml-3 font-semibold text-heading outline-none py-2"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="h-10 w-10 btn-primary rounded-xl flex items-center justify-center p-0 disabled:opacity-30"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

function BoardColumn({ title, icon, count, children, variant, onAddSubmit, inputValue, onInputChange }) {
    return (
        <div className={`saas-card flex flex-col overflow-hidden border ${variant === 'active' ? 'bg-primary/5 border-primary/20 shadow-soft' : 'bg-white border-border'}`}>
            <div className="p-5 border-b border-border flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    {icon}
                    <h3 className="text-sm font-black uppercase tracking-widest text-heading">{title}</h3>
                </div>
                <span className="h-6 min-w-[24px] px-2 flex items-center justify-center bg-slate-100 rounded-lg text-[10px] font-black text-slate-500">{count}</span>
            </div>

            {onAddSubmit && (
                <div className="p-4 border-b border-border bg-slate-50/30">
                    <form onSubmit={onAddSubmit} className="relative">
                        <input
                            type="text"
                            placeholder="Snapshot a task..."
                            className="saas-input w-full h-11 pl-4 pr-10 text-sm font-bold"
                            value={inputValue}
                            onChange={(e) => onInputChange(e.target.value)}
                        />
                        <button type="submit" className="absolute right-2 top-2 h-7 w-7 bg-primary text-white rounded-lg flex items-center justify-center shadow-lg"><Plus size={16} /></button>
                    </form>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                <AnimatePresence>
                    {children}
                </AnimatePresence>
            </div>
        </div>
    );
}

function TaskCard({ task, onMove }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="saas-card p-5 bg-white shadow-soft border border-slate-100 group hover:border-primary/20 transition-all"
        >
            <div className="flex items-start gap-3">
                <GripVertical size={16} className="text-slate-200 mt-0.5 shrink-0" />
                <p className={`text-sm font-bold leading-relaxed ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                    {task.title}
                </p>
            </div>

            <div className="mt-4 flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                {task.status !== 'todo' && (
                    <button onClick={() => onMove('todo')} className="text-[10px] font-black uppercase px-3 py-1 bg-slate-50 text-slate-400 hover:text-heading rounded-lg transition-all">Reset</button>
                )}
                {task.status !== 'doing' && (
                    <button onClick={() => onMove('doing')} className="text-[10px] font-black uppercase px-3 py-1 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-all">Activate</button>
                )}
                {task.status !== 'done' && (
                    <button onClick={() => onMove('done')} className="text-[10px] font-black uppercase px-3 py-1 bg-accent/10 text-accent hover:bg-accent hover:text-white rounded-lg transition-all">Verify</button>
                )}
            </div>
        </motion.div>
    );
}
