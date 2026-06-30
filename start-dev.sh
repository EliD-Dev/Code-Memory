#!/bin/bash

# Utilisation du .env pour configurer les variables d'environnement
if [ -f ".env" ]; then
    while IFS= read -r line || [ -n "$line" ]; do
        if [[ ! "$line" =~ ^# ]] && [[ ! -z "$line" ]]; then
            key=$(echo "$line" | cut -d'=' -f1 | xargs)
            value=$(echo "$line" | cut -d'=' -f2- | xargs | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
            if [ "$key" = "SPRING_DATASOURCE_URL" ] && [[ "$value" == *//*@* ]]; then
                prefix="${value%%//*}//"
                suffix="${value##*@}"
                value="${prefix}${suffix}"
            fi
            export "$key=$value"
        fi
    done < .env
fi

# Vérification des variables d'environnement
if [ -z "$GITHUB_CLIENT_ID" ] || [ -z "$GITHUB_CLIENT_SECRET" ]; then
    echo "Erreur : GITHUB_CLIENT_ID ou GITHUB_CLIENT_SECRET n'est pas défini."
    exit 1
fi

echo "Démarrage de l'écosystème Mémoire de Code..."

# Vérification des dépendances
if ! command -v mvn &> /dev/null; then
    echo "Erreur : Maven n'est pas installé ou pas dans le PATH."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "Erreur : npm n'est pas installé ou pas dans le PATH."
    exit 1
fi

# Vérification du dossier des dépendances
if [ ! -d "backend/target" ]; then
    echo "Compilation du backend..."
    cd backend && ./mvnw clean package
    if [ $? -ne 0 ]; then
        echo "La compilation du backend a échoué."
        exit 1
    fi
    cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Installation des dépendances frontend..."
    cd frontend && npm install
    if [ $? -ne 0 ]; then
        echo "L'installation des dépendances frontend a échoué."
        exit 1
    fi
    cd ..
fi

# Lancement du Backend en arrière-plan
cd backend && ./mvnw spring-boot:run &
BACKEND_PID=$!

# Lancement du Frontend en arrière-plan
cd ../frontend && npm run dev &
FRONTEND_PID=$!

# Piège l'interruption Ctrl+C pour couper les deux services proprement
trap "echo 'Arrêt des services en cours...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

# Maintient le script actif et affiche les logs combinés
wait