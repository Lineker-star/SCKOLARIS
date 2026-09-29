<#
.SYNOPSIS
  Publie un installeur desktop (.exe) ou mobile (.apk) sur SCKOLARIS, sans
  passer par le tableau de bord ni un compte admin — via le jeton fixe
  RELEASE_UPLOAD_TOKEN (voir deploiement.md et ReleaseAccess.php).

.EXAMPLE
  ./publish-release.ps1 -Platform windows -Version 1.2.0 -File "C:\dist\e-biblio-setup-1.2.0.exe"

.EXAMPLE
  # Jeton lu depuis la variable d'environnement RELEASE_UPLOAD_TOKEN plutôt
  # que retapé à chaque fois :
  $env:RELEASE_UPLOAD_TOKEN = "colle-ton-jeton-ici"
  ./publish-release.ps1 -Platform android -Version 1.2.0 -File "C:\dist\e-biblio-1.2.0.apk"
#>
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('windows', 'android')]
    [string]$Platform,

    [Parameter(Mandatory = $true)]
    [ValidatePattern('^\d+\.\d+\.\d+$')]
    [string]$Version,

    [Parameter(Mandatory = $true)]
    [string]$File,

    [string]$Token = $env:RELEASE_UPLOAD_TOKEN,

    [string]$BaseUrl = "https://e-biblio-app-hybride-production.up.railway.app"
)

if (-not (Test-Path $File)) {
    Write-Error "Fichier introuvable : $File"
    exit 1
}
if ([string]::IsNullOrWhiteSpace($Token)) {
    Write-Error "Aucun jeton fourni. Passe -Token '...' ou définis `$env:RELEASE_UPLOAD_TOKEN d'abord."
    exit 1
}

$expectedExt = if ($Platform -eq 'windows') { '.exe' } else { '.apk' }
if ([System.IO.Path]::GetExtension($File) -ne $expectedExt) {
    Write-Error "Le fichier doit avoir l'extension $expectedExt pour la plateforme '$Platform'."
    exit 1
}

Write-Host "Publication de $Platform v$Version depuis $File..."

$result = curl.exe -s -w "`nHTTP_STATUS:%{http_code}" -X POST "$BaseUrl/api/app-releases" `
    -H "X-Release-Token: $Token" `
    -F "platform=$Platform" `
    -F "version=$Version" `
    -F "file=@$File"

Write-Host $result

if ($result -match 'HTTP_STATUS:201') {
    Write-Host "`nOK — publié. Les appareils déjà installés verront la mise à jour à leur prochain lancement." -ForegroundColor Green
} else {
    Write-Host "`nÉchec — voir la réponse ci-dessus." -ForegroundColor Red
    exit 1
}
