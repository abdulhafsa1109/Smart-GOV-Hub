import { getFirestore, collection, addDoc, serverTimestamp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { getAuth }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

export async function trackActivity(category){

  const user = auth.currentUser;

  // only save if logged in
  if(!user) return;

  try{

    await addDoc(collection(db,"userActivities"),{
      userId: user.uid,
      category: category,
      action: "search",
      timestamp: serverTimestamp()
    });

    console.log("Activity Saved:", category);

  }catch(e){
    console.error(e);
  }
}