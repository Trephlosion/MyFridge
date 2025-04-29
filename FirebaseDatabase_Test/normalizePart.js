// Add challenges array to Users Collection that has the challenges the user has created as Document References
//Fix challenges Document structure to be like this now:
/*
{
  title: string,
  description: string,
  creator: DocumentReference<User>,
  participants: DocumentReference<User>[],
  submissions: DocumentReference<Recipe>[], // 🆕
  winner: DocumentReference<Recipe> | null, // 🆕
  deadline: Timestamp,                      // 🆕
  createdAt: Timestamp
}
*/


// Normalize Workshop Document structure to be like this now:
/*
{
createdAt: Timestamp
date: Timestamp
description: string
location: string
maxParticipants: number
participants: DocumentReference<User>[]
media_url: string
title: string
userId: DocumentReference<User>
}
*/
// Update the Users Collection's workshops array to contain workshop Document References of workshops the user has created

// normalizeChallengesAndWorkshops.js

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // ← your service account

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const { Timestamp } = admin.firestore;

async function normalizeChallengesAndWorkshops() {
  // —————————————————————————
  // 1) Normalize Challenges + build per-user map
  // —————————————————————————
  const userChallengesMap = {};  // { userId: [ChallengeRef,…] }

  const challengesSnap = await db.collection('Challenges').get();
  for (const doc of challengesSnap.docs) {
    const data = doc.data();
    const ref = doc.ref;

    // Title & description
    const title       = data.title       || '';
    const description = data.description || '';

    // creator → DocumentReference<User>
    let creatorRef;
    if (typeof data.creator === 'string') {
      creatorRef = db.collection('Users').doc(data.creator);
    } else {
      creatorRef = data.creator;
    }

    // participants → DocumentReference<User>[]
    const participants = (data.participants || []).map(u =>
      typeof u === 'string'
        ? db.collection('Users').doc(u)
        : u
    );

    // submissions → DocumentReference<Recipe>[]
    const submissions = (data.submissions || []).map(r =>
      typeof r === 'string'
        ? db.collection('Recipes').doc(r)
        : r
    );

    // winner → DocumentReference<Recipe> | null
    let winner = null;
    if (data.winner) {
      winner = typeof data.winner === 'string'
        ? db.collection('Recipes').doc(data.winner)
        : data.winner;
    }

    // deadline → Timestamp
    let deadline = Timestamp.now();
    if (data.deadline instanceof Timestamp) {
      deadline = data.deadline;
    } else if (data.deadline) {
      deadline = Timestamp.fromDate(new Date(data.deadline));
    }

    // createdAt → Timestamp
    let createdAt = Timestamp.now();
    if (data.createdAt instanceof Timestamp) {
      createdAt = data.createdAt;
    } else if (data.createdAt) {
      createdAt = Timestamp.fromDate(new Date(data.createdAt));
    }

    // Build normalized doc
    const normalizedChallenge = {
      title,
      description,
      creator:      creatorRef,
      participants,          // DocumentReference<User>[]
      submissions,           // DocumentReference<Recipe>[]
      winner,                // DocumentReference<Recipe> | null
      deadline,              // Timestamp
      createdAt              // Timestamp
    };

    // Overwrite the challenge doc
    await ref.set(normalizedChallenge, { merge: false });
    console.log(`✔️  Challenge ${doc.id} normalized`);

    // Collect under the creator
    const uid = creatorRef.id;
    userChallengesMap[uid] = userChallengesMap[uid] || [];
    userChallengesMap[uid].push(ref);
  }

  // —————————————————————————
  // 2) Write `challenges` array into each User
  // —————————————————————————
  const usersSnap = await db.collection('Users').get();
  for (const userDoc of usersSnap.docs) {
    const refs = userChallengesMap[userDoc.id] || [];
    await userDoc.ref.update({ challenges: refs });
    console.log(`🔗  User ${userDoc.id} ➔ ${refs.length} challenges`);
  }

  // —————————————————————————
  // 3) Normalize Workshops + build per-user map
  // —————————————————————————
  const userWorkshopsMap = {};  // { userId: [WorkshopRef,…] }

  const workshopsSnap = await db.collection('Workshops').get();
  for (const doc of workshopsSnap.docs) {
    const data = doc.data();
    const ref  = doc.ref;

    // createdAt → Timestamp
    let createdAt = Timestamp.now();
    if (data.createdAt instanceof Timestamp) {
      createdAt = data.createdAt;
    } else if (data.createdAt) {
      createdAt = Timestamp.fromDate(new Date(data.createdAt));
    }

    // date → Timestamp
    let date = Timestamp.now();
    if (data.date instanceof Timestamp) {
      date = data.date;
    } else if (data.date) {
      date = Timestamp.fromDate(new Date(data.date));
    }

    const description     = data.description      || '';
    const location        = data.location         || '';
    const maxParticipants = typeof data.maxParticipants === 'number'
                              ? data.maxParticipants
                              : data.max_participants || 0;

    // participants → DocumentReference<User>[]
    const participants = (data.participants || []).map(u =>
      typeof u === 'string'
        ? db.collection('Users').doc(u)
        : u
    );

    // media_url
    const media_url = data.media_url || data.mediaUrl || '';

    // userId → DocumentReference<User>
    let userIdRef;
    if (data.userId) {
      userIdRef = typeof data.userId === 'string'
        ? db.collection('Users').doc(data.userId)
        : data.userId;
    } else if (data.user_id) {
      userIdRef = typeof data.user_id === 'string'
        ? db.collection('Users').doc(data.user_id)
        : data.user_id;
    }

    if (!userIdRef) {
      console.warn(`⚠️  Workshop ${doc.id} missing userId; skipping`);
      continue;
    }

    // Build normalized doc
    const normalizedWorkshop = {
      createdAt,
      date,
      description,
      location,
      maxParticipants,
      participants,   // DocumentReference<User>[]
      media_url,
      title:    data.title || '',
      userId:   userIdRef
    };

    // Overwrite the workshop doc
    await ref.set(normalizedWorkshop, { merge: false });
    console.log(`✔️  Workshop ${doc.id} normalized`);

    // Collect under the creator
    const uid = userIdRef.id;
    userWorkshopsMap[uid] = userWorkshopsMap[uid] || [];
    userWorkshopsMap[uid].push(ref);
  }

  // —————————————————————————
  // 4) Write `workshops` array into each User
  // —————————————————————————
  for (const userDoc of usersSnap.docs) {
    const refs = userWorkshopsMap[userDoc.id] || [];
    await userDoc.ref.update({ workshops: refs });
    console.log(`🔗  User ${userDoc.id} ➔ ${refs.length} workshops`);
  }

  console.log('🎉  All Done: Challenges & Workshops normalized');
}

normalizeChallengesAndWorkshops()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });

  
