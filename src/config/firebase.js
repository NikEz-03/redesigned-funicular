import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBWHAceXnzRT1tHfbIiSW8ttAk1LpbE368",
    authDomain: "sarawakdigitalaccess.firebaseapp.com",
    projectId: "sarawakdigitalaccess",
    storageBucket: "sarawakdigitalaccess.firebasestorage.app",
    messagingSenderId: "633029134632",
    appId: "1:633029134632:web:01b841f61b33b50bdb681d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
