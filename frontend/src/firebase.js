import { initializeApp } from "firebase/app"
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBPxUL-hdkUBPTo7gN6wc4cnTKHw0QsSik",
    authDomain: "legsday-eb48b.firebaseapp.com",
    projectId: "legsday-eb48b",
    storageBucket: "legsday-eb48b.appspot.com",
    messagingSenderId: "532445102086",
    appId: "1:532445102086:web:61542969dfa0f746bdc387",
    measurementId: "G-G64DD977BH"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

setPersistence(auth, browserSessionPersistence)
    .then(() => {
    // Existing and future Auth states will persist
    })
    .catch((error) => {
        console.error(error);
    });

export { auth };