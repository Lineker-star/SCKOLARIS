import api from './api'

const DEVICE_ID_KEY = 'e-biblio-device-id'

function getDeviceId() {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY)
  if (!deviceId || !/^[a-f0-9-]{32,36}$/i.test(deviceId)) {
    deviceId = globalThis.crypto?.randomUUID?.() ?? Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    localStorage.setItem(DEVICE_ID_KEY, deviceId)
  }
  return deviceId.replace(/-/g, '').slice(0, 32)
}

export function register({ avatar, ...fields }) {
  // multipart/form-data : la photo d'identité (format 4x4, obligatoire)
  // voyage dans la même requête que les autres champs.
  const formData = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null && value !== '') formData.append(key, value)
  }
  if (avatar) formData.append('avatar', avatar)

  return api.post('/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function login(payload) {
  return api.post('/login', { ...payload, device_id: getDeviceId(), platform: 'web' })
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

export function resetPassword({ token, email, password, password_confirmation }) {
  return api.post('/reset-password', { token, email, password, password_confirmation })
}
