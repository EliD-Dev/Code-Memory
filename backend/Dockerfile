# ==========================================
# Dockerfile pour l'application Java (Spring Boot)
# ==========================================

# Utiliser une image de base Java avec Maven préconfiguré
FROM maven:3.9-eclipse-temurin-21 AS build

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier le fichier de configuration pom.xml
# Cela permet de mettre en cache les dépendances
COPY backend/pom.xml .

# Copier le code source de l'application
COPY backend/src ./src

# Compiler le projet et créer le JAR exécutable
# -DskipTests désactive les tests pour un build plus rapide en production
# -DoutputFile spécifie le nom du JAR (vous pouvez adapter selon votre configuration)
RUN mvn clean package -DskipTests

# ==========================================
# Image de production (Runtime)
# ==========================================

# Utiliser une image de base légère avec JRE (Java Runtime Environment)
# Eclipse Temurin est une version OpenJDK recommandée par la CNCF
FROM eclipse-temurin:21-jre

# Définir le port sur lequel l'application va tourner
EXPOSE 8080

# Définir le répertoire de travail
WORKDIR /app

# Copier le JAR compilé depuis l'étape de build
COPY --from=build /app/target/*.jar app.jar

# Définir la commande de démarrage de l'application
ENTRYPOINT ["java", "-jar", "app.jar"]
