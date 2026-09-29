const { app, BrowserWindow, dialog, shell } = require('electron')
const path = require('path')
const https = require('https')

// URL publique (aucune authentification requise, voir routes/api.php) —
// le processus principal n'a pas accès au jeton de connexion, qui vit dans
// le stockage de la page web chargée par la fenêtre.
const APP_RELEASES_URL = 'https://e-biblio-app-hybride-production.up.railway.app/api/app-releases'
const DOWNLOAD_PAGE_URL = 'https://e-biblio.vercel.app/telecharger-l-application'

// Enrobe le site déployé en production, chargé en direct, plutôt qu'une
// copie embarquée dans l'installeur servie par un serveur HTTP local à
// port aléatoire. Décidé pour deux raisons : (1) ça élimine le problème
// d'origine changeante (jamais reconnaissable dans CORS_ALLOWED_ORIGINS
// côté Railway, ce qui bloquait TOUTES les requêtes API — catalogue,
// lecture, tout) ; (2) tout déploiement web est immédiatement visible ici,
// sans reconstruire l'installeur. Contrepartie assumée : le tout premier
// lancement a besoin d'internet — ensuite, le service worker PWA du site
// permet un fonctionnement hors-ligne quasi identique à une copie
// embarquée.
const PRODUCTION_URL = 'https://e-biblio.vercel.app'

// Vérification silencieuse d'une nouvelle version au démarrage — n'importe
// quel échec (hors ligne, réponse inattendue...) est ignoré sans jamais
// perturber le lancement de l'app.
function checkForUpdate() {
  const request = https.get(APP_RELEASES_URL, { timeout: 10_000 }, (res) => {
    let body = ''
    res.on('data', (chunk) => (body += chunk))
    res.on('end', () => {
      try {
        const { releases } = JSON.parse(body)
        const latestVersion = releases?.windows?.version
        if (latestVersion && latestVersion !== app.getVersion()) {
          dialog
            .showMessageBox({
              type: 'info',
              title: 'Mise à jour disponible',
              message: `Une nouvelle version de SCKOLARIS est disponible (${latestVersion}).`,
              detail: `Version installée : ${app.getVersion()}.`,
              buttons: ['Télécharger', 'Plus tard'],
              defaultId: 0,
            })
            .then(({ response }) => {
              if (response === 0) shell.openExternal(DOWNLOAD_PAGE_URL)
            })
        }
      } catch {
        // Réponse inattendue — pas grave, on retentera au prochain lancement.
      }
    })
  })
  request.on('timeout', () => request.destroy())
  request.on('error', () => {})
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    autoHideMenuBar: true,
    title: 'SCKOLARIS',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Electron refuse window.open() par défaut (depuis la v14) sauf
  // autorisation explicite ici — sans ça, "Lire en ligne" (qui ouvre un
  // onglet pour le PDF) ne fait rien du tout, en silence, aucune erreur
  // visible.
  win.webContents.setWindowOpenHandler(() => ({ action: 'allow' }))

  const devUrl = process.env.ELECTRON_START_URL
  win.loadURL(devUrl || PRODUCTION_URL)
}

app.whenReady().then(() => {
  createWindow()
  checkForUpdate()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
