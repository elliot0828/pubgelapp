const firebaseConfig = {
  apiKey: "AIzaSyAtiVya6ezrJ5I7Szd3LBibipGCDwx_NZ0",
  authDomain: "pubgel.firebaseapp.com",
  projectId: "pubgel",
  storageBucket: "pubgel.firebasestorage.app",
  messagingSenderId: "455438167199",
  appId: "1:455438167199:ios:f710cb47e397e0695a06aa",
  measurementId: "G-W9P3Q8Y8JD",
};
import { initializeApp, getApps, getApp } from "firebase/app";

import { getAuth, initializeAuth } from "firebase/auth";
import { getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const initFirebase = () => {
  let app = null;
  let auth = null;
  let db = null;

  // Firebase 앱이 초기화되지 않았다면 초기화
  if (getApps().length === 0) {
    try {
      app = initializeApp(firebaseConfig);

      // 인증 초기화 (AsyncStorage를 사용하여 지속성 설정)
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });

      // Firestore 초기화
      db = getFirestore(app);
    } catch (e) {
      console.error("Firebase initialization error: ", e);
    }
  } else {
    app = getApp();
    auth = getAuth(app); // 기존 앱에서 인증 객체를 가져옴
    db = getFirestore(app); // 기존 앱에서 Firestore 객체를 가져옴
  }

  return { app, auth, db };
};
export default initFirebase;
