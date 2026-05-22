// chatbot.js
let chatHistory = [];
import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// ================= FIREBASE DB =================

let db;

function initDB() {

  if (window.db) {

    db = window.db;

  } else {

    setTimeout(initDB, 100);
  }
}

initDB();


// ================= OPENROUTER API =================

const API_KEY = "xxxxxx";


// ================= AI FUNCTION =================

async function generateAIReply(userMessage, schemes) {

  try {

    const prompt = `
You are SmartGov Hub AI Assistant.

Use ONLY the schemes below while answering.

User Question:
${userMessage}

Available Schemes:
${schemes.map(s => `
Scheme Name: ${s.name}
Description: ${s.description || ""}
Category: ${s.category || ""}
`).join("\n")}


Instructions:
- Act like an intelligent government scheme assistant
- Ask follow-up questions if user information is incomplete
- Ask for state when location-specific schemes may help
- Suggest 2-3 relevant schemes whenever available
- Mention why each scheme is relevant
- Keep responses conversational and professional
- Mention scheme names clearly
- Do not invent information
- Keep responses under 5 lines
- Avoid unnecessary explanation
- Be concise but helpful
`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Authorization":
            `Bearer ${API_KEY}`,

          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({

          model:
            "openai/gpt-3.5-turbo",

          messages: [

  {
    role: "system",
    content: `
You are SmartGov Hub AI Assistant.

Use ONLY the provided government schemes.

Be conversational and interactive.

Ask follow-up questions if required.

Suggest multiple schemes whenever possible.
`
  },

  ...chatHistory,

  {
    role: "user",
    content: prompt
  }
]
        })
      }
    );

    const data = await response.json();

    console.log(data);

    if (
      data.choices &&
      data.choices.length > 0
    ) {

      return data.choices[0]
        .message.content;
    }

    return "No AI response generated.";

  } catch (e) {

    console.error(e);

    return "AI service unavailable.";
  }
}


// ================= CHAT TOGGLE =================

window.toggleChat = function () {

  const chatbot =
    document.getElementById("chatbot");

  chatbot.style.display =
    chatbot.style.display === "flex"
      ? "none"
      : "flex";
};


// ================= SEND MESSAGE =================

window.sendMessage = async function () {

  if (!db) {

    console.log("Firebase not ready yet...");
    return;
  }

  const input =
    document.getElementById("userInput");

  const chatBody =
    document.getElementById("chat-body");

  const msg =
    input.value.trim();

  if (!msg) return;

  // ===== USER MESSAGE =====

  chatBody.innerHTML += `
    <p>
      <b>You:</b> ${msg}
    </p>
  `;
  chatHistory.push({
  role: "user",
  content: msg
});
  input.value = "";

  try {

    // ===== FETCH ALL SCHEMES =====

    const snapshot =
      await getDocs(
        collection(db, "schemes")
      );

    let schemes = [];

    snapshot.forEach(doc => {

      schemes.push(doc.data());
    });

    // ===== LOADING =====

    chatBody.innerHTML += `
      <p id="typing">
        <b>Bot:</b> Typing...
      </p>
    `;

    // ===== AI RESPONSE =====

    const aiReply =
      await generateAIReply(
        msg,
        schemes
      );
    chatHistory.push({
  role: "assistant",
  content: aiReply
});

    // ===== REMOVE LOADING =====

    const typing =
      document.getElementById("typing");

    if (typing) typing.remove();

    // ===== SHOW RESPONSE =====

    chatBody.innerHTML += `
      <p>
        <b>Bot:</b>
        ${aiReply}
      </p>
    `;

    chatBody.scrollTop =
      chatBody.scrollHeight;

  } catch (e) {

    console.error(e);

    chatBody.innerHTML += `
      <p>
        <b>Bot:</b>
        Error fetching schemes.
      </p>
    `;
  }
};


// ================= ENTER KEY SUPPORT =================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const input =
      document.getElementById("userInput");

    if (!input) return;

    input.addEventListener(
      "keypress",
      (e) => {

        if (e.key === "Enter") {

          sendMessage();
        }
      }
    );
  }
);

