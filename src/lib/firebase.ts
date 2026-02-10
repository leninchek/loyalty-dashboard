import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC_NS2-xT3_Yg0ZuIOo5A5TC-i0xFs4tn4",
  authDomain: "loyalty-redemption.firebaseapp.com",
  projectId: "loyalty-redemption",
  storageBucket: "loyalty-redemption.firebasestorage.app",
  messagingSenderId: "201458808631",
  appId: "1:201458808631:web:40669a1db272d8a373ccb2",
  measurementId: "G-4CS1C9DZY5"
};

// Initialize Firebase
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

export { db };
