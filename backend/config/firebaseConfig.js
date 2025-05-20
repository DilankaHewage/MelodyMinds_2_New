import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Your Firebase config object
const firebaseConfig = {
    apiKey: "AIzaSyAAzKszBqLcqI2_b1XuvSvoGqXHqWBUbpc",

    authDomain: "melodyminds2002.firebaseapp.com",
  
    projectId: "melodyminds2002",
  
    storageBucket: "melodyminds2002.firebasestorage.app",
  
    messagingSenderId: "1075932789424",
  
    appId: "1:1075932789424:web:bd6a7ce516f44d66661975",
  
    measurementId: "G-WZ0KPYFTW0"
  
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
