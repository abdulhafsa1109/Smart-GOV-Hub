
// Import Firebase libraries
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔹 Replace this with YOUR Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyADvcSURAT597F0IBqKydNZWmWSp1wumr8",
  authDomain: "smartgovhub.firebaseapp.com",
  projectId: "smartgovhub",
  storageBucket: "smartgovhub.appspot.com",
  messagingSenderId: "272299843116",
  appId: "1:272299843116:web:331d652a7e0374d5707b89"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Admin Login Function
window.adminLogin = async function(event) {
  event.preventDefault(); 

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const snapshot = await getDocs(collection(db, "admins"));
    let isAdmin = false;

    snapshot.forEach(doc => {
      if (doc.data().email === email) {
        isAdmin = true;
      }
    });

    if (isAdmin) {
      alert("Login Successful!");
      window.location.href = "admin-dashboard.html"; 
    } else {
      alert("Access Denied. Not an Admin.");
      auth.signOut();
    }

  } catch (error) {
    alert("Login Failed: " + error.message);
  }
}

