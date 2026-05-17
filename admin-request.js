import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, getDocs, updateDoc, doc, addDoc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔹 Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyADvcSURAT597F0IBqKydNZWmWSp1wumr8",
  authDomain: "smartgovhub.firebaseapp.com",
  projectId: "smartgovhub",
  storageBucket: "smartgovhub.appspot.com",
  messagingSenderId: "272299843116",
  appId: "1:272299843116:web:331d652a7e0374d5707b89"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔐 Protect page
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadRequests();
  } else {
    window.location.href = "admin-login.html";
  }
});

// 📄 Load Requests
async function loadRequests() {

  const snapshot = await getDocs(collection(db, "requests"));
  const table = document.getElementById("requestsTable");
  table.innerHTML = "";

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${data.userName || "Unknown"}</td>
      <td>${data.serviceType}</td>
      <td>${data.status}</td>
      <td>
        <button class="btn btn-success btn-sm approve-btn">Approve</button>
        <button class="btn btn-danger btn-sm reject-btn">Reject</button>
      </td>
    `;

    // Attach event listeners properly
    row.querySelector(".approve-btn").addEventListener("click", () => {
      approveRequest(docSnap.id, data.userId);
    });

    row.querySelector(".reject-btn").addEventListener("click", () => {
      rejectRequest(docSnap.id, data.userId);
    });

    table.appendChild(row);
  });
}

// ✅ Approve
async function approveRequest(requestId, userId) {

  await updateDoc(doc(db, "requests", requestId), {
    status: "approved"
  });

  await addDoc(collection(db, "notifications"), {
    userId: userId,
    message: "Your request has been approved.",
    createdAt: new Date(),
    read: false
  });

  alert("Request Approved");
  loadRequests();
}

// ❌ Reject
async function rejectRequest(requestId, userId) {

  await updateDoc(doc(db, "requests", requestId), {
    status: "rejected"
  });

  await addDoc(collection(db, "notifications"), {
    userId: userId,
    message: "Your request has been rejected.",
    createdAt: new Date(),
    read: false
  });

  alert("Request Rejected");
  loadRequests();
}
