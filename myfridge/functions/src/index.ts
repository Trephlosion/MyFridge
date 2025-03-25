/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */



// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';

admin.initializeApp();

// Allow all origins (or restrict to your domain if needed)
const corsHandler = cors({ origin: true });

export const toggleUserActivation = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        // Optionally, restrict methods (e.g., allow only POST)
        if (req.method !== 'POST') {
            res.status(405).send('Method Not Allowed');
            return;
        }

        const { uid } = req.body;
        try {
            const userRecord = await admin.auth().getUser(uid);
            const currentDisabled = userRecord.disabled;
            const newDisabled = !currentDisabled;
            await admin.auth().updateUser(uid, { disabled: newDisabled });
            res.status(200).json({ disabled: newDisabled });
        } catch (error) {
            console.error("Error toggling user activation:", error);
            res.status(500).send("Internal Server Error");
        }
    });
});
