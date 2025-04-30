// normalizeWorkshopQAAndReviews.js

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // adjust path as needed

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const { Timestamp } = admin.firestore;

/**
 * Safely convert a user identifier into a DocumentReference<User>, or return null.
 */
function toUserRef(u) {
  if (typeof u === 'string' && u.trim()) {
    return db.collection('Users').doc(u.trim());
  }
  if (u instanceof admin.firestore.DocumentReference) {
    return u;
  }
  return null;
}

/**
 * Safely convert a workshop identifier into a DocumentReference<Workshops>, or return null.
 */
function toWorkshopRef(w) {
  if (typeof w === 'string' && w.trim()) {
    return db.collection('Workshops').doc(w.trim());
  }
  if (w instanceof admin.firestore.DocumentReference) {
    return w;
  }
  return null;
}

async function normalizeWorkshopQuestions() {
  const qsSnap = await db.collection('workshopQuestions').get();
  for (const qDoc of qsSnap.docs) {
    const data = qDoc.data();
    const qRef = qDoc.ref;

    // Convert createdAt
    let createdAt = Timestamp.now();
    if (data.createdAt instanceof Timestamp) {
      createdAt = data.createdAt;
    } else if (data.createdAt) {
      createdAt = Timestamp.fromDate(new Date(data.createdAt));
    }

    // Question text
    const question = typeof data.question === 'string' ? data.question : '';

    // References
    const userRef     = toUserRef(data.userId);
    const workshopRef = toWorkshopRef(data.workshopId);

    // If essential refs missing, delete doc
    if (!userRef || !workshopRef) {
      console.warn(`Deleting workshopQuestion ${qDoc.id}: invalid userId or workshopId`);
      await qRef.delete();
      continue;
    }

    // Normalize subcollection "Replys"
    const repliesCol = qRef.collection('Replys');
    const replSnap   = await repliesCol.get();
    for (const rDoc of replSnap.docs) {
      const rd   = rDoc.data();
      const rref = rDoc.ref;

      // repliedAt
      let repliedAt = Timestamp.now();
      if (rd.repliedAt instanceof Timestamp) {
        repliedAt = rd.repliedAt;
      } else if (rd.repliedAt) {
        repliedAt = Timestamp.fromDate(new Date(rd.repliedAt));
      }

      // repliedBy
      const repliedBy = toUserRef(rd.repliedBy);
      // replyText
      const replyText = typeof rd.replyText === 'string' ? rd.replyText : '';

      if (!repliedBy) {
        console.warn(`Deleting reply ${rDoc.id} under question ${qDoc.id}: invalid repliedBy`);
        await rref.delete();
        continue;
      }

      // Overwrite reply doc
      await rref.set(
        { repliedAt, repliedBy, replyText },
        { merge: false }
      );
    }

    // Overwrite question doc
    await qRef.set(
      { createdAt, question, userId: userRef, workshopId: workshopRef },
      { merge: false }
    );
    console.log(`Normalized workshopQuestion ${qDoc.id}`);
  }
}

async function normalizeWorkshopReviews() {
  const revSnap = await db.collection('workshopReviews').get();
  for (const rDoc of revSnap.docs) {
    const d = rDoc.data();
    const ref = rDoc.ref;

    // createdAt
    let createdAt = Timestamp.now();
    if (d.createdAt instanceof Timestamp) {
      createdAt = d.createdAt;
    } else if (d.createdAt) {
      createdAt = Timestamp.fromDate(new Date(d.createdAt));
    }

    // comment
    const comment = typeof d.comment === 'string' ? d.comment : '';

    // stars
    const stars = typeof d.stars === 'number' ? d.stars : Number(d.stars) || 0;

    // refs
    const userRef     = toUserRef(d.userId);
    const workshopRef = toWorkshopRef(d.workshopId);

    if (!userRef || !workshopRef) {
      console.warn(`Deleting workshopReview ${rDoc.id}: invalid userId or workshopId`);
      await ref.delete();
      continue;
    }

    // Overwrite review doc
    await ref.set(
      { comment, createdAt, stars, userId: userRef, workshopId: workshopRef },
      { merge: false }
    );
    console.log(`Normalized workshopReview ${rDoc.id}`);
  }
}

async function main() {
  await normalizeWorkshopQuestions();
  await normalizeWorkshopReviews();
  console.log('✅ workshopQuestions and workshopReviews normalization complete');
}

main().catch(err => {
  console.error('❌ Migration error:', err);
  process.exit(1);
});
