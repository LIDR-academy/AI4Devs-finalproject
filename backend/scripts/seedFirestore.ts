/**
 * Seed script for local development.
 * Run: npm run seed
 * Requires FIREBASE_SERVICE_ACCOUNT and other env vars to be set.
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { db, auth } from '../src/config/firebaseAdmin';

async function seed() {
  console.log('Seeding Firestore...');

  const email = 'demo@lexio.app';
  const password = 'demo1234';

  // Create or get demo user
  let uid: string;
  try {
    const user = await auth.getUserByEmail(email);
    uid = user.uid;
    console.log(`User already exists: ${uid}`);
  } catch {
    const user = await auth.createUser({ email, password, displayName: 'Demo User' });
    uid = user.uid;
    console.log(`Created user: ${uid}`);
  }

  // Create user profile
  await db.collection('users').doc(uid).set(
    { email, uiLanguage: 'es', createdAt: new Date(), updatedAt: new Date() },
    { merge: true }
  );

  const now = new Date();
  const words = [
    { term: 'serendipity', def: 'Un descubrimiento afortunado e inesperado.', img: 'https://images.unsplash.com/photo-1461988320302-91bde64fc8e4' },
    { term: 'ephemeral', def: 'Que dura muy poco tiempo; pasajero.', img: 'https://images.unsplash.com/photo-1465101162946-4377e57745c3' },
    { term: 'ubiquitous', def: 'Que está o parece estar en todas partes al mismo tiempo.', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa' },
    { term: 'resilient', def: 'Capaz de recuperarse rápidamente de dificultades.', img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d' },
    { term: 'melancholy', def: 'Un sentimiento profundo e incierto de tristeza.', img: 'https://images.unsplash.com/photo-1501854140801-50d01698950b' },
    { term: 'tenacious', def: 'Que no se rinde fácilmente; perseverante.', img: 'https://images.unsplash.com/photo-1526779259212-939e64788e3c' },
  ];

  const cardIds: string[] = [];
  for (const w of words) {
    const ref = db.collection('wordCards').doc();
    await ref.set({
      userId: uid,
      term: w.term,
      normalizedTerm: w.term.toLowerCase(),
      definition: w.def,
      definitionLanguage: 'es',
      imageUrl: w.img,
      unsplashPhotoId: null,
      status: 'active',
      learnedAt: null,
      createdAt: now,
      updatedAt: now,
    });
    cardIds.push(ref.id);
    console.log(`  + ${w.term}`);
  }

  // Streak
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  await db.collection('streaks').doc(uid).set({
    userId: uid,
    currentStreak: 3,
    lastCompletedDate: yesterdayStr,
    longestStreak: 7,
    updatedAt: now,
  });
  console.log('Streak set: 3 days');

  console.log('\nSeed complete!');
  console.log(`  email: ${email}`);
  console.log(`  password: ${password}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
