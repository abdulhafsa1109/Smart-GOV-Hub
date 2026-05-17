// ===== FIREBASE SETUP =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

let currentUser = null;
let shownSchemes = [];
let activePopups = [];
let recommendedNames = [];


// ===== AUTH =====
onAuthStateChanged(auth, async (user) => {
  currentUser = user;

  const loginBtn = document.querySelector(".btn-warning");

  if (user) {
    if (loginBtn) {
      loginBtn.innerText = "Logout";
      loginBtn.onclick = () => signOut(auth).then(() => location.reload());
    }

    await showRecommendations();

    setInterval(() => {
      showPopupRecommendation();
    }, 10000);
  }
});


// ===== USER HISTORY =====
async function getUserSearches() {
  if (!currentUser) return [];

  const snapshot = await getDocs(collection(db, "userSearches"));

  let searches = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.userId === currentUser.uid) {
      searches.push(data.category);
    }
  });

  return searches;
}


// =====RECOMMENDATION SYSTEM  =====
async function showRecommendations(currentCategory = null) {

  const recContainer = document.getElementById("recommendationsContainer");
  if (!recContainer) return;

  recContainer.innerHTML = "<p class='text-center'>Loading...</p>";

  const snapshot = await getDocs(collection(db, "schemes"));

  let allSchemes = [];
  snapshot.forEach(doc => allSchemes.push(doc.data()));

  const userHistory = await getUserSearches();

  let recommendations = [];

  // current
  if (currentCategory) {
    const currentSchemes = allSchemes.filter(s => s.category === currentCategory);

    for (let i = 0; i < currentSchemes.length && recommendations.length < 3; i++) {
      recommendations.push(currentSchemes[i]);
    }
  }

  //HISTORY (remaining)
  let freq = {};
  userHistory.forEach(cat => {
    freq[cat] = (freq[cat] || 0) + 1;
  });

  let sortedCategories = Object.keys(freq).sort((a, b) => freq[b] - freq[a]);

  for (let cat of sortedCategories) {
    const schemes = allSchemes.filter(s => s.category === cat);

    for (let s of schemes) {
      if (recommendations.length >= 6) break;

      if (!recommendations.some(r => r.name === s.name)) {
        recommendations.push(s);
      }
    }

    if (recommendations.length >= 6) break;
  }

  recContainer.innerHTML = "";
  recommendedNames = [];

  recommendations.forEach(scheme => {

    recommendedNames.push(scheme.name);

    const card = document.createElement("div");
    card.className = "col-md-4";

    card.innerHTML = `
      <div class="scheme-card p-4 shadow rounded text-center bg-white h-100">
        <h5>${scheme.name}</h5>
        <p>${scheme.description || "No description available."}</p>

        <a href="${scheme.applyLink || "#"}" class="btn btn-warning btn-sm mt-2">
          Apply Now
        </a>

        <button class="btn btn-success btn-sm mt-2"
          onclick="saveItem('${scheme.name}','${scheme.description}','${scheme.applyLink}')">
          Save
        </button>
      </div>
    `;

    recContainer.appendChild(card);
  });
}


// ===== SEARCH =====
const searchForm = document.getElementById("searchForm");

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const queryText = document.getElementById("searchInput").value.trim().toLowerCase();
  const container = document.getElementById("searchResultsContainer");

  container.innerHTML = "";

  document.getElementById("searchResultsSection")
    .scrollIntoView({ behavior: "smooth" });

  if (!queryText) {
    container.innerHTML = "<p class='text-center'>Enter a search term</p>";
    return;
  }

  const snapshot = await getDocs(collection(db, "schemes"));

  let found = false;
  let currentCategory = null;

  snapshot.forEach(doc => {
    const scheme = doc.data();

    if (scheme.name && scheme.name.toLowerCase().includes(queryText)) {

      // store user history
      if (currentUser) {
        addDoc(collection(db, "userSearches"), {
          userId: currentUser.uid,
          category: scheme.category,
          timestamp: Date.now()
        });
      }

      currentCategory = scheme.category;

      found = true;

      const cardDiv = document.createElement("div");
      cardDiv.className = "col-md-4";

      cardDiv.innerHTML = `
        <div class="scheme-card p-4 shadow rounded text-center bg-white h-100">
          <h5>${scheme.name}</h5>
          <p>${scheme.description || "No description available."}</p>

          <a href="${scheme.applyLink || "#"}" class="btn btn-warning btn-sm mt-2">
            Apply Now
          </a>

          <button class="btn btn-success btn-sm mt-2"
            onclick="saveItem('${scheme.name}','${scheme.description}','${scheme.applyLink}')">
            Save
          </button>
        </div>
      `;

      container.appendChild(cardDiv);
    }
  });

  if (!found) {
    container.innerHTML = "<p class='text-center'>No schemes found</p>";
  }

  // 🔥 update recommendations
  await showRecommendations(currentCategory);
});


// ===== CATEGORY CLICK =====
const categoryCards = document.querySelectorAll(".category-card");

categoryCards.forEach(card => {
  card.addEventListener("click", async () => {

    const category = card.getAttribute("data-category");
    const container = document.getElementById("searchResultsContainer");

    container.innerHTML = "";

    document.getElementById("searchResultsSection")
      .scrollIntoView({ behavior: "smooth" });

    const snapshot = await getDocs(collection(db, "schemes"));

    let found = false;

    snapshot.forEach(doc => {
      const scheme = doc.data();

      if (scheme.category === category) {

        found = true;

        const cardDiv = document.createElement("div");
        cardDiv.className = "col-md-4";

        cardDiv.innerHTML = `
          <div class="scheme-card p-4 shadow rounded text-center bg-white h-100">
            <h5>${scheme.name}</h5>
            <p>${scheme.description || "No description available."}</p>

            <a href="${scheme.applyLink || "#"}" class="btn btn-warning btn-sm mt-2">
              Apply Now
            </a>

            <button class="btn btn-success btn-sm mt-2"
              onclick="saveItem('${scheme.name}','${scheme.description}','${scheme.applyLink}')">
              Save
            </button>
          </div>
        `;

        container.appendChild(cardDiv);
      }
    });

    if (!found) {
      container.innerHTML = "<p class='text-center'>No schemes found</p>";
    }

    await showRecommendations(category);
  });
});


// ===== POPUP =====
function createPopup(scheme) {
  const container = document.getElementById("popupContainer");
  if (!container) return;

  if (activePopups.length >= 3) {
    const oldest = activePopups.shift();
    oldest.remove();
  }

  const popup = document.createElement("div");
  popup.className = "popup";

  popup.innerHTML = `
    <button class="popup-close">×</button>
    <strong>Notifications</strong><br>
    ${scheme.name}
  `;

  popup.addEventListener("click", () => {
    window.open(scheme.applyLink || "#", "_blank");
  });

  popup.querySelector(".popup-close").addEventListener("click", (e) => {
    e.stopPropagation();
    popup.remove();
    activePopups = activePopups.filter(p => p !== popup);
  });

  container.appendChild(popup);
  activePopups.push(popup);

  setTimeout(() => {
    popup.remove();
    activePopups = activePopups.filter(p => p !== popup);
  }, 5000);
}

// ===== POPUP LOGIC =====
async function showPopupRecommendation() {

  if (!currentUser) return;

  const userHistory = await getUserSearches();
  if (userHistory.length === 0) return;

  const snapshot = await getDocs(collection(db, "schemes"));

  let allSchemes = [];
  snapshot.forEach(doc => allSchemes.push(doc.data()));

  const matches = allSchemes.filter(s =>
    userHistory.includes(s.category) &&
    !shownSchemes.includes(s.name) &&
    !recommendedNames.includes(s.name)
  );

  if (matches.length === 0) return;

  const randomScheme = matches[Math.floor(Math.random() * matches.length)];

  shownSchemes.push(randomScheme.name);

  createPopup(randomScheme);
}


// ===== SAVE SYSTEM =====
window.saveItem = async function(name, description, link) {
  if (!currentUser) {
    alert("Please login first!");
    return;
  }

  try {
    await addDoc(collection(db, "savedSchemes"), {
      userId: currentUser.uid,
      name,
      description,
      applyLink: link,
      timestamp: Date.now()
    });

    showSavedPopup("Saved successfully!");
  } catch (error) {
    console.error(error);
    alert("Error saving!");
  }
};

// ===== SIMPLE POPUP =====
function showSavedPopup(message) {
  const container = document.getElementById("popupContainer");

  const popup = document.createElement("div");
  popup.className = "popup";
  popup.innerHTML = `
    ${message}
    <button class="popup-close">×</button>
  `;

  popup.querySelector(".popup-close").onclick = () => popup.remove();

  container.appendChild(popup);

  setTimeout(() => popup.remove(), 3000);
}