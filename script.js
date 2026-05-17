// ===== FIREBASE SETUP =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { predictPreferredCategory } from "./mlModel.js";

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

window.auth = auth;
window.db = db;


// ===== AUTH =====
onAuthStateChanged(auth, (user) => {
  const loginBtn = document.querySelector(".btn-warning");
  if (user) {
    if (loginBtn) {
      loginBtn.innerText = "Logout";
      loginBtn.onclick = () => signOut(auth).then(() => location.reload());
    }
  }
});


// ===== RECOMMENDATION FUNCTION =====
/*
function getRecommendations(baseScheme, allSchemes) {
  return allSchemes
    .map(s => {
      let score = 0;

      // 🔥 STRONG MATCH
      if (s.category === baseScheme.category) score += 5;

      // 🔥 TEXT MATCH
      if (s.description && baseScheme.description &&
          s.description.toLowerCase().includes(baseScheme.category.toLowerCase()))
        score += 2;

      if (s.eligibility && baseScheme.eligibility &&
          s.eligibility.toLowerCase().includes(baseScheme.eligibility.toLowerCase()))
        score += 2;

      return { scheme: s, score };
    })
    .filter(x => x.score > 0)   // REMOVE IRRELEVANT
    .sort((a, b) => b.score - a.score)
    .slice(1, 5) // skip base
    .map(x => x.scheme);
}

function getRecommendations(baseScheme, allSchemes) {

  let recommendations = allSchemes
    .map(s => {
      let score = 0;

      // Strong category match
      if (s.category && baseScheme.category &&
          s.category.toLowerCase() === baseScheme.category.toLowerCase()) {
        score += 5;
      }

      // Description keyword match
      if (s.description && baseScheme.description &&
          s.description.toLowerCase().includes(baseScheme.category?.toLowerCase())) {
        score += 2;
      }

      return { scheme: s, score };
    })
    .sort((a, b) => b.score - a.score);

  // 🔥 IMPORTANT FIX: if nothing matched, fallback
  let result = recommendations
    .filter(x => x.scheme.name !== baseScheme.name)
    .slice(0, 3)
    .map(x => x.scheme);

  return result;
}
function getRecommendations(baseScheme, allSchemes) {

  const baseText = (
    (baseScheme.name || "") + " " +
    (baseScheme.description || "")
  ).toLowerCase();

  return allSchemes
    .map(s => {

      if (s.name === baseScheme.name) return null;

      let score = 0;

      // ✅ STRONG CATEGORY MATCH
      if (s.category && baseScheme.category &&
          s.category.toLowerCase() === baseScheme.category.toLowerCase()) {
        score += 5;
      }

      // ✅ KEYWORD MATCH (IMPORTANT)
      const sText = (
        (s.name || "") + " " +
        (s.description || "")
      ).toLowerCase();

      baseText.split(" ").forEach(word => {
        if (word.length > 4 && sText.includes(word)) {
          score += 1;
        }
      });

      return { scheme: s, score };
    })
    .filter(x => x && x.score > 0) // remove irrelevant
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(x => x.scheme);
}*/
function getRecommendations(baseScheme, allSchemes) {

  // STEP 1: FILTER SAME CATEGORY ONLY
  let sameCategory = allSchemes.filter(s =>
    s.category &&
    baseScheme.category &&
    s.category.toLowerCase() === baseScheme.category.toLowerCase() &&
    s.name !== baseScheme.name
  );

  // STEP 2: IF NO MATCH → FALLBACK (important for demo)
  if (sameCategory.length === 0) {
    return allSchemes
      .filter(s => s.name !== baseScheme.name)
      .slice(0, 3);
  }

  // STEP 3: OPTIONAL SORT (by keyword similarity)
  const baseText = (baseScheme.name + " " + baseScheme.description).toLowerCase();

  sameCategory.sort((a, b) => {
    const aScore = (a.name + a.description).toLowerCase().includes(baseText) ? 1 : 0;
    const bScore = (b.name + b.description).toLowerCase().includes(baseText) ? 1 : 0;
    return bScore - aScore;
  });

  return sameCategory.slice(0, 3);
}
// ===== SEARCH FUNCTION =====
const searchForm = document.getElementById("searchForm");

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  const container = document.getElementById("searchResultsContainer");

  container.innerHTML = "";

  document.getElementById("searchResultsSection")
    .scrollIntoView({ behavior: "smooth" });

  if (!query) {
    container.innerHTML =
      "<p class='text-center'>Please enter a scheme name to search.</p>";
    return;
  }

  try {
    const snapshot = await getDocs(collection(db, "schemes"));

    let allSchemes = [];
    snapshot.forEach(doc => {
      allSchemes.push(doc.data());
    });

    let found = false;
    let baseScheme = null;

    // ===== SHOW SEARCH RESULTS =====
    allSchemes.forEach(scheme => {

      if (scheme.name && scheme.name.toLowerCase().includes(query)) {

        if (!baseScheme) baseScheme = scheme;

        found = true;

        const card = document.createElement("div");
        card.className = "col-md-4";

        card.innerHTML = `
          <div class="scheme-card p-4 shadow rounded text-center bg-white h-100">
            <h5 class="mb-2">${scheme.name}</h5>
            <p>${scheme.description || "No description available."}</p>
            <a href="${scheme.applyLink || "#"}" class="btn btn-warning btn-sm mt-2">Apply Now</a>
          </div>
        `;

        container.appendChild(card);
      }
    });

    if (!found) {
      container.innerHTML =
        "<p class='text-center'>No schemes matched your search.</p>";
      return;
    }

    // ===== RECOMMENDATIONS =====
    const recContainer = document.getElementById("recommendationsContainer");

    if (!recContainer) return;

    recContainer.innerHTML = "";

    if (baseScheme) {
      const recommendations = getRecommendations(baseScheme, allSchemes);

      recommendations.forEach(scheme => {

        const card = document.createElement("div");
        card.className = "col-md-4";

        card.innerHTML = `
          <div class="scheme-card p-4 shadow rounded text-center bg-light h-100">
            <h5>${scheme.name}</h5>
            <p>${scheme.description || "No description available."}</p>
            <a href="${scheme.applyLink || "#"}" class="btn btn-warning btn-sm mt-2">Apply Now</a>
          </div>
        `;

        recContainer.appendChild(card);
      });
    }

  } catch (error) {
    console.error(error);
  }
});


// ===== CATEGORY CLICK (UNCHANGED) =====
const categoryCards = document.querySelectorAll(".category-card");

categoryCards.forEach(card => {
  card.addEventListener("click", async () => {

    const category = card.getAttribute("data-category");
    const container = document.getElementById("searchResultsContainer");

    container.innerHTML = "";

    const snapshot = await getDocs(collection(db,"schemes"));

    const searches = await getUserSearches();
    const predictedCategory = await predictPreferredCategory(searches);

    let schemesArray = [];

    snapshot.forEach(doc=>{
      schemesArray.push(doc.data());
    });

    if(predictedCategory){
      schemesArray.sort((a,b)=>{
        if(a.category === predictedCategory) return -1;
        if(b.category === predictedCategory) return 1;
        return 0;
      });
    }

    let found=false;

    schemesArray.forEach(scheme=>{
      if(scheme.category === category){

        found=true;

        const cardDiv=document.createElement("div");
        cardDiv.className="col-md-4";

        cardDiv.innerHTML=`
          <div class="scheme-card p-4 shadow rounded text-center bg-white h-100">
            <h5>${scheme.name}</h5>
            <p>${scheme.description || "No description available."}</p>
            <a href="${scheme.applyLink || "#"}" class="btn btn-warning btn-sm mt-2">Apply Now</a>
          </div>
        `;

        container.appendChild(cardDiv);
      }
    });

    if(!found){
      container.innerHTML="<p class='text-center'>No schemes found for this category.</p>";
    }

    document.getElementById("searchResultsSection")
      .scrollIntoView({ behavior: "smooth" });

  });
});