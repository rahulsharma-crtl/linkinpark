import { db } from "../firebase";
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, arrayUnion, addDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { getCurrentUser } from "./authService";

export const createTeam = async (name, description, tags, members = []) => {
    const currentUser = getCurrentUser();
    if (!currentUser) throw new Error("Not logged in");

    const teamId = uuidv4();
    const teamRef = doc(db, "teams", teamId);

    // Add creator to members automatically
    const allMembers = Array.from(new Set([currentUser.uid, ...members.map(m => m.uid)]));

    await setDoc(teamRef, {
        id: teamId,
        name: name || "New Project Team",
        description: description || "",
        tags: tags || [],
        members: allMembers,
        createdBy: currentUser.uid,
        createdAt: new Date().toISOString(),
        status: "active"
    });

    return teamId;
};

export const getTeamById = async (teamId) => {
    const teamRef = doc(db, "teams", teamId);
    const docSnap = await getDoc(teamRef);
    if (docSnap.exists()) {
        return docSnap.data();
    }
    return null;
};

export const getTeams = async () => {
    const teamsCol = collection(db, "teams");
    const snapshot = await getDocs(teamsCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const joinTeam = async (teamId) => {
    const currentUser = getCurrentUser();
    if (!currentUser) throw new Error("Not logged in");

    const teamRef = doc(db, "teams", teamId);
    await updateDoc(teamRef, {
        members: arrayUnion(currentUser.uid)
    });
};

export const getTeamTasks = async (teamId) => {
    const tasksCol = collection(db, `teams/${teamId}/tasks`);
    const taskSnapshot = await getDocs(tasksCol);
    return taskSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addTaskToTeam = async (teamId, taskPayload) => {
    const tasksCol = collection(db, `teams/${teamId}/tasks`);
    const docRef = await addDoc(tasksCol, {
        ...taskPayload,
        createdAt: new Date().toISOString()
    });
    return docRef.id;
};

export const updateTaskStatus = async (teamId, taskId, newStatus) => {
    const taskRef = doc(db, `teams/${teamId}/tasks`, taskId);
    await updateDoc(taskRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
    });
};
