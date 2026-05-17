// clickTracker.js

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function trackClick(category){

  const user = window.auth.currentUser;
  if(!user) return;

  try{

    await addDoc(collection(window.db,"userClicks"),{
      userId:user.uid,
      category:category,
      time:serverTimestamp()
    });

    console.log("Tracked Click:",category);

  }catch(e){
    console.error(e);
  }
}