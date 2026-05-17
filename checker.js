import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { getApp }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

const db = getFirestore(getApp());

window.addEventListener("DOMContentLoaded", () => {

  document.getElementById("applyFilterBtn")
    .addEventListener("click", runFilter);

  document.getElementById("schemeResults")
    .addEventListener("click", function(e){

      if(e.target.classList.contains("eligibilityPageBtn")){

        const name = e.target.getAttribute("data-name");

        window.location.href =
          "eligibility.html?scheme=" + encodeURIComponent(name);
      }

  });

});

async function runFilter(){

  const gender = document.getElementById("genderFilter").value;
  const category = document.getElementById("categoryFilter").value;

  const snapshot = await getDocs(collection(db,"schemes"));

  let html = "<h4>Matching Schemes</h4>";

  snapshot.forEach(doc=>{

    const s = doc.data();

    if(
      s.category === category &&
      (gender === "All" || s.gender === gender || s.gender === "All")
    ){
      html += `
        <div class="card p-3 mb-2">
          <b>${s.name}</b><br>
          ${s.description}

          <button class="btn btn-warning btn-sm mt-2 eligibilityPageBtn"
            data-name="${s.name}">
            Check Eligibility
          </button>
        </div>
      `;
    }

  });

  document.getElementById("schemeResults").innerHTML = html;
}
