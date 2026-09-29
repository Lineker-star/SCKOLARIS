$base = "http://127.0.0.1:8000/api"

Write-Host "`n--- 0. Creation d'une fausse photo d'identite (JPEG 1x1 valide) ---"
$tinyJpegBase64 = "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVN//2Q=="
[System.IO.File]::WriteAllBytes("$PWD\photo.jpg", [System.Convert]::FromBase64String($tinyJpegBase64))

Write-Host "`n--- 1. Inscription etudiant (pending, avec photo d'identite obligatoire) ---"
$studentJson = curl.exe -s -X POST "$base/register" `
    -F "last_name=Fotso" -F "first_name=Awa" `
    -F "role=student" `
    -F "registration_number=26SWE118" `
    -F "email=awa.fotso@etu.iu-ztf.cm" `
    -F "password=Password123!" `
    -F "avatar=@photo.jpg;type=image/jpeg"
$student = $studentJson | ConvertFrom-Json
$student

Write-Host "`n--- 2. Login etudiant -> token ---"
$login = Invoke-RestMethod -Uri "$base/login" -Method Post -ContentType 'application/json' -Body (@{ identifier = "awa.fotso@etu.iu-ztf.cm"; password = "Password123!" } | ConvertTo-Json)
$studentToken = $login.token
$login

Write-Host "`n--- 3. Catalogue accessible meme pending ---"
Invoke-RestMethod -Uri "$base/catalog" -Headers @{ Authorization = "Bearer $studentToken" }

Write-Host "`n--- 4. Login admin ---"
$adminLogin = Invoke-RestMethod -Uri "$base/login" -Method Post -ContentType 'application/json' -Body (@{ identifier = "admin@iu-ztf.cm"; password = "password123" } | ConvertTo-Json)
$adminToken = $adminLogin.token
$adminLogin

Write-Host "`n--- 5. Creation d'un faux PDF valide ---"
[System.IO.File]::WriteAllText("$PWD\test.pdf", "%PDF-1.4`n%%EOF")

Write-Host "`n--- 6. Admin depose un document (multipart via curl.exe) ---"
$docJson = curl.exe -s -X POST "$base/documents" -H "Authorization: Bearer $adminToken" -F "title=Cours de test" -F "author=Admin" -F "subject=Informatique" -F "file=@test.pdf;type=application/pdf"
$docResponse = $docJson | ConvertFrom-Json
$docResponse
$documentId = $docResponse.document.id
Write-Host "documentId = $documentId"

Write-Host "`n--- 7. Telechargement refuse (403) tant que l'etudiant est pending ---"
try {
    Invoke-RestMethod -Uri "$base/documents/$documentId/download" -Method Post -Headers @{ Authorization = "Bearer $studentToken" }
} catch {
    "Statut recu : $($_.Exception.Response.StatusCode.value__)"
}

Write-Host "`n--- 8. Admin valide le compte etudiant ---"
Invoke-RestMethod -Uri "$base/accounts/$($login.user.id)" -Method Patch -Headers @{ Authorization = "Bearer $adminToken" } -ContentType 'application/json' -Body (@{ account_status = "validated" } | ConvertTo-Json)

Write-Host "`n--- 9. Telechargement maintenant autorise -> doit reussir ---"
Invoke-RestMethod -Uri "$base/documents/$documentId/download" -Method Post -Headers @{ Authorization = "Bearer $studentToken" } -OutFile "downloaded.pdf"
"OK : downloaded.pdf cree"
