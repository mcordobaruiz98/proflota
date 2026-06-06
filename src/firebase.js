import { initializeApp }             from "firebase/app";
import { getStorage }                from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore }              from "firebase/firestore";

const firebaseConfig = {
  apiKey:            "AIzaSyBhiMiU9l3axu4jZe2Frik2eqIpL7CcNik",
  authDomain:        "fleteapp-2e412.firebaseapp.com",
  projectId:         "fleteapp-2e412",
  storageBucket:     "fleteapp-2e412.firebasestorage.app",
  messagingSenderId: "1044171687201",
  appId:             "1:1044171687201:web:8eb618a2737934865eea60",
};

const app = initializeApp(firebaseConfig);

export const storage        = getStorage(app);
export const auth           = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db             = getFirestore(app);