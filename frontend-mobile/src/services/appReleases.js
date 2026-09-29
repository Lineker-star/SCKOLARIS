import api from './api'

export function getAppReleases() {
  return api.get('/app-releases')
}

export function deleteAppRelease(platform) {
  return api.delete(`/app-releases/${platform}`)
}

export function uploadAppRelease(platform, version, file) {
  const formData = new FormData()
  formData.append('platform', platform)
  formData.append('version', version)
  formData.append('file', file)
  return api.post('/app-releases', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    // Les installeurs peuvent peser plusieurs centaines de Mo — le timeout
    // par défaut d'`api` (15s) est bien trop court.
    timeout: 600_000,
  })
}
