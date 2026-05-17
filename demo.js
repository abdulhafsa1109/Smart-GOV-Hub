


import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase config
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
const db = getFirestore(app);

// Function to test Firestore
async function testFirestore() {
  try {
    const schemesRef = collection(db, "schemes"); // your collection
    const snapshot = await getDocs(schemesRef);

    if (snapshot.empty) {
      console.log("No documents found in 'schemes' collection.");
      alert("Firestore is connected, but no records found!");
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      console.log("Document ID:", doc.id);
      console.log("Scheme Name:", data.name);
      console.log("Scheme Details:", data);
      alert(`Firestore connected!\nScheme Name: ${data.name}`);
    });
  } catch (error) {
    console.error("Error connecting to Firestore:", error);
    alert("Failed to connect to Firestore. Check console.");
  }
}
testFirestore();