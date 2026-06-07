#!/usr/bin/env node
/**
 * Seed Firestore via Firebase Web SDK (pas besoin de service account)
 * Usage : node scripts/seed-web.mjs
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Charger .env.local
const dotenvPath = resolve(__dirname, '../.env.local')
if (existsSync(dotenvPath)) {
  const raw = readFileSync(dotenvPath, 'utf8')
  for (const line of raw.split('\n')) {
    const [key, ...rest] = line.split('=')
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
  }
}

const config = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
}

if (!config.apiKey || !config.projectId) {
  console.error('❌ Variables VITE_FIREBASE_API_KEY ou VITE_FIREBASE_PROJECT_ID manquantes dans .env.local')
  process.exit(1)
}

const { initializeApp } = await import('firebase/app')
const { getFirestore, doc, writeBatch } = await import('firebase/firestore')

const app = initializeApp(config)
const db = getFirestore(app)

// Lire le fichier de données
const tasksPath = resolve(__dirname, '../../{output_folder}/planning-artifacts/tasks-structured.json')
const data = JSON.parse(readFileSync(tasksPath, 'utf8'))

const jours = data.jours.filter((j) => ['avant', 'vendredi', 'samedi', 'dimanche'].includes(j.id))

const taches = []
for (const jour of jours) {
  for (const tache of jour.macro_taches) {
    taches.push({
      id: tache.id,
      titre: tache.titre,
      heure_debut: tache.heure_debut ?? null,
      heure_fin: tache.heure_fin ?? null,
      zone: tache.zone ?? null,
      assignes: Array.isArray(tache.assignes) ? tache.assignes.filter((a) => a !== 'tous') : [],
      statut: 'À faire',
      note: tache.note ?? null,
      jour: jour.id,
      parente: tache.parente ?? null,
    })
  }
}

console.log(`📋 ${taches.length} tâches à seeder (avant + vendredi + samedi + dimanche)...`)

// Firestore Web SDK : max 500 ops par batch
const BATCH_SIZE = 400
for (let i = 0; i < taches.length; i += BATCH_SIZE) {
  const chunk = taches.slice(i, i + BATCH_SIZE)
  const batch = writeBatch(db)
  for (const tache of chunk) {
    const ref = doc(db, 'taches', tache.id)
    const { id, ...data } = tache
    batch.set(ref, data, { merge: true })
  }
  await batch.commit()
  console.log(`  ✓ Batch ${Math.floor(i / BATCH_SIZE) + 1} : ${chunk.length} tâches`)
}

console.log(`✅ ${taches.length} tâches seedées avec succès dans "taches"`)
process.exit(0)
