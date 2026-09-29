// Base de connaissance de l'assistant SCKOLARIS — réponses par
// reconnaissance de mots-clés (pas d'IA externe, pas de clé API à fournir).
//
// Une base de connaissance par langue (chatbotKnowledge.fr.js /
// chatbotKnowledge.en.js) : les mots-clés eux-mêmes doivent être dans la
// langue tapée par la personne, une simple traduction des réponses ne
// suffirait pas à faire fonctionner la reconnaissance en anglais.
//
// Deux niveaux de correspondance : d'abord une recherche exacte (tous les
// mots d'un groupe présents dans la question), puis, si rien ne correspond
// parfaitement, une recherche approchée (au moins 60% des mots d'un groupe
// d'au moins deux mots) — ça évite qu'une simple reformulation ("comment on
// fait pour lire un livre" au lieu de "lire en ligne") tombe sur la réponse
// générique faute de correspondance exacte.
//
// `answer` est la réponse par défaut (visiteur non connecté, ou rôle non
// concerné par une nuance). `roles` permet de préciser la réponse selon le
// rôle de la personne connectée (student/teacher/admin) — utilisé seulement
// quand la réponse change vraiment selon le rôle (sinon `answer` suffit).
import * as fr from './chatbotKnowledge.fr'
import * as en from './chatbotKnowledge.en'

const BANKS = { fr, en }

function bankFor(lang) {
  return BANKS[lang] ?? BANKS.fr
}

function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

// Meilleur score obtenu par n'importe lequel des groupes de mots-clés de
// cette entrée, sur cette question : 1 = groupe entièrement présent, sinon
// la fraction de mots du groupe retrouvés dans la question.
function bestGroupScore(entry, normalizedMessage) {
  let best = 0
  for (const group of entry.keywords) {
    const found = group.filter((keyword) => normalizedMessage.includes(normalize(keyword))).length
    const score = found / group.length
    if (score > best) best = score
  }
  return best
}

function pickAnswer(entry, role) {
  if (role && entry.roles?.[role]) return entry.roles[role]
  return entry.answer
}

export function answerFor(message, role, lang = 'fr') {
  const { knowledgeBase, fallbackAnswer } = bankFor(lang)
  const normalized = normalize(message)

  // Passe 1 : correspondance exacte (au moins un groupe entièrement
  // présent) — la plus fiable, on s'arrête à la première trouvée.
  for (const entry of knowledgeBase) {
    const exact = entry.keywords.some((group) => group.every((keyword) => normalized.includes(normalize(keyword))))
    if (exact) return pickAnswer(entry, role)
  }

  // Passe 2 : rien d'exact — on cherche la meilleure correspondance
  // approchée (utile dès que la question reformule légèrement un sujet
  // connu), seulement sur des groupes d'au moins deux mots pour éviter
  // qu'un mot isolé trop courant ne déclenche une réponse hors sujet, et
  // seulement si elle est assez bonne (au moins 3 mots sur 4, par exemple).
  let bestEntry = null
  let bestScore = 0
  for (const entry of knowledgeBase) {
    const hasMultiWordGroup = entry.keywords.some((group) => group.length >= 2)
    if (!hasMultiWordGroup) continue

    const score = bestGroupScore(entry, normalized)
    if (score > bestScore) {
      bestScore = score
      bestEntry = entry
    }
  }
  if (bestEntry && bestScore >= 0.6) return pickAnswer(bestEntry, role)

  return fallbackAnswer
}

export function greetingFor(role, lang = 'fr') {
  const { greetingKnown, greetingAnonymous, roleLabels } = bankFor(lang)
  if (!role) return greetingAnonymous
  return greetingKnown.replace('{{role}}', roleLabels[role] ?? role)
}
