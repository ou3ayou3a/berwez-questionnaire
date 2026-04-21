// ╔══════════════════════════════════════════════════════════════╗
// ║  FIREBASE SETUP — Follow these steps (takes 2 minutes):    ║
// ║                                                            ║
// ║  1. Go to https://console.firebase.google.com              ║
// ║  2. Click "Create a project" → name it "berwez"            ║
// ║  3. Skip Google Analytics → Create Project                 ║
// ║  4. Left sidebar → Build → Realtime Database               ║
// ║  5. Click "Create Database" → choose any region → Start    ║
// ║  6. Go to Rules tab, paste this and Publish:               ║
// ║     {                                                      ║
// ║       "rules": {                                           ║
// ║         ".read": true,                                     ║
// ║         ".write": true                                     ║
// ║       }                                                    ║
// ║     }                                                      ║
// ║  7. Go to Project Settings (gear icon) → General           ║
// ║  8. Scroll down → "Your apps" → click Web (</>)            ║
// ║  9. Register app (any name) → copy the firebaseConfig      ║
// ║ 10. Paste the values below                                 ║
// ╚══════════════════════════════════════════════════════════════╝

import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, remove } from "firebase/database";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Storage API matching the app's needs
export const storage = {
  async get(key) {
    try {
      const snapshot = await get(ref(db, key));
      if (snapshot.exists()) return { value: JSON.stringify(snapshot.val()) };
      return null;
    } catch (e) {
      console.error("DB read error:", e);
      return null;
    }
  },
  async set(key, value) {
    try {
      await set(ref(db, key), JSON.parse(value));
      return true;
    } catch (e) {
      console.error("DB write error:", e);
      return false;
    }
  },
  async delete(key) {
    try {
      await remove(ref(db, key));
      return true;
    } catch (e) {
      console.error("DB delete error:", e);
      return false;
    }
  }
};
