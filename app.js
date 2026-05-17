
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// HTML Elements
const schemeResults = document.getElementById("schemeResults");
const searchBox = document.getElementById("searchBox");
const categoryFilter = document.getElementById("categoryFilter");
const genderFilter = document.getElementById("genderFilter");

let schemes = [];

// Load all schemes from Firestore
async function loadSchemes() {
  try {
    const snapshot = await getDocs(collection(db, "schemes"));
    schemes = snapshot.docs.map(doc => doc.data());

    // Get search query from URL
    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get("search") || "";
    searchBox.value = searchQuery;

    renderSchemes(); // Show schemes on page load
  } catch (err) {
    console.error("Error loading schemes:", err);
    schemeResults.innerHTML = "<p class='text-danger'>Failed to load schemes. Check console.</p>";
  }
}

// Render schemes with search + filters
function renderSchemes() {
  const searchText = searchBox.value.trim().toLowerCase();
  const categoryValue = categoryFilter.value;
  const genderValue = genderFilter.value;

  const filtered = schemes.filter(scheme => {
    const matchesSearch = !searchText || (scheme.name && scheme.name.toLowerCase().includes(searchText));
    const matchesCategory = !categoryValue || scheme.category === categoryValue;
    const matchesGender =
      !genderValue || scheme.gender === genderValue || scheme.gender.toLowerCase() === "all";

    return matchesSearch && matchesCategory && matchesGender;
  });

  if (filtered.length === 0) {
    schemeResults.innerHTML = "<p class='text-center'>No schemes found.</p>";
    return;
  }

  schemeResults.innerHTML = filtered
    .map(
      s => `
    <div class="col-md-4 mb-3">
      <div class="card p-3 h-100">
        <h5>${s.name}</h5>
        <p>${s.description || "No description available."}</p>
        <a href="${s.applyLink || "#"}" target="_blank" class="btn btn-warning btn-sm">
          Apply Now
        </a>
      </div>
    </div>
  `
    )
    .join("");
}

// Event listeners for live filters
if (searchBox && categoryFilter && genderFilter) {
  searchBox.addEventListener("input", renderSchemes);
  categoryFilter.addEventListener("change", renderSchemes);
  genderFilter.addEventListener("change", renderSchemes);

  loadSchemes(); // Initial load
}
