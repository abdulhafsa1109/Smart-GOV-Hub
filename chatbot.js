// chatbot.js

import {
  collection,
  getDocs,
  query,
  where,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// ⭐ WAIT FOR FIREBASE FROM script.js
let db;

function initDB(){
  if(window.db){
    db = window.db;
  }else{
    setTimeout(initDB,100);
  }
}
initDB();


// -------- AI INTENT FUNCTION --------
async function getAIIntent(userMessage) {

  if (userMessage.includes("study") || userMessage.includes("scholarship"))
    return "Education & Learning";

  if (userMessage.includes("medical") || userMessage.includes("hospital"))
    return "Health & Wellness";

  if (userMessage.includes("farmer") || userMessage.includes("crop"))
    return "Agriculture & Rural";

  if (userMessage.includes("job") || userMessage.includes("skill"))
    return "Skills & Employment";

  if (userMessage.includes("women") || userMessage.includes("girl"))
    return "Women Welfare";

  return null;
}


// -------- AI RESPONSE GENERATOR --------
async function generateAIReply(category, schemes) {

  if (!schemes.length) {
    return `I could not find schemes under ${category}.`;
  }

  let text = `You may explore these ${category} schemes: `;

  schemes.forEach(s => {
    text += `${s.name}, `;
  });

  text += "These may match your requirements.";

  return text;
}


// -------- TOGGLE CHAT --------
window.toggleChat = function () {
  const chat = document.getElementById("chatbot");
  if (!chat) return;

  chat.style.display =
    (chat.style.display === "flex") ? "none" : "flex";
};


// -------- SEND MESSAGE --------
window.sendMessage = async function () {

  if(!db){
    console.log("Firebase not ready yet...");
    return;
  }

  const input = document.getElementById("userInput");
  const chatBody = document.getElementById("chat-body");

  if (!input || !chatBody) return;

  const msg = input.value.trim().toLowerCase();
  if (msg === "") return;

  chatBody.innerHTML += `<p><b>You:</b> ${msg}</p>`;


  /* ================= FAQ PART ================= */
  if (msg.includes("eligibility")) {
    chatBody.innerHTML +=
      `<p><b>Bot:</b> Eligibility depends on age, income, category, and scheme-specific conditions.</p>`;
  }
  else if (msg.includes("apply")) {
    chatBody.innerHTML +=
      `<p><b>Bot:</b> You can apply through official government portals or nearby CSC centers.</p>`;
  }
  else if (msg.includes("documents")) {
    chatBody.innerHTML +=
      `<p><b>Bot:</b> Common documents include Aadhaar card, income certificate, and bank details.</p>`;
  }

  /* ================= DATABASE + AI PART ================= */
  else {

    let category = await getAIIntent(msg);

    if (!category) {

      if (msg.includes("women"))
        category = "Women Welfare";
      else if (msg.includes("agriculture") || msg.includes("farmer"))
        category = "Agriculture & Rural";
      else if (msg.includes("education") || msg.includes("student"))
        category = "Education & Learning";
      else if (msg.includes("health"))
        category = "Health & Wellness";
      else if (msg.includes("employment") || msg.includes("job"))
        category = "Skills & Employment";
    }

    if (!category) {
      chatBody.innerHTML +=
        `<p><b>Bot:</b> I assist only with government schemes. Try asking about education, health, agriculture, women welfare, or employment.</p>`;
    }
    else {

      try {

        const q = query(
          collection(db, "schemes"),
          where("category", "==", category)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          chatBody.innerHTML +=
            `<p><b>Bot:</b> No schemes found for ${category}.</p>`;
        }
        else {

          let schemesArray = [];

          snapshot.forEach(doc => {
            schemesArray.push(doc.data());
          });

          // FIXED ML TRACKING (NO NULL USERID)
         // WAIT UNTIL USER AUTH READY
          const saveSearch = () => {

            if(window.auth && window.auth.currentUser){

              addDoc(collection(db, "userSearches"), {
                userId: window.auth.currentUser.uid,
                category: category,
                time: Date.now()
              });

            } else {

              // try again after login loads
              setTimeout(saveSearch, 300);

            }
          };
          saveSearch();

          const aiText = await generateAIReply(category, schemesArray);

          chatBody.innerHTML += `<p><b>Bot:</b> ${aiText}</p>`;
        }

      } catch (e) {
        console.error(e);
        chatBody.innerHTML +=
          `<p><b>Bot:</b> Error fetching schemes.</p>`;
      }
    }
  }

  input.value = "";
  chatBody.scrollTop = chatBody.scrollHeight;
};


// -------- SCHEME FINDER --------
window.runSchemeFinder = async function(){

  if(!db) return;

  const state = document.getElementById("finderState").value;
  const age = parseInt(document.getElementById("finderAge").value);
  const category = document.getElementById("finderCategory").value;
  const income = parseInt(document.getElementById("finderIncome").value);

  const snapshot = await getDocs(collection(db,"schemes"));

  let html = "<h4>Matching Schemes</h4>";

  snapshot.forEach(doc=>{
    const s = doc.data();

    if(
      s.category === category &&
      age >= s.ageMin &&
      age <= s.ageMax &&
      income <= s.incomeLimit &&
      s.state === state
    ){
      html += `
        <div class="card p-3 mb-2">
          <b>${s.name}</b>
          <button onclick="openEligibility('${s.name}')"
          class="btn btn-sm btn-primary mt-2">
          Check Eligibility
          </button>
        </div>`;
    }
  });

  document.getElementById("schemeResults").innerHTML = html;
};