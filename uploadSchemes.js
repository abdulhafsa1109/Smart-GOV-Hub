const admin = require("firebase-admin");
const schemesFile = require("./schemes.json");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function uploadSchemes() {
  try {
    const schemes = schemesFile.schemes;

    for (const id in schemes) {
      await db.collection("schemes").doc(id).set(schemes[id]);
      console.log("Uploaded:", id);
    }

    console.log(" All schemes uploaded successfully!");
    process.exit(0);
  } catch (error) {
    console.error(" Error uploading schemes:", error);
    process.exit(1);
  }
}

uploadSchemes();
