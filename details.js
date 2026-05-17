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

async function loadDetails(){

  const snapshot = await getDocs(collection(db,"schemes"));

  snapshot.forEach(doc=>{

    const s = doc.data();

    if(s.name === schemeName){

      document.getElementById("schemeDetails").innerHTML = `
        <h3>${s.name}</h3>
        <p>${s.description}</p>

        <h5>Benefits</h5>
        <p>${s.benefits}</p>

        <h5>Documents Required</h5>
        <ul>${s.documentsRequired.map(d=>`<li>${d}</li>`).join("")}</ul>

        <a href="${s.applyLink}" target="_blank"
         class="btn btn-success">
         Apply on Official Website
        </a>
      `;
    }

  });
}

loadDetails();
