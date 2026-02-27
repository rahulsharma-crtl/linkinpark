import { db } from "../firebase";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";

export const createUserIfNotExists = async (user) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || "Node User",
            photoURL: user.photoURL || "",
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
            badges: ["Pioneer"],
            avatarConfig: { colorId: "blue", emoji: "" },
            createdAt: new Date().toISOString()
        });
    } else {
        // Ensure name and photo are synced if they were missing
        const data = docSnap.data();
        if (!data.displayName || !data.photoURL) {
            await setDoc(userRef, {
                displayName: data.displayName || user.displayName || "Node User",
                photoURL: data.photoURL || user.photoURL || "",
            }, { merge: true });
        }
    }
};

export const getUserById = async (uid) => {
    if (!uid) return null;
    const userRef = doc(db, "users", uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
        return docSnap.data();
    }
    return null;
};

export const getAllUsers = async () => {
    const usersCol = collection(db, "users");
    const userSnapshot = await getDocs(usersCol);
    return userSnapshot.docs.map(doc => doc.data());
};

export const updateUserProfile = async (uid, data) => {
    if (!uid) return;
    const userRef = doc(db, "users", uid);
    try {
        if (data.bio && data.bio.length > 20 && data.badges && !data.badges.includes("Storyteller")) {
            data.badges.push("Storyteller");
        }
        if (data.skills && data.skills.length >= 5 && data.badges && !data.badges.includes("Skill Master")) {
            data.badges.push("Skill Master");
        }
        await setDoc(userRef, data, { merge: true });
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
};
