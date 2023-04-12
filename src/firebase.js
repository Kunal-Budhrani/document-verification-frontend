import firebase from "firebase";
import "firebase/auth";
import "firebase/storage";
import "firebase/firestore";

const app = firebase.initializeApp({
  apiKey: "AIzaSyCh8Br2bE4ZIzpcQ-P-0jt88lubXD82TVM",
  authDomain: "ai-in-ecommerce.firebaseapp.com",
  projectId: "ai-in-ecommerce",
  storageBucket: "ai-in-ecommerce.appspot.com",
  messagingSenderId: "456002446744",
  appId: "1:456002446744:web:acf23c32615ea3f79c77ed",
});

export const storage = app.storage();
export const firestore = app.firestore();
export const auth = app.auth();
export default app;
