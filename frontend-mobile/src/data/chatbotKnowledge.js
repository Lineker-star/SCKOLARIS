// Base de connaissance de l'assistant SCKOLARIS — réponses par
// reconnaissance de mots-clés (pas d'IA externe, pas de clé API à fournir).
//
// Une base de connaissance par langue (chatbotKnowledge.fr.js /
// chatbotKnowledge.en.js), identique à la version web — voir ce fichier-là
// pour le détail : les mots-clés eux-mêmes doivent être dans la langue
// tapée par la personne, une simple traduction des réponses ne suffirait
// pas à faire fonctionner la reconnaissance en anglais.
//
// Deux niveaux de correspondance : d'abord une recherche exacte (tous les
// mots d'un groupe présents dans la question), puis, si rien ne correspond
// parfaitement, une recherche approchée (au moins 60% des mots d'un groupe
// d'au moins deux mots).
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

  for (const entry of knowledgeBase) {
    const exact = entry.keywords.some((group) => group.every((keyword) => normalized.includes(normalize(keyword))))
    if (exact) return pickAnswer(entry, role)
  }

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
