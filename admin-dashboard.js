import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { 
  getFirestore, 
  collection, 
  getDocs, 
  updateDoc,
  doc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
let editingSchemeId = null;
import { getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";



// 🔥 REPLACE WITH YOUR CONFIG
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

// 🔐 Check Login
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    loadDashboard();
  }
});

// 🚪 Logout
window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
};

async function loadDashboard() {
  const requestsSnap = await getDocs(collection(db, "requests"));

  let total = 0;
  let pending = 0;
  let approved = 0;

  const table = document.getElementById("requestsTable");
  table.innerHTML = "";

  requestsSnap.forEach((docSnap) => {
    const data = docSnap.data();

    total++;

    if (data.status === "Pending") pending++;
    if (data.status === "Approved") approved++;

    const isFinal =
      data.status === "Approved" || data.status === "Rejected";

    const row = `
      <tr>
        <td>${data.userName || "N/A"}</td>
        <td>${data.Category || "N/A"}</td>
        <td>${data.SchemeName || "N/A"}</td>
        <td>${data.type || "N/A"}</td>
        <td>
          <span class="badge bg-${getStatusColor(data.status)}">
            ${data.status || "Pending"}
          </span>
        </td>
        <td>
          <button class="btn btn-warning btn-sm me-1"
            onclick="updateStatus('${docSnap.id}', 'Checking')"
            ${isFinal ? "disabled" : ""}>
            Checking
          </button>

          <button class="btn btn-info btn-sm me-1"
            onclick="updateStatus('${docSnap.id}', 'Waiting')"
            ${isFinal ? "disabled" : ""}>
            Waiting
          </button>

          <button class="btn btn-success btn-sm me-1"
            onclick="updateStatus('${docSnap.id}', 'Approved')"
            ${isFinal ? "disabled" : ""}>
            Approve
          </button>

          <button class="btn btn-danger btn-sm"
            onclick="updateStatus('${docSnap.id}', 'Rejected')"
            ${isFinal ? "disabled" : ""}>
            Reject
          </button>
        </td>
      </tr>
    `;

    table.innerHTML += row;
  });

  document.getElementById("totalRequests").innerText = total;
  document.getElementById("pendingRequests").innerText = pending;
  document.getElementById("approvedRequests").innerText = approved;
}

function getStatusColor(status) {
  if (status === "Approved") return "success";
  if (status === "Rejected") return "danger";
  if (status === "Checking") return "primary";
  if (status === "Waiting") return "info";
  return "warning"; // Pending
}

window.saveScheme = async function () {

  const schemeData = {
    name: document.getElementById("name").value,
    category: document.getElementById("category").value,
    state: document.getElementById("state").value,
    schemeType: document.getElementById("schemeType").value,
    ageMin: Number(document.getElementById("ageMin").value),
    ageMax: Number(document.getElementById("ageMax").value),
    incomeLimit: Number(document.getElementById("incomeLimit").value),
    gender: document.getElementById("gender").value,
    launchYear: Number(document.getElementById("launchYear").value),
    ministry: document.getElementById("ministry").value,
    applyLink: document.getElementById("applyLink").value,
    description: document.getElementById("description").value,
    benefits: document.getElementById("benefits").value,
    eligibility: document.getElementById("eligibility").value,
    documentsRequired: document.getElementById("documentsRequired").value
      .split(",")
      .map(doc => doc.trim()),
    isActive: document.getElementById("isActive").checked
  };

  if (editingSchemeId) {
    await updateDoc(doc(db, "schemes", editingSchemeId), schemeData);
    editingSchemeId = null;
  } else {
    await addDoc(collection(db, "schemes"), schemeData);
  }

  alert("Scheme Saved Successfully!");
  loadSchemes();
};


async function loadSchemes() {
  const snapshot = await getDocs(collection(db, "schemes"));
  const table = document.getElementById("schemesTable");
  table.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    table.innerHTML += `
      <tr>
        <td>${data.name}</td>
        <td>${data.state}</td>
        <td>${data.category}</td>
        <td>${data.isActive ? "Yes" : "No"}</td>
        <td>
          <button class="btn btn-warning btn-sm me-2"
            onclick="editScheme('${docSnap.id}')">
            Edit
          </button>
          <button class="btn btn-danger btn-sm"
            onclick="deleteScheme('${docSnap.id}')">
            Delete
          </button>
        </td>
      </tr>
    `;
  });
}


window.editScheme = async function (id) {

  const schemeRef = doc(db, "schemes", id);
  const schemeSnap = await getDoc(schemeRef);

  if (schemeSnap.exists()) {
    const data = schemeSnap.data();

    document.getElementById("name").value = data.name || "";
    document.getElementById("category").value = data.category || "";
    document.getElementById("state").value = data.state || "";
    document.getElementById("schemeType").value = data.schemeType || "";
    document.getElementById("ageMin").value = data.ageMin || "";
    document.getElementById("ageMax").value = data.ageMax || "";
    document.getElementById("incomeLimit").value = data.incomeLimit || "";
    document.getElementById("gender").value = data.gender || "";
    document.getElementById("launchYear").value = data.launchYear || "";
    document.getElementById("ministry").value = data.ministry || "";
    document.getElementById("applyLink").value = data.applyLink || "";
    document.getElementById("description").value = data.description || "";
    document.getElementById("benefits").value = data.benefits || "";
    document.getElementById("eligibility").value = data.eligibility || "";
    document.getElementById("documentsRequired").value =
      (data.documentsRequired || []).join(", ");

    document.getElementById("isActive").checked = data.isActive || false;

    editingSchemeId = id;

    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};



window.deleteScheme = async function (id) {
  if (confirm("Delete this scheme?")) {
    await deleteDoc(doc(db, "schemes", id));
    loadSchemes();
  }
};

loadDashboard();
loadSchemes();

