import firebase from "firebase";
import "firebase/auth";
import "firebase/storage";
import "firebase/firestore";

const app = firebase.initializeApp({
  apiKey: "AIzaSyAyHCksoiXX5fIPNsUJupPOM494v8KQee8",
  authDomain: "document-verification-657f2.firebaseapp.com",
  projectId: "document-verification-657f2",
  storageBucket: "document-verification-657f2.appspot.com",
  messagingSenderId: "1074612588052",
  appId: "1:1074612588052:web:2fb6814eed6f0ea91a2101"
});

export const storage = app.storage();
export const firestore = app.firestore();
export const auth = app.auth();
export default app;
