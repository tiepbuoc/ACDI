// acdi-firebase-config.js
// Cấu hình Firebase RIÊNG cho hệ thống ACDI Check — độc lập hoàn toàn với AI SMART
// (AI SMART Chatbot / Learning Passport dùng project Firebase khác, xem firebase-config.js).
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const acdiFirebaseConfig = {
  apiKey: "AIzaSyB8_X3krCKbzVoNEUraLEMYX48DYNjTvWk",
  authDomain: "cdacdi-6df86.firebaseapp.com",
  projectId: "cdacdi-6df86",
  storageBucket: "cdacdi-6df86.firebasestorage.app",
  messagingSenderId: "240040753346",
  appId: "1:240040753346:web:7a59ecbc1391f2cc90e35b",
  measurementId: "G-3N9DLHPD2R",
};

export const acdiApp = initializeApp(acdiFirebaseConfig, "acdi");
export const acdiDb = getFirestore(acdiApp);
