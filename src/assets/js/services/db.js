import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCQM944iOAuAkbs9SXxrowKhd9l71neorQ",
    authDomain: "musify-21f51.firebaseapp.com",
    projectId: "musify-21f51",
    storageBucket: "musify-21f51.firebasestorage.app",
    messagingSenderId: "739335718610",
    appId: "1:739335718610:web:e6cdfe0f4c60c0ca104f0b",
    measurementId: "G-5TH87C38HE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Firestore Service
const FirestoreService = {
    saveUserData: async (uid, data) => {
        if (!uid) return;
        try {
            await setDoc(doc(db, "users", uid), data, { merge: true });
        } catch (e) {
            console.error("Error saving user data:", e);
        }
    },
    getUserData: async (uid) => {
        try {
            const docSnap = await getDoc(doc(db, "users", uid));
            if (docSnap.exists()) {
                return docSnap.data();
            }
        } catch (e) {
            console.error("Error getting user data:", e);
        }
        return null;
    },
    addRecentPlay: async (uid, songId) => {
        if (!uid || !songId) return;
        try {
            const userRef = doc(db, "users", uid);
            const docSnap = await getDoc(userRef);
            let recent = [];
            if (docSnap.exists()) {
                recent = docSnap.data().recentPlay || [];
            }
            // Remove if exists to move to top
            recent = recent.filter(id => id !== songId);
            recent.unshift(songId);
            // Limit to 50
            if (recent.length > 50) recent = recent.slice(0, 50);

            await setDoc(userRef, { recentPlay: recent }, { merge: true });
        } catch (e) {
            console.error("Error updating recent play:", e);
        }
    }
};

export { app, analytics, auth, db, FirestoreService };
