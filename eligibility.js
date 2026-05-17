import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { getApp }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

const db = getFirestore(getApp());

const params = new URLSearchParams(window.location.search);
const schemeName = params.get("scheme");

let selectedScheme = null;

async function loadScheme(){

  const snapshot = await getDocs(collection(db,"schemes"));

  snapshot.forEach(doc=>{
    const s = doc.data();

    if(s.name === schemeName){
      selectedScheme = s;
      document.getElementById("schemeTitle").innerHTML =
        `<h4>${s.name}</h4>`;
    }
  });
}

loadScheme();

document.getElementById("checkBtn").addEventListener("click",()=>{

  const age = parseInt(document.getElementById("userAge").value);
  const income = parseInt(document.getElementById("userIncome").value);
  const state = document.getElementById("userState").value;

  let errors = [];

  if(age < selectedScheme.ageMin || age > selectedScheme.ageMax){
    errors.push("Age criteria failed");
  }

  if(income > selectedScheme.incomeLimit){
    errors.push("Income limit exceeded");
  }

  if(state !== selectedScheme.state){
    errors.push("State mismatch");
  }

  let resultHTML;

  if(errors.length === 0){

    resultHTML = `
      <p class="text-success">Eligible</p>
      <button id="viewBtn" class="btn btn-primary">
        View Scheme Details
      </button>
    `;

    document.getElementById("resultBox").innerHTML = resultHTML;

    document.getElementById("viewBtn").addEventListener("click",()=>{
      window.location.href =
        "details.html?scheme=" + encodeURIComponent(selectedScheme.name);
    });

  }else{

    resultHTML =
      `<p class="text-danger">Not Eligible:</p><ul>`+
      errors.map(e=>`<li>${e}</li>`).join("")+
      `</ul>`;

    document.getElementById("resultBox").innerHTML = resultHTML;
  }

});
