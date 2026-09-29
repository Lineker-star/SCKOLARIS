#!/usr/bin/env node
// Simule un trafic utilisateur réaliste contre SCKOLARIS : connexion,
// navigation dans le catalogue, consultation d'un document, téléchargement
// occasionnel, déconnexion — un vrai parcours par "utilisateur virtuel",
// pas juste un bombardement d'une seule route. Utilise les comptes
// LOADTEST- déjà seedés (voir database/seeders/LoadTestUserSeeder.php).
// Aucune dépendance : fetch natif de Node.js (18+).
//
// ⚠️ Contre une vraie instance de PRODUCTION : commence avec une
// concurrence modeste (20-50) avant de monter, évite les heures de forte
// fréquentation réelle, et surveille les logs Railway pendant le test.
// Ce script n'a aucun garde-fou côté serveur (pas de rate-limit détecté
// dans les routes actuelles) — c'est à toi de rester raisonnable, un vrai
// pic de trafic mal maîtrisé peut ralentir/planter le site pour de vrais
// utilisateurs.
//
// Usage :
//   BASE_URL=https://<ton-backend>.up.railway.app/api CONCURRENCY=30 DURATION_S=60 node load-test.js
//
// Variables (toutes optionnelles) :
//   BASE_URL      URL de l'API à tester (défaut: backend local)
//   CONCURRENCY   Nombre d'utilisateurs virtuels simultanés (défaut: 20)
//   DURATION_S    Durée du test en secondes (défaut: 60)
//   USER_POOL     Nombre de comptes LOADTEST- disponibles (défaut: 5000,
//                 doit correspondre à ce que LoadTestUserSeeder a créé)
//   SEED_HISTORY  'true' pour générer d'abord un historique de trafic sur 90
//                 jours (téléchargements/lectures/activité/inscriptions),
//                 pour que la page Statistiques du dashboard admin ait un
//                 vrai rendu tout de suite plutôt qu'un simple pic aujourd'hui
//                 (le trafic simulé en direct par ce script ne concerne
//                 forcément que "maintenant", ça ne suffit pas pour peupler
//                 90 jours de courbes). Local uniquement (voir isLocalTarget
//                 ci-dessous) : ça lance `php artisan traffic:seed-history`,
//                 qui écrit directement dans la base sur laquelle tourne
//                 `php artisan` — contre un BASE_URL distant, ce serait la
//                 mauvaise base, donc l'étape est ignorée avec un avertissement.
//   HISTORY_DAYS  Nombre de jours d'historique à générer (défaut: 90)

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:8000/api'
const CONCURRENCY = Number(process.env.CONCURRENCY || 20)
const DURATION_S = Number(process.env.DURATION_S || 60)
const USER_POOL = Number(process.env.USER_POOL || 5000)
const SEED_HISTORY = process.env.SEED_HISTORY === 'true'
const HISTORY_DAYS = Number(process.env.HISTORY_DAYS || 90)
const PASSWORD = 'password123'

function isLocalTarget(url) {
  return /^https?:\/\/(127\.0\.0\.1|localhost|\[?::1\]?)(:|\/)/i.test(url)
}

async function seedTrafficHistory() {
  if (!SEED_HISTORY) return

  if (!isLocalTarget(BASE_URL)) {
    console.log(
      "⚠️  SEED_HISTORY=true ignoré : BASE_URL ne pointe pas vers localhost. Cette étape lance `php artisan` en local, qui écrirait dans la base locale — jamais dans celle d'un serveur distant joint en HTTP.\n",
    )
    return
  }

  const { execSync } = await import('node:child_process')
  const { fileURLToPath } = await import('node:url')
  const { dirname, join } = await import('node:path')
  const backendDir = join(dirname(fileURLToPath(import.meta.url)), '..') // scripts/ -> backend/

  console.log(`Génération de l'historique de trafic (${HISTORY_DAYS} jours, comptes LOADTEST-)...`)
  try {
    execSync(`php artisan traffic:seed-history --days=${HISTORY_DAYS}`, { cwd: backendDir, stdio: 'inherit' })
  } catch (err) {
    console.error("⚠️  Échec de la génération d'historique — le test de charge continue quand même :", err.message)
  }
  console.log('')
}

const stats = {}

function record(name, ms, ok) {
  const s = stats[name] ?? (stats[name] = { count: 0, fail: 0, totalMs: 0, max: 0 })
  s.count++
  s.totalMs += ms
  s.max = Math.max(s.max, ms)
  if (!ok) s.fail++
}

async function timed(name, fn) {
  const start = Date.now()
  try {
    const res = await fn()
    record(name, Date.now() - start, res.ok)
    return res
  } catch {
    record(name, Date.now() - start, false)
    return null
  }
}

function randomLoadtestUser() {
  const n = 1 + Math.floor(Math.random() * USER_POOL)
  return `LOADTEST-${String(n).padStart(5, '0')}`
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function virtualUser(stopAt) {
  await sleep(Math.random() * 2000) // étale les arrivées, évite une salve parfaitement synchronisée

  const registration_number = randomLoadtestUser()
  const loginRes = await timed('login', () =>
    fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registration_number, password: PASSWORD }),
    }),
  )
  if (!loginRes || !loginRes.ok) return
  const { token } = await loginRes.json()
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  while (Date.now() < stopAt) {
    const catalogRes = await timed('catalog', () =>
      fetch(`${BASE_URL}/catalog?page=${1 + Math.floor(Math.random() * 5)}`, { headers }),
    )
    const catalog = catalogRes && catalogRes.ok ? await catalogRes.json() : null
    const docs = catalog?.data ?? []

    if (docs.length > 0) {
      const doc = docs[Math.floor(Math.random() * docs.length)]
      await timed('document_detail', () => fetch(`${BASE_URL}/documents/${doc.id}`, { headers }))

      // ~1 visite sur 4 va jusqu'au téléchargement — le reste consulte
      // seulement (comportement réaliste, pas 100% de conversion).
      if (Math.random() < 0.25) {
        await timed('download', () =>
          fetch(`${BASE_URL}/documents/${doc.id}/download`, { method: 'POST', headers }),
        )
      }
    }

    await sleep(500 + Math.random() * 1500) // pause "humaine" entre deux actions
  }

  await timed('logout', () => fetch(`${BASE_URL}/logout`, { method: 'POST', headers }))
}

async function main() {
  await seedTrafficHistory()

  console.log(`Cible : ${BASE_URL}`)
  console.log(`Utilisateurs virtuels simultanés : ${CONCURRENCY}, durée : ${DURATION_S}s\n`)

  const stopAt = Date.now() + DURATION_S * 1000
  const users = Array.from({ length: CONCURRENCY }, () => virtualUser(stopAt))
  await Promise.all(users)

  console.log('\n--- Résultats ---')
  const order = ['login', 'catalog', 'document_detail', 'download', 'logout']
  for (const name of order) {
    const s = stats[name]
    if (!s) continue
    const avg = (s.totalMs / s.count).toFixed(0)
    const failRate = ((s.fail / s.count) * 100).toFixed(1)
    console.log(
      `${name.padEnd(16)} ${String(s.count).padStart(6)} requêtes  |  moy ${avg}ms  |  max ${s.max}ms  |  échecs ${failRate}%`,
    )
  }
}

main()
