import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyACupc8Q3dO_CaWzcp0YgTFlttJTD7_aA8",
    authDomain: "connect-115d5.firebaseapp.com",
    projectId: "connect-115d5",
    storageBucket: "connect-115d5.firebasestorage.app",
    messagingSenderId: "1043835872556",
    appId: "1:1043835872556:web:615f2955a8c040260ab889",
    measurementId: "G-D6RJ5J2M14"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const users = [
    {
        uid: "seed_user_1",
        displayName: "Priya Patel",
        email: "priya@example.com",
        department: "Design",
        skills: ["UI/UX", "Figma", "Tailwind"],
        bio: "Passionate designer looking for dev collaborators.",
        avatarConfig: { colorId: "pink", emoji: "🎨" }
    },
    {
        uid: "seed_user_2",
        displayName: "Amit Singh",
        email: "amit@example.com",
        department: "Marketing",
        skills: ["SEO", "Strategy", "Growth"],
        bio: "Building the next big thing in SaaS.",
        avatarConfig: { colorId: "green", emoji: "🚀" }
    },
    {
        uid: "seed_user_3",
        displayName: "Sarah Jones",
        email: "sarah@example.com",
        department: "Engineering",
        skills: ["Python", "AWS", "Docker"],
        bio: "Backend enthusiast and cloud architect.",
        avatarConfig: { colorId: "blue", emoji: "☁️" }
    }
];

async function seedData() {
    console.log("Seeding users...");
    for (const user of users) {
        try {
            await setDoc(doc(db, "users", user.uid), {
                ...user,
                createdAt: new Date().toISOString()
            });
            console.log(`Seeded: ${user.displayName}`);
        } catch (e) {
            console.error(`Error seeding ${user.displayName}:`, e);
        }
    }
    console.log("Seeding complete!");
    process.exit(0);
}

seedData().catch(console.error);
