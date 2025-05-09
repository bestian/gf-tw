// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref } from "firebase/database";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA33TjfaprwOUgYGaXrMaFsWzhsw7dRCRA",
  authDomain: "start-vue.firebaseapp.com",
  databaseURL: "https://start-vue.firebaseio.com",
  projectId: "start-vue",
  storageBucket: "start-vue.firebasestorage.app",
  messagingSenderId: "1094423879350",
  appId: "1:1094423879350:web:5ef0a1bfc24e51a2bc5017"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

export const auth = getAuth(app);

export const web_storesRef = ref(db, 'web_stores');
export const physical_storesRef = ref(db, 'physical_stores');
