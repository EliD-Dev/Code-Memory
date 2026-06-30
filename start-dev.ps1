Get-Content .env | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#")) {
        $parts = $line.Split("=", 2)
        if ($parts.Length -eq 2) {
            $key = $parts[0].Trim()
            $value = $parts[1].Trim().Trim('"').Trim("'")
            if ($key -eq "SPRING_DATASOURCE_URL" -and $value.Contains("//") -and $value.Contains("@")) {
                $doubleSlashIdx = $value.IndexOf("//")
                $atIdx = $value.LastIndexOf("@")
                if ($atIdx -gt $doubleSlashIdx) {
                    $prefix = $value.Substring(0, $doubleSlashIdx + 2)
                    $suffix = $value.Substring($atIdx + 1)
                    $value = $prefix + $suffix
                }
            }
            Set-Item "Env:$key" $value
        }
    }
}

# Vérification des variables d'environnement requises
if (-not $env:GITHUB_CLIENT_ID -or -not $env:GITHUB_CLIENT_SECRET) {
    Write-Error "Erreur : Les variables GITHUB_CLIENT_ID et GITHUB_CLIENT_SECRET ne sont pas définies dans le système."
    Exit 1
}

Write-Host "Vérification des dépendances..."
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { Write-Error "Node.js / npm est requis."; Exit 1 }
if (-not (Get-Command mvn -ErrorAction SilentlyContinue)) { Write-Error "Maven est requis."; Exit 1 }

# Vérifier que les dossiers des dépendances existent
if (-not (Test-Path "backend/target" -PathType Container)) { Write-Host "Compilation du backend..." ; cd backend ; ./mvnw clean package ; cd .. } else { Write-Host "Backend déjà compilé." }
if (-not (Test-Path "frontend/node_modules" -PathType Container)) { Write-Host "Installation des dépendances frontend..." ; cd frontend ; npm install ; cd .. } else { Write-Host "Frontend déjà installé." }

Write-Host "Lancement de l'environnement de développement..."

# Lance le backend dans une nouvelle fenêtre autonome
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Démarrage du Backend Spring Boot...'; cd backend; ./mvnw spring-boot:run"

# Lance le frontend dans une nouvelle fenêtre autonome
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Démarrage du Frontend Vite...'; cd frontend; npm run dev"

Write-Host "Les deux services s'exécutent dans des terminaux séparés."