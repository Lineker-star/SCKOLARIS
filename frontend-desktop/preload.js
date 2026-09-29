// Pont sécurisé entre le processus de rendu (l'app web SCKOLARIS, chargée
// telle quelle) et Electron. L'app web est autonome (elle appelle
// directement l'API Laravel via HTTPS) : aucune API native n'est
// nécessaire pour l'instant. Fichier prêt à accueillir de futurs besoins
// (ex: notifications natives, accès au système de fichiers) via
// contextBridge.exposeInMainWorld, sans jamais activer nodeIntegration
// côté renderer (voir main.js : contextIsolation: true).
