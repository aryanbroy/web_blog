// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-blog-be756.firebaseapp.com",
  projectId: "mern-blog-be756",
  storageBucket: "mern-blog-be756.appspot.com",
  messagingSenderId: "54706523137",
  appId: "1:54706523137:web:1e60881e8fe42e65ad0400",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
