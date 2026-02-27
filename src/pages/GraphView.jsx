import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { getAllUsers } from '../services/userService';
import { calculateCompatibility } from '../services/matchService';
import { getCurrentUser } from '../services/authService';
import { X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GraphView() {
    const graphRef = useRef();
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [selectedNode, setSelectedNode] = useState(null);
    // Assuming 64rem (256px) sidebar, keeping it responsive
    const [dimensions, setDimensions] = useState({ width: window.innerWidth - 256, height: window.innerHeight });
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth - (window.innerWidth < 768 ? 0 : 256), // Adjust for mobile if we had one
                height: window.innerHeight
            });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const loadGraphData = async () => {
            const users = await getAllUsers();

            const nodes = users.map(user => ({
                id: user.uid,
                name: user.displayName,
                group: user.department || 'Unknown',
                val: 5,
                ...user
            }));

            const links = [];
            for (let i = 0; i < users.length; i++) {
                for (let j = i + 1; j < users.length; j++) {
                    const { score, explanation } = calculateCompatibility(users[i], users[j]);
                    if (score >= 65) {
                        links.push({
                            source: users[i].uid,
                            target: users[j].uid,
                            value: score,
                            explanation
                        });
                    }
                }
            }

            setGraphData({ nodes, links });
        };
        loadGraphData();
    }, []);

    const handleNodeClick = useCallback((node) => {
        // Find best match if clicking on someone else
        const me = getCurrentUser();
        let matchInfo = null;
        if (me && node.uid !== me.uid) {
            const myNode = graphData.nodes.find(n => n.uid === me.uid);
            if (myNode) {
                matchInfo = calculateCompatibility(myNode, node);
            }
        }

        setSelectedNode({ ...node, matchInfo });

        graphRef.current?.centerAt(node.x, node.y, 1000);
        graphRef.current?.zoom(4, 2000);
    }, [graphData]);

    const nodeColors = useMemo(() => {
        const colors = ['#fca5a5', '#93c5fd', '#86efac', '#fde047', '#c4b5fd', '#fbcfe8'];
        let mapping = {};
        let idx = 0;
        return (group) => {
            if (!mapping[group]) {
                mapping[group] = colors[idx % colors.length];
                idx++;
            }
            return mapping[group];
        }
    }, []);

    return (
        <div className="relative w-full h-full bg-[#f7f7f7] overflow-hidden -m-8">
            {/* Graph Legend Overlay */}
            <div className="absolute top-4 left-4 doodle-card p-4 bg-white z-10 w-48 shadow-sm">
                <h3 className="text-sm font-bold border-b-2 border-slate-800 pb-2 mb-2">Departments</h3>
                <div className="flex flex-col gap-2">
                    {Array.from(new Set(graphData.nodes.map(n => n.group))).map(dept => (
                        <div key={dept} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <div className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: nodeColors(dept) }}></div>
                            <span className="truncate">{dept}</span>
                        </div>
                    ))}
                </div>
            </div>

            <ForceGraph2D
                ref={graphRef}
                width={dimensions.width}
                height={dimensions.height}
                graphData={graphData}
                nodeAutoColorBy="group"
                onNodeClick={handleNodeClick}
                nodeCanvasObject={(node, ctx, globalScale) => {
                    // Show emoji or initials if we have them
                    const label = (node.avatarConfig && node.avatarConfig.emoji)
                        ? node.avatarConfig.emoji
                        : (node.name ? node.name.charAt(0).toUpperCase() : '?');

                    const fontSize = 14 / globalScale;
                    ctx.font = `bold ${fontSize}px "Outfit", Sans-Serif`;

                    // Draw node bg
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI, false);
                    ctx.fillStyle = nodeColors(node.group);
                    ctx.fill();
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = '#cbd5e1'; // softer slate border
                    ctx.stroke();

                    // Draw label text
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#1e293b';
                    ctx.fillText(label, node.x, node.y);

                    // Draw name below
                    const textLabel = node.name;
                    const textFontSize = 8 / globalScale;
                    ctx.font = `600 ${textFontSize}px "Outfit", Sans-Serif`;
                    ctx.fillText(textLabel, node.x, node.y + 10);
                }}
                linkColor={() => '#e2e8f0'} // lighter slate
                linkWidth={link => link.value > 80 ? 2 : 1}
                d3VelocityDecay={0.3}
            />

            {/* Node Info Overlay */}
            {selectedNode && (
                <div className="absolute top-4 right-4 w-80 doodle-card p-6 bg-white z-20 shadow-md animate-slide-in">
                    <div className="flex justify-between items-start mb-4 border-b-2 border-slate-800 pb-4">
                        <div className="flex-1 pr-4">
                            <h2 className="text-2xl font-display font-black text-slate-900 leading-tight">{selectedNode.name}</h2>
                            <p className="text-slate-500 font-bold">{selectedNode.department || 'No department'}</p>
                            <p className="text-xs font-bold text-slate-400 mt-1">{selectedNode.rolePreference}</p>
                        </div>
                        <button
                            onClick={() => setSelectedNode(null)}
                            className="text-slate-400 hover:text-slate-900 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {selectedNode.bio && (
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bio</h4>
                                <p className="text-sm font-medium text-slate-700 italic">"{selectedNode.bio}"</p>
                            </div>
                        )}

                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Skills</h4>
                            <div className="flex flex-wrap gap-1">
                                {selectedNode.skills && selectedNode.skills.length > 0 ? (
                                    selectedNode.skills.map((skill, i) => (
                                        <span key={i} className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">{skill}</span>
                                    ))
                                ) : (
                                    <span className="text-xs text-slate-500 italic">No skills listed</span>
                                )}
                            </div>
                        </div>

                        {(selectedNode.github || selectedNode.linkedin || selectedNode.portfolio) && (
                            <div className="flex gap-2 pt-2 border-t-2 border-slate-100">
                                {selectedNode.github && <a href={selectedNode.github} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-900"><ExternalLink size={16} /></a>}
                                {selectedNode.linkedin && <a href={selectedNode.linkedin} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600"><ExternalLink size={16} /></a>}
                                {selectedNode.portfolio && <a href={selectedNode.portfolio} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-pink-500"><ExternalLink size={16} /></a>}
                            </div>
                        )}

                        {selectedNode.matchInfo && selectedNode.matchInfo.score > 0 && (
                            <div className="mt-4 pt-4 border-t-2 border-slate-800">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-slate-500">Compatibility</span>
                                    <span className="text-xl font-black text-pink-500">{selectedNode.matchInfo.score}%</span>
                                </div>
                                <p className="text-xs font-semibold text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200">
                                    💡 {selectedNode.matchInfo.explanation}
                                </p>
                            </div>
                        )}

                        <div className="pt-4 mt-4 border-t-2 border-slate-800 flex justify-end">
                            <button
                                onClick={() => navigate(`/room/new?partner=${selectedNode.uid}`)}
                                className="btn-doodle w-full"
                            >
                                Start Collab
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
