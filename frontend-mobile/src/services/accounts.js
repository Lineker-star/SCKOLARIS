import api from './api'
import * as SecureStore from '../utils/secureStorage'

const DEVICE_ID_KEY = 'e-biblio-device-id'

async function getDeviceId() {
  let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY)
  if (!deviceId || !/^[a-f0-9]{32}$/i.test(deviceId)) {
    deviceId = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId)
  }
  return deviceId
}

// `avatar` (photo d'identité, obligatoire) est un objet { uri, name, type }
// produit par expo-image-picker — voir updateProfile.
export function register({ avatar, ...fields }) {
  const formData = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null && value !== '') formData.append(key, value)
  }
  if (avatar) formData.append('avatar', avatar)

  return api.post('/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export async function login(payload) {
  return api.post('/login', { ...payload, device_id: await getDeviceId(), platform: 'mobile' })
}

export function getAccounts(params) {
  return api.get('/accounts', { params })
}

export function getPendingAccounts(params) {
  return api.get('/accounts/pending', { params })
}

export function getAccount(id) {
  return api.get(`/accounts/${id}`)
}

// `avatar`, quand fourni, est un objet { uri, name, type } produit par
// expo-image-picker — RN sait ajouter cette forme à un FormData nativement.
export function updateProfile({ first_name, last_name, email, program, domain_id, study_domain, secondary_email, avatar }) {
  const formData = new FormData()
  if (first_name !== undefined && first_name !== '') formData.append('first_name', first_name)
  if (last_name !== undefined && last_name !== '') formData.append('last_name', last_name)
  if (email !== undefined && email !== '') formData.append('email', email)
  if (program !== undefined && program !== null && program !== '') formData.append('program', program)
  if (domain_id !== undefined && domain_id !== null && domain_id !== '') formData.append('domain_id', domain_id)
  if (study_domain !== undefined && study_domain !== null && study_domain !== '') formData.append('study_domain', study_domain)
  if (secondary_email !== undefined && secondary_email !== null && secondary_email !== '') {
    formData.append('secondary_email', secondary_email)
  }
  if (avatar) formData.append('avatar', avatar)

  return api.post('/me', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function updatePassword({ current_password, password, password_confirmation }) {
  return api.post('/me/password', { current_password, password, password_confirmation })
}

export function updateAccountStatus(id, account_status) {
  return api.patch(`/accounts/${id}`, { account_status })
}

export function updateAccountRole(id, role) {
  return api.patch(`/accounts/${id}/role`, { role })
}

export function deactivateAccount(id) {
  return api.patch(`/accounts/${id}/deactivate`)
}

export function reactivateAccount(id) {
  return api.patch(`/accounts/${id}/reactivate`)
}

export function getStatistics() {
  return api.get('/statistics')
}

export function forgotPassword(email) {
  return api.post('/forgot-password', { email })
}
