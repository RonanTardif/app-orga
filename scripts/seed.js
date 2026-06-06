#!/usr/bin/env node
/**
 * Script de seeding Firestore — macro-tâches mariage
 * Usage : node scripts/seed.js
 *
 * Prérequis :
 *   - Fichier .env.local avec VITE_FIREBASE_PROJECT_ID
 *   - Fichier serviceAccount.json (clé Admin) dans le dossier scripts/ (non commité)
 *     OU variable GOOGLE_APPLICATION_CREDENTIALS pointant vers la clé
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

// Charger .env.local
const dotenvPath = resolve(__dirname, '../.env.local')
if (existsSync(dotenvPath)) {
  const { config } = await import('dotenv')
  config({ path: dotenvPath })
}

// Initialiser firebase-admin
const { default: admin } = await import('firebase-admin')

const serviceAccountPath = resolve(__dirname, 'serviceAccount.json')
let credential

if (existsSync(serviceAccountPath)) {
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'))
  credential = admin.credential.cert(serviceAccount)
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  credential = admin.credential.applicationDefault()
} else {
  console.error('❌ Aucune clé service account trouvée.')
  console.error('   → Placer scripts/serviceAccount.json (téléchargeable depuis Firebase Console)')
  console.error('   → Ou définir GOOGLE_APPLICATION_CREDENTIALS dans .env.local')
  process.exit(1)
}

admin.initializeApp({
  credential,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
})

const db = admin.firestore()

// Lire le fichier de données
const tasksPath = resolve(__dirname, '../../{output_folder}/planning-artifacts/tasks-structured.json')
const data = JSON.parse(readFileSync(tasksPath, 'utf8'))

// Filtrer vendredi + samedi uniquement
const jours = data.jours.filter((j) => j.id === 'vendredi' || j.id === 'samedi')

const taches = []
for (const jour of jours) {
  for (const tache of jour.macro_taches) {
    taches.push({
      id: tache.id,
      titre: tache.titre,
      heure_debut: tache.heure_debut ?? null,
      heure_fin: tache.heure_fin ?? null,
      zone: tache.zone ?? null,
      assignes: Array.isArray(tache.assignes) ? tache.assignes : [],
      statut: 'À faire',
      note: tache.note ?? null,
      jour: jour.id,
      parente: null,
    })
  }
}

console.log(`📋 ${taches.length} macro-tâches à seeder (vendredi + samedi)...`)

// Upsert idempotent par id
const batch = db.batch()
for (const tache of taches) {
  const ref = db.collection('taches').doc(tache.id)
  batch.set(ref, tache, { merge: true })
}

await batch.commit()
console.log(`✅ ${taches.length} tâches seedées avec succès dans la collection "taches"`)
process.exit(0)
