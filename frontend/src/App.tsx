import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

axios.defaults.withCredentials = true;

// Initialize i18next
i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: {
                    title: "Code Memory",
                    subtitle: "Identity card and architecture analysis of your codebase.",
                    ownerPlaceholder: "Owner (e.g. facebook)",
                    repoPlaceholder: "Repository (e.g. react)",
                    generateButton: "Generate premium analysis",
                    connectButton: "Connect with GitHub",
                    connecting: "Connecting...",
                    logout: "Log out",
                    native: "Native",
                    score: "Score",
                    recentSearches: "Recent searches",
                    subtitleMD: "Analysis Report",
                    quickStartMarkdown: "Quick Start Setup",
                    viewDetails: "Click to expand details",
                    semanticSummary: "Semantic Summary",
                    realStack: "Real Stack Detector",
                    envVars: "Environment Variables",
                    envVarName: "Variable",
                    envVarDesc: "Description",
                    envVarSource: "Source File",
                    pivotalFiles: "Pivotal Files",
                    dependenciesMap: "Dependency Mapping",
                    timeline: "Milestones History",
                    guardians: "Guardians of the Temple",
                    exportMarkdown: "View Markdown",
                    previewMarkdown: "View Markdown",
                    modalTitle: "GitHub Markdown Specification",
                    copy: "Copy",
                    copied: "Copied!",
                    export: "Export",
                    close: "Close",
                    analyzing: "Analyzing repository...",
                    noDeps: "No dependencies detected",
                    prerequisites: "System Prerequisites",
                    importanceScore: "Importance score",
                    reason: "Reason",
                    noHistory: "No milestones found for this repository.",
                    commitsCount: "commits",
                    recentSearchesTitle: "Recently viewed repositories",
                    errorTitle: "Analysis Error",
                    syncing: "Synchronizing with the analysis engine (attempt {{attempt}}/3)...",
                    noAnalysisYet: "No analysis loaded yet.",
                    noAnalysisSub: "Enter an owner and a repository above to inspect the architecture.",
                    ownerLabel: "Owner",
                    repoLabel: "Repository",
                    loginRequired: "Please log in to start an analysis.",
                    cardTitle: "Identity Card",
                    stackTitle: "Real Technical Stack",
                    infraTitle: "Infrastructure Tools",
                    manifestTitle: "Configuration Manifest",
                    pivotalFilesTitle: "Pivotal Files Mapping",
                    radarTitle: "Major Dependencies Radar",
                    quickStartTitle: "Quick Start",
                    quickStartSub: "Select your package manager to copy setup commands:",
                    techDebtTitle: "Technical Debt Radar",
                    techDebtSub: "High-risk components and complex files based on churn and size.",
                    entryPointsTitle: "Applicative Entry Points",
                    entryPointsSub: "Key architectural files to open first to understand the codebase.",
                    licenceTitle: "Legal Compliance Audit",
                    licenceSub: "Commercial use audit and license dependencies map.",
                    pkgManager: "Package Manager",
                    globalLicence: "Main License",
                    statusReady: "Ready for commercial use",
                    statusWarning: "Warning: Copyleft license detected",
                    copyCode: "Copy commands",
                    copiedCode: "Copied!",

                    // Markdown headers & categories translations (EN)
                    fileLabel: "File",
                    size: "Size",
                    sizeKo: "Size (KB)",
                    churn: "Churn",
                    riskScore: "Risk Score",
                    category: "Category",
                    dependency: "Dependency",
                    licence: "License",
                    commercialStatus: "Commercial Status",
                    securityAuth: "Security & Auth",
                    dataOrm: "Data & ORM",
                    stateManagement: "State Management",
                    criticalTools: "Critical Tools",
                    coreDeps: "Core",

                    // Backend keys localization (EN)
                    MAIN_LANGUAGE: "Main language",
                    BACKEND_FRAMEWORK: "Backend framework",
                    API_FRAMEWORK: "API framework",
                    MOBILE_WEB_FRAMEWORK: "Mobile/Web framework",
                    FRONTEND_FRAMEWORK: "Frontend framework",
                    FRONTEND_META_FRAMEWORK: "Frontend meta-framework",
                    REPOSITORY_STRUCTURE: "Repository structure",
                    DOCKER_CONTAINERIZATION: "Containerization configuration present (docker-compose)",
                    RELATIONAL_DB_DOCKER: "Relational database (Docker)",
                    CACHE_MESSAGE_BROKER_DOCKER: "Cache / Message broker (Docker)",
                    DISTRIBUTED_MESSAGE_BROKER_DOCKER: "Distributed message broker (Docker)",
                    DB_DETECTED_IN_CONFIG: "Database detected in configuration files",
                    REDIS_CLIENT_CONFIG_DETECTED: "Redis client / configuration detected",
                    NO_INFRA_DETECTED: "No explicit Docker or middleware infrastructure detected.",
                    PROJECT_ENV_VAR: "Project environment variable",
                    APP_CONFIG_ENV_VAR: "Variable extracted from application config files",
                    NO_ENV_VAR_DETECTED: "No environment variables detected",
                    REQ_JAVA: "Requires Java {{version}}+",
                    REQ_NODE: "Requires Node.js v20+",
                    REQ_DOCKER: "Requires Docker & Docker Compose",
                    REQ_POSTGRES: "Requires an active PostgreSQL instance",
                    REQ_MYSQL: "Requires an active MySQL instance",
                    REQ_REDIS: "Requires an active Redis server",
                    REQ_KAFKA: "Requires an Apache Kafka cluster",
                    NO_PREREQS: "No specific system prerequisites detected.",
                    PROJECT_STRUCT_SEMANTIC_IMPORTANCE: "Project structure and semantic importance.",
                    STATIC_PIVOT_COMPONENT: "Central pivot component identified by static analysis.",
                    HIGH_CHURN_COUNT: "Critical file modified {{count}} times recently (high churn).",
                    STABLE: "Stable Component",
                    UNDETECTED: "Undetected",
                    GOD_OBJECT: "God Object / High Criticality",
                    MODERATE_DEBT: "Moderate Debt / High Churn",
                    DOM_ENTRYPOINT: "DOM rendering entry point for React/Frontend.",
                    ROOT_COMPONENT: "Root component of the client application.",
                    NEXT_PAGE_ROUTE: "Main page of the application (Next.js / routing).",
                    SPRING_APPLICATION: "Main Spring Boot class starting the application.",
                    LARAVEL_ROUTES: "Route configuration file (Laravel).",
                    API_CONTROLLER: "API Controller handling incoming requests.",
                    GO_ENTRYPOINT: "Entry point of the Go application.",
                    PYTHON_SCRIPT: "Entry script of the Python application.",
                    UNSPECIFIED: "Not specified",
                    UNLICENSED: "Unlicensed",
                    COMMERCIAL_READY: "Ready for commercial use",
                    COPYLEFT_WARNING: "Warning: Copyleft license detected",
                    ENV_WARNING: "Warning: An .env file is committed in this repository. Check that it does not contain any production secret keys.",
                    GITIGNORE_FILE_WARNING: "Warning: An .gitignore file is committed in this repository. Check that it does not contain any production secret keys.",
                    ERROR_DEPENDENCIES: "Error reading dependencies for ",
                    ERROR_ENV_VAR: "Error during the extraction of environment variables (ignored) : ",
                    ERROR_INFRASTRUCTURE: "Error during the detection of the infrastructure (ignored) : ",
                    ERROR_STACK: "Error during the detection of the stack (ignored) : ",
                    ERROR_CRITICAL_FILES: "Error during the detection of critical files (ignored) : ",
                    ERROR_DECISIONS: "Error during the detection of decisions (ignored) : ",
                    ERROR_TOP_CONTRIBUTORS: "Error during the detection of top contributors (ignored) : ",
                    ERROR_QUICK_START: "Error during the detection of the quick start (ignored) : ",
                    ERROR_TECHNICAL_DEBT: "Error during the detection of technical debt (ignored) : ",
                    ERROR_ENTRY_POINTS: "Error during the detection of entry points (ignored) : ",
                    ERROR_LICENCE_AUDIT: "Error during the detection of the license (ignored) : ",
                    ALLOWED: "Allowed",
                    WARNING: "Warning",
                    RESTRICTED: "Restricted",
                    NONE: "None",

                    // Backend errors localization (EN)
                    REPO_NOT_FOUND_DESC: "The repository was not found, is private, or you do not have permission to access it.",
                    TIMEOUT_ERROR_DESC: "The repository is too large or GitHub is taking too long to respond. Please try again.",
                    UNAUTHORIZED_ERROR_DESC: "Authentication problem with GitHub.",
                    RATE_LIMIT_ERROR_DESC: "GitHub API rate limit reached or access denied.",
                    ANALYSIS_FAILED_DESC: "Analysis failed.",
                    CONNECTION_ERROR_DESC: "Cannot connect to the analysis engine. Please verify that the server is started.",
                    UNEXPECTED_DATA_FORMAT: "Unexpected analysis data format received."
                }
            },
            fr: {
                translation: {
                    title: "Mémoire de Code",
                    subtitle: "Carte d'identité et analyse d'architecture de votre codebase.",
                    ownerPlaceholder: "Propriétaire (ex: facebook)",
                    repoPlaceholder: "Dépôt (ex: react)",
                    generateButton: "Générer l'analyse premium",
                    connectButton: "Se connecter avec GitHub",
                    connecting: "Connexion en cours...",
                    logout: "Déconnexion",
                    native: "Natif",
                    score: "Score",
                    recentSearches: "Recherches récentes",
                    subtitleMD: "Rapport d'Analyse",
                    quickStartMarkdown: "Configuration Démarrage Rapide",
                    viewDetails: "Cliquez pour dérouler les détails",
                    semanticSummary: "Résumé Sémantique",
                    realStack: "Détecteur de Stack Réelle",
                    envVars: "Variables d'Environnement",
                    envVarName: "Variable",
                    envVarDesc: "Rôle / Description",
                    envVarSource: "Source",
                    pivotalFiles: "Fichiers Piliers",
                    dependenciesMap: "Cartographie des Dépendances",
                    timeline: "Fil d'Ariane (Jalons)",
                    guardians: "Les Gardiens du Temple",
                    exportMarkdown: "Voir le Markdown",
                    previewMarkdown: "Voir le Markdown",
                    modalTitle: "Spécification Markdown GitHub",
                    copy: "Copier",
                    copied: "Copié !",
                    export: "Exporter",
                    close: "Fermer",
                    analyzing: "Analyse en cours du dépôt...",
                    noDeps: "Aucune dépendance détectée",
                    prerequisites: "Prérequis Système",
                    importanceScore: "Score d'importance",
                    reason: "Raison",
                    noHistory: "Aucun jalon trouvé dans l'historique.",
                    commitsCount: "commits",
                    recentSearchesTitle: "Dépôts consultés récemment",
                    errorTitle: "Erreur lors de l'analyse",
                    syncing: "Synchronisation avec le moteur d'analyse en cours (tentative {{attempt}}/3)...",
                    noAnalysisYet: "Aucune analyse chargée pour le moment.",
                    noAnalysisSub: "Saisissez un propriétaire et un dépôt ci-dessus pour inspecter l'architecture.",
                    ownerLabel: "Propriétaire",
                    repoLabel: "Dépôt",
                    loginRequired: "Veuillez vous connecter pour lancer une analyse.",
                    cardTitle: "Carte d'Identité",
                    stackTitle: "Stack Technique Détectée",
                    infraTitle: "Outils d'Infrastructure",
                    manifestTitle: "Manifeste de Configuration",
                    pivotalFilesTitle: "Cartographie des Fichiers Piliers",
                    radarTitle: "Radar de Dépendances Majeures",
                    quickStartTitle: "Démarrage Rapide",
                    quickStartSub: "Sélectionnez votre gestionnaire de paquets pour copier les commandes :",
                    techDebtTitle: "Radar de Dette Technique",
                    techDebtSub: "Zones de haute criticité basées sur la taille et le churn.",
                    entryPointsTitle: "Points d'Entrée Applicatifs",
                    entryPointsSub: "Fichiers clés à ouvrir en premier pour comprendre l'architecture.",
                    licenceTitle: "Audit de Conformité Légale",
                    licenceSub: "Conformité d'usage commercial et répartition des licences.",
                    pkgManager: "Gestionnaire de paquets",
                    globalLicence: "Licence Principale",
                    statusReady: "Prêt pour usage commercial",
                    statusWarning: "Attention : Licence Copyleft détectée",
                    copyCode: "Copier les commandes",
                    copiedCode: "Copié !",

                    // Markdown headers & categories translations (FR)
                    fileLabel: "Fichier",
                    size: "Taille",
                    sizeKo: "Taille (Ko)",
                    churn: "Churn",
                    riskScore: "Score de Risque",
                    category: "Catégorie",
                    dependency: "Dépendance",
                    licence: "Licence",
                    commercialStatus: "Statut Commercial",
                    securityAuth: "Sécurité & Auth",
                    dataOrm: "Données & ORM",
                    stateManagement: "Gestion d'État",
                    criticalTools: "Outils Critiques",
                    coreDeps: "Core",

                    // Backend keys localization (FR)
                    MAIN_LANGUAGE: "Langage principal",
                    BACKEND_FRAMEWORK: "Framework Backend",
                    API_FRAMEWORK: "Framework API",
                    MOBILE_WEB_FRAMEWORK: "Framework Mobile/Web",
                    FRONTEND_FRAMEWORK: "Framework Frontend",
                    FRONTEND_META_FRAMEWORK: "Meta-Framework Frontend",
                    REPOSITORY_STRUCTURE: "Structure du dépôt",
                    DOCKER_CONTAINERIZATION: "Configuration de conteneurisation présente (docker-compose)",
                    RELATIONAL_DB_DOCKER: "Base de données relationnelle (Docker)",
                    CACHE_MESSAGE_BROKER_DOCKER: "Cache / File de messages (Docker)",
                    DISTRIBUTED_MESSAGE_BROKER_DOCKER: "Courtier de messages distribué (Docker)",
                    DB_DETECTED_IN_CONFIG: "Base de données détectée dans les configurations",
                    REDIS_CLIENT_CONFIG_DETECTED: "Client/Config Redis détecté",
                    NO_INFRA_DETECTED: "Pas d'infrastructure Docker ou middleware explicite détectée.",
                    PROJECT_ENV_VAR: "Variable d'environnement du projet",
                    APP_CONFIG_ENV_VAR: "Variable extraite des configurations applicatives",
                    NO_ENV_VAR_DETECTED: "Aucune variable d'environnement détectée",
                    REQ_JAVA: "Nécessite Java {{version}}+",
                    REQ_NODE: "Nécessite Node.js v20+",
                    REQ_DOCKER: "Nécessite Docker & Docker Compose",
                    REQ_POSTGRES: "Nécessite une instance PostgreSQL active",
                    REQ_MYSQL: "Nécessite une instance MySQL active",
                    REQ_REDIS: "Nécessite un serveur Redis actif",
                    REQ_KAFKA: "Nécessite un cluster Apache Kafka",
                    NO_PREREQS: "Aucun prérequis système particulier détecté.",
                    PROJECT_STRUCT_SEMANTIC_IMPORTANCE: "Structure du projet et importance sémantique.",
                    STATIC_PIVOT_COMPONENT: "Composant pivot central identifié par analyse statique.",
                    HIGH_CHURN_COUNT: "Fichier critique modifié {{count}} fois récemment (churn élevé).",
                    STABLE: "Composant Stable",
                    UNDETECTED: "Non détecté",
                    GOD_OBJECT: "God Object / Haute Criticité",
                    MODERATE_DEBT: "Dette Modérée / Churn Élevé",
                    DOM_ENTRYPOINT: "Point d'entrée du rendu DOM React/Frontend.",
                    ROOT_COMPONENT: "Composant racine de l'application cliente.",
                    NEXT_PAGE_ROUTE: "Page principale de l'application (Next.js / routing).",
                    SPRING_APPLICATION: "Classe principale Spring Boot démarrant l'application.",
                    LARAVEL_ROUTES: "Fichier de configuration des routes (Laravel).",
                    API_CONTROLLER: "Contrôleur API gérant les requêtes entrantes.",
                    GO_ENTRYPOINT: "Point d'entrée de l'application Go.",
                    PYTHON_SCRIPT: "Script d'entrée de l'application Python.",
                    UNSPECIFIED: "Non spécifiée",
                    UNLICENSED: "Sans licence",
                    COMMERCIAL_READY: "Prêt pour usage commercial",
                    COPYLEFT_WARNING: "Attention : Licence Copyleft détectée",
                    ENV_WARNING: "Avertissement de sécurité : Un fichier .env est commité en dur dans ce dépôt. Vérifiez qu'il ne contient aucune clé secrète de production.",
                    GITIGNORE_FILE_WARNING: "Avertissement de sécurité : Un fichier .gitignore est commité en dur dans ce dépôt. Vérifiez qu'il ne contient aucune clé secrète de production.",
                    ERROR_DEPENDENCIES: "Erreur de lecture des dépendances pour ",
                    ERROR_ENV_VAR: "Erreur lors de l'extraction des variables d'environnement (ignorée) : ",
                    ERROR_INFRASTRUCTURE: "Erreur lors de la détection de l'infrastructure (ignorée gentiment) : ",
                    ERROR_STACK: "Erreur lors de la détection de la stack (ignorée gentiment) : ",
                    ERROR_CRITICAL_FILES: "Erreur lors de la détection des fichiers critiques (ignorée gentiment) : ",
                    ERROR_DECISIONS: "Erreur lors de la détection des décisions (ignorée gentiment) : ",
                    ERROR_TOP_CONTRIBUTORS: "Erreur lors de la détection des top contributeurs (ignorée gentiment) : ",
                    ERROR_QUICK_START: "Erreur lors de la détection du quick start (ignorée gentiment) : ",
                    ERROR_TECHNICAL_DEBT: "Erreur lors de la détection de la dette technique (ignorée gentiment) : ",
                    ERROR_ENTRY_POINTS: "Erreur lors de la détection des points d'entrée (ignorée gentiment) : ",
                    ERROR_LICENCE_AUDIT: "Erreur lors de la détection de la licence (ignorée gentiment) : ",
                    ALLOWED: "Autorisé",
                    WARNING: "Attention",
                    RESTRICTED: "Risqué",
                    NONE: "Aucune",

                    // Backend errors localization (FR)
                    REPO_NOT_FOUND_DESC: "Le dépôt est introuvable, privé, ou vous n'avez pas les droits pour y accéder.",
                    TIMEOUT_ERROR_DESC: "Le dépôt est trop volumineux ou GitHub met trop de temps à répondre. Veuillez réessayer.",
                    UNAUTHORIZED_ERROR_DESC: "Problème d'authentification avec GitHub.",
                    RATE_LIMIT_ERROR_DESC: "Limite d'API GitHub atteinte ou accès refusé.",
                    ANALYSIS_FAILED_DESC: "L'analyse a échoué.",
                    CONNECTION_ERROR_DESC: "Impossible de se connecter au moteur d'analyse. Veuillez vérifier que le serveur est démarré.",
                    UNEXPECTED_DATA_FORMAT: "Format de données d'analyse inattendu reçu."
                }
            },
            es: {
                translation: {
                    title: "Memoria de Código",
                    subtitle: "Tarjeta de identidad y análisis de arquitectura de su base de código.",
                    ownerPlaceholder: "Propietario (ej: facebook)",
                    repoPlaceholder: "Repositorio (ej: react)",
                    generateButton: "Generar análisis premium",
                    connectButton: "Conectarse con GitHub",
                    connecting: "Conexión en curso...",
                    logout: "Cerrar sesión",
                    native: "Nativo",
                    score: "Puntaje",
                    recentSearches: "Búsquedas recientes",
                    subtitleMD: "Informe de Análisis",
                    quickStartMarkdown: "Configuración de Inicio Rápido",
                    viewDetails: "Haga clic para expandir los detalles",
                    semanticSummary: "Resumen Semántico",
                    realStack: "Detector de Stack Real",
                    envVars: "Variables de Entorno",
                    envVarName: "Variable",
                    envVarDesc: "Descripción",
                    envVarSource: "Archivo Origen",
                    pivotalFiles: "Archivos Pilares",
                    dependenciesMap: "Mapeo de Dependencias",
                    timeline: "Línea de Tiempo (Hitos)",
                    guardians: "Guardianes del Templo",
                    exportMarkdown: "Ver Markdown",
                    previewMarkdown: "Ver Markdown",
                    modalTitle: "Especificación de Markdown de GitHub",
                    copy: "Copiar",
                    copied: "¡Copiado!",
                    export: "Exportar",
                    close: "Cerrar",
                    analyzing: "Analizando repositorio...",
                    noDeps: "No se detectaron dependencias",
                    prerequisites: "Prerrequisitos del Sistema",
                    importanceScore: "Puntuación de importancia",
                    reason: "Razón",
                    noHistory: "No se encontraron hitos en el historial.",
                    commitsCount: "commits",
                    recentSearchesTitle: "Repositorios visitados recientemente",
                    errorTitle: "Error al analizar",
                    syncing: "Sincronizando con el motor de análisis (intento {{attempt}}/3)...",
                    noAnalysisYet: "Aún no se ha cargado ningún análisis.",
                    noAnalysisSub: "Ingrese un propietario y un repositorio arriba para inspectar la arquitectura.",
                    ownerLabel: "Propietario",
                    repoLabel: "Repositorio",
                    loginRequired: "Inicie sesión para iniciar un análisis.",
                    cardTitle: "Tarjeta de Identidad",
                    stackTitle: "Stack Técnico Detectado",
                    infraTitle: "Herramientas de Infraestructura",
                    manifestTitle: "Manifiesto de Configuración",
                    pivotalFilesTitle: "Mapeo de Archivos Pilares",
                    radarTitle: "Radar de Dependencias Mayores",
                    quickStartTitle: "Inicio Rápido",
                    quickStartSub: "Seleccione su gestor de paquetes para copiar comandos:",
                    techDebtTitle: "Radar de Deuda Técnica",
                    techDebtSub: "Componentes de alto riesgo y archivos complejos según churn y tamaño.",
                    entryPointsTitle: "Puntos de Entrada Aplicativos",
                    entryPointsSub: "Archivos clave para abrir primero para entender la arquitectura.",
                    licenceTitle: "Auditoría de Conformidad Legal",
                    licenceSub: "Auditoría de uso comercial y mapa de licencias de dependencias.",
                    pkgManager: "Gestor de paquetes",
                    globalLicence: "Licencia Principal",
                    statusReady: "Listo para uso comercial",
                    statusWarning: "Atención: Licencia Copyleft detectada",
                    copyCode: "Copiar comandos",
                    copiedCode: "¡Copiado!",

                    // Markdown headers & categories translations (ES)
                    fileLabel: "Archivo",
                    size: "Tamaño",
                    sizeKo: "Tamaño (KB)",
                    churn: "Churn",
                    riskScore: "Puntuación de Riesgo",
                    category: "Categoría",
                    dependency: "Dependencia",
                    licence: "Licencia",
                    commercialStatus: "Estado Comercial",
                    securityAuth: "Seguridad y Autenticación",
                    dataOrm: "Datos y ORM",
                    stateManagement: "Gestión de Estado",
                    criticalTools: "Herramientas Críticas",
                    coreDeps: "Core",

                    // Backend keys localization (ES)
                    MAIN_LANGUAGE: "Idioma principal",
                    BACKEND_FRAMEWORK: "Framework Backend",
                    API_FRAMEWORK: "Framework de API",
                    MOBILE_WEB_FRAMEWORK: "Framework Mobile/Web",
                    FRONTEND_FRAMEWORK: "Framework Frontend",
                    FRONTEND_META_FRAMEWORK: "Meta-Framework Frontend",
                    REPOSITORY_STRUCTURE: "Estructura del repositorio",
                    DOCKER_CONTAINERIZATION: "Configuración de contenedorización presente (docker-compose)",
                    RELATIONAL_DB_DOCKER: "Base de datos relacional (Docker)",
                    CACHE_MESSAGE_BROKER_DOCKER: "Caché / Gestor de mensajes (Docker)",
                    DISTRIBUTED_MESSAGE_BROKER_DOCKER: "Gestor de mensajes distribuido (Docker)",
                    DB_DETECTED_IN_CONFIG: "Base de datos detectada en archivos de configuración",
                    REDIS_CLIENT_CONFIG_DETECTED: "Cliente / Configuración Redis detectado",
                    NO_INFRA_DETECTED: "No se detectó infraestructura explícita de Docker o middleware.",
                    PROJECT_ENV_VAR: "Variable de entorno del proyecto",
                    APP_CONFIG_ENV_VAR: "Variable extraída de configuraciones de la aplicación",
                    NO_ENV_VAR_DETECTED: "No se detectaron variables de entorno",
                    REQ_JAVA: "Requiere Java {{version}}+",
                    REQ_NODE: "Requiere Node.js v20+",
                    REQ_DOCKER: "Requiere Docker & Docker Compose",
                    REQ_POSTGRES: "Requiere una instancia activa de PostgreSQL",
                    REQ_MYSQL: "Requiere una instancia activa de MySQL",
                    REQ_REDIS: "Requiere un servidor activo de Redis",
                    REQ_KAFKA: "Requiere un clúster de Apache Kafka",
                    NO_PREREQS: "No se detectaron prerrequisitos específicos del sistema.",
                    PROJECT_STRUCT_SEMANTIC_IMPORTANCE: "Estructura del proyecto e importancia semántica.",
                    STATIC_PIVOT_COMPONENT: "Componente pivote central identificado por análisis estático.",
                    HIGH_CHURN_COUNT: "Archivo crítico modificado {{count}} veces recientemente (alto churn).",
                    STABLE: "Componente Estable",
                    UNDETECTED: "No detectado",
                    GOD_OBJECT: "God Object / Alta Criticidad",
                    MODERATE_DEBT: "Deuda Moderada / Alto Churn",
                    DOM_ENTRYPOINT: "Punto de entrada de renderizado DOM para React/Frontend.",
                    ROOT_COMPONENT: "Componente raíz de la aplicación cliente.",
                    NEXT_PAGE_ROUTE: "Página principal de la aplicación (Next.js / enrutamiento).",
                    SPRING_APPLICATION: "Clase principal de Spring Boot que inicia la aplicación.",
                    LARAVEL_ROUTES: "Archivo de configuración de rutas (Laravel).",
                    API_CONTROLLER: "Controlador de API que maneja las solicitudes entrantes.",
                    GO_ENTRYPOINT: "Punto de entrada de la aplicación Go.",
                    PYTHON_SCRIPT: "Script de entrada de la aplicación Python.",
                    UNSPECIFIED: "No especificada",
                    UNLICENSED: "Sin licencia",
                    COMMERCIAL_READY: "Listo para uso comercial",
                    COPYLEFT_WARNING: "Atención: Licencia Copyleft detectada",
                    ENV_WARNING: "Advertencia de seguridad: En este repositorio hay un archivo .env integrado de forma permanente. Comprueba que no contenga ninguna clave secreta de producción.",
                    GITIGNORE_FILE_WARNING: "Advertencia de seguridad: En este repositorio hay un archivo .gitignore integrado de forma permanente. Comprueba que no contenga ninguna clave secreta de producción.",
                    ERROR_DEPENDENCIES: "Error de lectura de dependencias para ",
                    ERROR_ENV_VAR: "Error durante la extracción de variables de entorno (ignorado) : ",
                    ERROR_INFRASTRUCTURE: "Error durante la detección de la infraestructura (ignorado) : ",
                    ERROR_STACK: "Error durante la detección de la stack (ignorado) : ",
                    ERROR_CRITICAL_FILES: "Error durante la detección de los archivos críticos (ignorado) : ",
                    ERROR_DECISIONS: "Error durante la detección de las decisiones (ignorado) : ",
                    ERROR_TOP_CONTRIBUTORS: "Error durante la detección de los top colaboradores (ignorado) : ",
                    ERROR_QUICK_START: "Error durante la detección del quick start (ignorado) : ",
                    ERROR_TECHNICAL_DEBT: "Error durante la detección de la deuda técnica (ignorado) : ",
                    ERROR_ENTRY_POINTS: "Error durante la detección de los puntos de entrada (ignorado) : ",
                    ERROR_LICENCE_AUDIT: "Error durante la detección de la licencia (ignorado) : ",
                    ALLOWED: "Permitido",
                    WARNING: "Atención",
                    RESTRICTED: "Risqué",
                    NONE: "Ninguna",

                    // Backend errors localization (ES)
                    REPO_NOT_FOUND_DESC: "El repositorio no fue encontrado, es privado, o no tiene permisos para acceder a él.",
                    TIMEOUT_ERROR_DESC: "El repositorio es demasiado grande o GitHub está tardando demasiado en responder. Por favor intente de nuevo.",
                    UNAUTHORIZED_ERROR_DESC: "Problema de autenticación con GitHub.",
                    RATE_LIMIT_ERROR_DESC: "Límite de API de GitHub alcanzado o acceso denegado.",
                    ANALYSIS_FAILED_DESC: "El análisis ha fallado.",
                    CONNECTION_ERROR_DESC: "No se pudo conectar al motor de análisis. Verifique que el servidor esté iniciado.",
                    UNEXPECTED_DATA_FORMAT: "Formato de datos de análisis inesperado recibido."
                }
            }
        },
        lng: "en",
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

// TypeScript interfaces for static analysis dashboard
interface StackItem {
    name: string;
    version: string;
    type: string;
}

interface InfrastructureItem {
    name: string;
    description: string;
}

interface EnvVar {
    name: string;
    description: string;
    sourceFile: string;
}

interface CriticalFile {
    name: string;
    path: string;
    reason: string;
    score: number;
}

interface Dependencies {
    security: string[];
    persistence: string[];
    state: string[];
    tools: string[];
    core?: string[];
}

interface Decision {
    title: string;
    description: string;
    date: string;
}

interface TopContributor {
    name: string;
    avatarUrl: string;
    commitCount: number;
}

interface QuickStartInfo {
    wingetCommands: string;
    brewCommands: string;
    nativeCommands: string;
    hasCommittedEnv: boolean;
}

interface TechnicalDebtFile {
    name: string;
    path: string;
    sizeBytes: number;
    churn: number;
    riskScore: number;
    riskCategory: string;
}

interface TechnicalDebt {
    globalRiskScore: number;
    riskyFiles: TechnicalDebtFile[];
}

interface EntryPoint {
    name: string;
    path: string;
    description: string;
}

interface DependencyLicence {
    dependencyName: string;
    licenceName: string;
    status: string;
}

interface LicenceAudit {
    globalStatus: string;
    mainLicence: string;
    details: DependencyLicence[];
}

interface AnalysisResponse {
    identity: {
        summary: string;
        stack: StackItem[];
        infrastructure: InfrastructureItem[];
    };
    configManifest: {
        variables: EnvVar[];
        prerequisites: string[];
    };
    criticalFiles: CriticalFile[];
    dependencies: Dependencies;
    decisions: Decision[];
    topContributors?: TopContributor[];
    quickStart?: QuickStartInfo;
    technicalDebt?: TechnicalDebt;
    entryPoints?: EntryPoint[];
    licenceAudit?: LicenceAudit;
}

interface HistoryItem {
    owner: string;
    repo: string;
}

// Flag Components (minimalist and premium)
const FRFlag = () => (
    <svg width="18" height="12" viewBox="0 0 3 2" className="rounded-sm overflow-hidden border border-slate-200/60 shadow-sm shrink-0">
        <rect x="0" width="1" height="2" fill="#002395" />
        <rect x="1" width="1" height="2" fill="#FFFFFF" />
        <rect x="2" width="1" height="2" fill="#ED2939" />
    </svg>
);

const ESFlag = () => (
    <svg width="18" height="12" viewBox="0 0 3 2" className="rounded-sm overflow-hidden border border-slate-200/60 shadow-sm shrink-0">
        <rect width="3" height="2" fill="#C60B1E" />
        <rect y="0.5" width="3" height="1" fill="#F1BF00" />
    </svg>
);

const ENFlag = () => (
    <svg width="18" height="12" viewBox="0 0 50 30" className="rounded-sm overflow-hidden border border-slate-200/60 shadow-sm shrink-0">
        <rect width="50" height="30" fill="#012169" />
        <path d="M0 0 L50 30 M50 0 L0 30" stroke="#FFFFFF" strokeWidth="6" />
        <path d="M0 0 L50 30 M50 0 L0 30" stroke="#C8102E" strokeWidth="2" />
        <path d="M25 0 V30 M0 15 H50" stroke="#FFFFFF" strokeWidth="10" />
        <path d="M25 0 V30 M0 15 H50" stroke="#C8102E" strokeWidth="6" />
    </svg>
);

// Premium code blocks in Markdown with 1-click copy support
const CodeBlock = ({ code, language }: { code: string; language: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="not-prose relative my-5 group rounded-lg overflow-hidden border border-slate-200 bg-slate-50/50">
            <div className="flex justify-between items-center px-4 py-2 bg-slate-100/80 border-b border-slate-200 text-slate-500 text-xs font-mono select-none">
                <span>{language || 'code'}</span>
                <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer font-sans text-[11px] font-medium"
                    title="Copy code"
                >
                    {copied ? (
                        <>
                            <svg className="w-3.5 h-3.5 text-emerald-600 animate-fade-in" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span className="text-[10px] text-emerald-600 font-semibold">Copied!</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                <path d="M9 9V6.2002C9 5.08009 9 4.51962 9.21799 4.0918C9.40973 3.71547 9.71547 3.40973 10.0918 3.21799C10.5196 3 11.0801 3 12.2002 3H17.8002C18.9203 3 19.4801 3 19.9079 3.21799C20.2842 3.40973 20.5905 3.71547 20.7822 4.0918C21.0002 4.51962 21.0002 5.07967 21.0002 6.19978V11.7998C21.0002 12.9199 21.0002 13.48 20.7822 13.9078C20.5905 14.2841 20.2839 14.5905 19.9076 14.7822C19.4802 15 18.921 15 17.8031 15H15M9 9H6.2002C5.08009 9 4.51962 9 4.0918 9.21799C3.71547 9.40973 3.40973 9.71547 3.21799 10.0918C3 10.5196 3 11.0801 3 12.2002V17.8002C3 18.9203 3 19.4801 3.21799 19.9079C3.40973 20.2842 3.71547 20.5905 4.0918 20.7822C4.5192 21 5.07899 21 6.19691 21H11.8036C12.9215 21 13.4805 21 13.9079 20.7822C14.2842 20.5905 14.5905 20.2839 14.7822 19.9076C15 19.4802 15 18.921 15 17.8031V15M9 9H11.8002C12.9203 9 13.4801 9 13.9079 9.21799C14.2842 9.40973 14.5905 9.71547 14.7822 10.0918C15 10.5192 15 11.079 15 12.1969L15 15" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto text-xs text-slate-800 font-mono bg-slate-50/30 whitespace-pre-wrap break-all leading-relaxed select-text">
                <code>{code}</code>
            </pre>
        </div>
    );
};

const renderComponents = {
    pre({ children }: any) {
        return <>{children}</>;
    },
    code({ node, inline, className, children, ...props }: any) {
        const codeText = String(children).replace(/\n$/, '');
        const match = /language-(\w+)/.exec(className || '');
        const isMultiline = codeText.includes('\n') || !!match;

        if (isMultiline) {
            return <CodeBlock code={codeText} language={match ? match[1] : 'code'} />;
        }

        return (
            <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-xs border border-slate-200 before:content-none after:content-none" {...props}>
                {children}
            </code>
        );
    }
};

// Custom Dropdown Language Selector with Inline SVG flags
interface LanguageSelectorProps {
    currentLang: string;
    onChange: (lang: string) => void;
}

const LanguageSelector = ({ currentLang, onChange }: LanguageSelectorProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const languages = [
        { code: 'en', label: 'EN', flag: <ENFlag /> },
        { code: 'fr', label: 'FR', flag: <FRFlag /> },
        { code: 'es', label: 'ES', flag: <ESFlag /> }
    ];

    const activeLanguage = languages.find(l => l.code === currentLang) || languages[0];

    return (
        <div className="relative inline-block text-left" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
            >
                {activeLanguage.flag}
                <span>{activeLanguage.label}</span>
                <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-1 w-24 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            type="button"
                            onClick={() => {
                                onChange(lang.code);
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors text-left"
                        >
                            {lang.flag}
                            <span>{lang.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Markdown Preview Modal (GitHub specific representation)
interface MarkdownPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    markdownText: string;
    repoName: string;
    t: any;
}

const MarkdownPreviewModal = ({ isOpen, onClose, markdownText, repoName, t }: MarkdownPreviewModalProps) => {
    const [copied, setCopied] = useState(false);
    const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');

    if (!isOpen) return null;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(markdownText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleExport = () => {
        const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${repoName}-analysis.md`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 backdrop-blur-sm bg-slate-500/20 transition-opacity"
                onClick={onClose}
            />

            {/* Modal Box */}
            <div className="relative bg-white rounded-xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 flex flex-col z-10 transition-all transform scale-100">
                {/* Close button top right */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100 cursor-pointer hover:text-red-600"
                >
                    <svg className="w-5 h-5 text-red-600 hover:text-red-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 mb-2 pr-8">
                    {t('modalTitle')}
                </h3>

                {/* Toggle Mode */}
                <div className="flex bg-slate-100 p-1 rounded-md w-fit mb-4 border border-slate-200 font-sans">
                    <button
                        type="button"
                        onClick={() => setViewMode('preview')}
                        className={`text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer ${viewMode === 'preview' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'border border-transparent'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span>Preview</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('code')}
                        className={`text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer ${viewMode === 'code' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'border border-transparent'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <polyline points="16 18 22 12 16 6" />
                            <polyline points="8 6 2 12 8 18" />
                        </svg>
                        <span>Code</span>
                    </button>
                </div>

                {/* Markdown text/preview area */}
                <div className="max-h-[60vh] overflow-y-auto bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6 select-text">
                    {viewMode === 'code' ? (
                        <div className="font-mono text-sm text-slate-800 whitespace-pre-wrap">
                            {markdownText}
                        </div>
                    ) : (
                        <div className="prose prose-slate prose-sm max-w-none text-left">
                            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={renderComponents}>
                                {markdownText}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>

                {/* Footer buttons */}
                <div className="flex justify-end items-center gap-3">
                    <button
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors min-w-[80px] text-center cursor-pointer font-sans"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <g id="Edit / Copy">
                                <path d="M9 9V6.2002C9 5.08009 9 4.51962 9.21799 4.0918C9.40973 3.71547 9.71547 3.40973 10.0918 3.21799C10.5196 3 11.0801 3 12.2002 3H17.8002C18.9203 3 19.4801 3 19.9079 3.21799C20.2842 3.40973 20.5905 3.71547 20.7822 4.0918C21.0002 4.51962 21.0002 5.07967 21.0002 6.19978V11.7998C21.0002 12.9199 21.0002 13.48 20.7822 13.9078C20.5905 14.2841 20.2839 14.5905 19.9076 14.7822C19.4802 15 18.921 15 17.8031 15H15M9 9H6.2002C5.08009 9 4.51962 9 4.0918 9.21799C3.71547 9.40973 3.40973 9.71547 3.21799 10.0918C3 10.5196 3 11.0801 3 12.2002V17.8002C3 18.9203 3 19.4801 3.21799 19.9079C3.40973 20.2842 3.71547 20.5905 4.0918 20.7822C4.5192 21 5.07899 21 6.19691 21H11.8036C12.9215 21 13.4805 21 13.9079 20.7822C14.2842 20.5905 14.5905 20.2839 14.7822 19.9076C15 19.4802 15 18.921 15 17.8031V15M9 9H11.8002C12.9203 9 13.4801 9 13.9079 9.21799C14.2842 9.40973 14.5905 9.71547 14.7822 10.0918C15 10.5192 15 11.079 15 12.1969L15 15" stroke-linecap="round" stroke-linejoin="round" />
                            </g>
                        </svg>
                        <span>{copied ? t('copied') : t('copy')}</span>
                    </button>
                    <button
                        onClick={handleExport}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer font-sans"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        <span>{t('export')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Export to Markdown text generator
function generateMarkdownText(analysis: AnalysisResponse, repoName: string, t: any): string {
    const translatePrereq = (req: string) => {
        if (req.startsWith("REQ_JAVA_")) {
            const ver = req.replace("REQ_JAVA_", "");
            return t("REQ_JAVA", { version: ver });
        }
        return t(req);
    };

    const translateReason = (reason: string) => {
        if (reason.startsWith("HIGH_CHURN_COUNT:")) {
            const count = reason.split(":")[1];
            return t("HIGH_CHURN_COUNT", { count });
        }
        return t(reason);
    };

    // 1. En-tête
    let md = `<div align="center">\n  <h1>${t('title')}</h1>\n  <p><sup>${t('subtitleMD')} - <b>${repoName}</b></sup></p>\n</div>\n\n---\n\n`;

    // 2. Semantic Summary
    md += `## ${t('semanticSummary')}\n\n`;
    md += `${analysis.identity.summary || 'N/A'}\n\n`;

    // 3. Quick Start
    md += `## ${t('quickStartTitle')}\n\n`;
    md += `> **${t('quickStartMarkdown')}**\n\n`;
    if (analysis.quickStart) {
        if (analysis.quickStart.hasCommittedEnv) {
            md += `> [!WARNING]\n> ${t('ENV_WARNING')}\n\n`;
        }
        md += `\`\`\`bash\n`;
        md += `${analysis.quickStart.nativeCommands || 'N/A'}\n`;
        md += `\`\`\`\n\n`;
    } else {
        md += `N/A\n\n`;
    }

    // 4. Real Stack Detector
    md += `## ${t('realStack')}\n\n`;
    if (analysis.identity.stack && analysis.identity.stack.length > 0) {
        analysis.identity.stack.forEach(item => {
            const label = item.name.replace(/-/g, '--');
            const val = (item.version || 'N/A').replace(/-/g, '--');
            const badgeUrl = `https://img.shields.io/badge/${encodeURIComponent(label)}-${encodeURIComponent(val)}-3b82f6?style=flat-square&labelColor=1e293b`;
            md += `<img src="${badgeUrl}" alt="${item.name}" /> **${t(item.type)}**<br/>\n`;
        });
    } else {
        md += `N/A\n`;
    }
    md += `\n`;

    md += `### ${t('prerequisites')}\n\n`;
    if (analysis.configManifest.prerequisites && analysis.configManifest.prerequisites.length > 0) {
        analysis.configManifest.prerequisites.forEach(req => {
            md += `- ${translatePrereq(req)}\n`;
        });
    } else {
        md += `N/A\n`;
    }
    md += `\n`;

    // 5. Environment Variables
    md += `## ${t('envVars')}\n\n`;
    md += `<details>\n<summary>${t('viewDetails')}</summary>\n\n`;
    if (analysis.configManifest.variables && analysis.configManifest.variables.length > 0) {
        md += `| ${t('envVarName')} | ${t('envVarDesc')} | ${t('envVarSource')} |\n`;
        md += `| --- | --- | --- |\n`;
        analysis.configManifest.variables.forEach(v => {
            const nameStr = v.name === "NONE" ? t("NONE") : `<kbd>${v.name}</kbd>`;
            md += `| ${nameStr} | ${t(v.description)} | <kbd>${v.sourceFile}</kbd> |\n`;
        });
    } else {
        md += `N/A\n`;
    }
    md += `\n</details>\n\n`;

    // 6. Pivotal Files Mapping
    md += `## ${t('pivotalFilesTitle')}\n\n`;
    if (analysis.criticalFiles && analysis.criticalFiles.length > 0) {
        md += `| ${t('fileLabel')} | ${t('importanceScore')} | ${t('reason')} |\n`;
        md += `| --- | --- | --- |\n`;
        analysis.criticalFiles.forEach(f => {
            let folderPart = "";
            let filePart = f.name;
            if (f.path.includes("/")) {
                folderPart = f.path.substring(0, f.path.lastIndexOf("/"));
            }
            const pathWithKbd = folderPart ? `<kbd>${folderPart}</kbd>/${filePart}` : filePart;
            md += `| ${pathWithKbd} | **${f.score}** | ${translateReason(f.reason)} |\n`;
        });
    } else {
        md += `N/A\n`;
    }
    md += `\n`;

    // 7. Technical Debt Radar
    md += `## ${t('techDebtTitle')}\n\n`;
    md += `> **${t('techDebtSub')}**\n\n`;
    if (analysis.technicalDebt && analysis.technicalDebt.riskyFiles && analysis.technicalDebt.riskyFiles.length > 0) {
        md += `| ${t('fileLabel')} | ${t('sizeKo')} | ${t('churn')} | ${t('riskScore')} | ${t('category')} |\n`;
        md += `| --- | --- | --- | --- | --- |\n`;
        analysis.technicalDebt.riskyFiles.forEach(f => {
            let folderPart = "";
            let filePart = f.name;
            if (f.path.includes("/")) {
                folderPart = f.path.substring(0, f.path.lastIndexOf("/"));
            }
            const pathWithKbd = folderPart ? `<kbd>${folderPart}</kbd>/${filePart}` : filePart;
            md += `| ${pathWithKbd} | ${(f.sizeBytes / 1024).toFixed(1)} | ${f.churn} | **${f.riskScore}** | ${t(f.riskCategory)} |\n`;
        });
    } else {
        md += `N/A\n`;
    }
    md += `\n`;

    // 8. Applicative Entry Points
    md += `## ${t('entryPointsTitle')}\n\n`;
    md += `> **${t('entryPointsSub')}**\n\n`;
    if (analysis.entryPoints && analysis.entryPoints.length > 0) {
        analysis.entryPoints.forEach(ep => {
            let folderPart = "";
            let filePart = ep.name;
            if (ep.path.includes("/")) {
                folderPart = ep.path.substring(0, ep.path.lastIndexOf("/"));
            }
            const pathWithKbd = folderPart ? `<kbd>${folderPart}</kbd>/${filePart}` : filePart;
            md += `- **${ep.name}** (${pathWithKbd}) : ${t(ep.description)}\n`;
        });
    } else {
        md += `N/A\n`;
    }
    md += `\n`;

    // 9. Major Dependencies Radar
    md += `## ${t('dependenciesMap')}\n\n`;
    const deps = analysis.dependencies;
    const catList = [
        { title: t('coreDeps'), items: deps.core },
        { title: t('securityAuth'), items: deps.security },
        { title: t('dataOrm'), items: deps.persistence },
        { title: t('stateManagement'), items: deps.state },
        { title: t('criticalTools'), items: deps.tools }
    ];
    catList.forEach(cat => {
        md += `### ${cat.title}\n`;
        const validItems = cat.items ? cat.items.filter(item => item !== "UNDETECTED") : [];
        if (validItems.length > 0) {
            validItems.forEach(item => {
                md += `- ${item}\n`;
            });
        } else {
            md += `- ${t('noDeps')}\n`;
        }
        md += `\n`;
    });

    // 10. Milestones History
    md += `## ${t('timeline')}\n\n`;
    md += `<details>\n<summary>${t('viewDetails')}</summary>\n\n`;
    if (analysis.decisions && analysis.decisions.length > 0) {
        analysis.decisions.forEach(d => {
            md += `- **[${d.date}]** ${d.title} : ${d.description}\n`;
        });
    } else {
        md += `${t('noHistory')}\n`;
    }
    md += `\n</details>\n\n`;

    // 11. Legal Compliance Audit
    md += `## ${t('licenceTitle')}\n\n`;
    if (analysis.licenceAudit) {
        md += `**Statut Global :** ${t(analysis.licenceAudit.globalStatus)}\n`;
        md += `**Licence Principale :** ${t(analysis.licenceAudit.mainLicence)}\n\n`;
        if (analysis.licenceAudit.details && analysis.licenceAudit.details.length > 0) {
            md += `| ${t('dependency')} | ${t('licence')} | ${t('commercialStatus')} |\n`;
            md += `| --- | --- | --- |\n`;
            analysis.licenceAudit.details.forEach(det => {
                md += `| \`${det.dependencyName}\` | ${det.licenceName} | ${t(det.status)} |\n`;
            });
        }
    } else {
        md += `N/A\n`;
    }
    md += `\n`;

    return md;
}
const SearchIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={"w-5 h-5 " + className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </svg>
);

const HistoryIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={"w-4 h-4 " + className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l4 2" />
    </svg>
);

const ErrorIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={"w-5 h-5 " + className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
    </svg>
);

const CodeIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={"w-4 h-4 " + className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="m18 16 4-4-4-4" />
        <path d="m6 8-4 4 4 4" />
        <path d="m14.5 4-5 16" />
    </svg>
);

const InfoIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={"w-5 h-5 " + className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
    </svg>
);

const SettingsIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={"w-5 h-5 " + className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const FolderIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={"w-5 h-5 " + className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z" />
    </svg>
);

const CpuIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={"w-5 h-5 " + className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect width="16" height="16" x="4" y="4" rx="2" />
        <rect width="6" height="6" x="9" y="9" rx="1" />
        <path d="M9 1v3" />
        <path d="M15 1v3" />
        <path d="M9 20v3" />
        <path d="M15 20v3" />
        <path d="M20 9h3" />
        <path d="M20 15h3" />
        <path d="M1 9h3" />
        <path d="M1 15h3" />
    </svg>
);

const CalendarIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={"w-5 h-5 " + className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M16 2v4" />
        <path d="M8 2v4" />
        <path d="M3 10h18" />
    </svg>
);

const LoadingSpinner = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
);

function AppContent() {
    const { t, i18n: i18nInstance } = useTranslation();
    const { owner: routeOwner, repo: routeRepo } = useParams();
    const navigate = useNavigate();

    const translatePrerequisite = (req: string) => {
        if (req.startsWith("REQ_JAVA_")) {
            const ver = req.replace("REQ_JAVA_", "");
            return t("REQ_JAVA", { version: ver });
        }
        return t(req);
    };

    const translateCriticalFileReason = (reason: string) => {
        if (reason.startsWith("HIGH_CHURN_COUNT:")) {
            const count = reason.split(":")[1];
            return t("HIGH_CHURN_COUNT", { count });
        }
        return t(reason);
    };

    const [owner, setOwner] = useState('EliD-Dev');
    const [repo, setRepo] = useState('EliD-Dev');
    const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [retryAttempt, setRetryAttempt] = useState(0);
    const [error, setError] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [username, setUsername] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isMarkdownModalOpen, setIsMarkdownModalOpen] = useState(false);
    const [packageManager, setPackageManager] = useState<'winget' | 'brew' | 'native'>('native');
    const [copiedCode, setCopiedCode] = useState(false);
    const [terminalType, setTerminalType] = useState<'bash' | 'powershell'>('bash');

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/auth/status');
                if (response.data && response.data.authenticated) {
                    setIsAuthenticated(true);
                    setUsername(response.data.username || '');
                    setAvatarUrl(response.data.avatarUrl || '');
                } else {
                    setIsAuthenticated(false);
                }
            } catch (err) {
                setIsAuthenticated(false);
            }
        };
        checkAuthStatus();
    }, []);

    useEffect(() => {
        if (routeOwner) setOwner(routeOwner);
        if (routeRepo) setRepo(routeRepo);

        if (isAuthenticated === true && routeOwner && routeRepo) {
            const cleanOwner = routeOwner.trim();
            const cleanRepo = routeRepo.trim();
            if (cleanOwner && cleanRepo) {
                triggerAnalysis(cleanOwner, cleanRepo);
            }
        }
    }, [routeOwner, routeRepo, isAuthenticated]);

    const handleLoginClick = () => {
        setIsLoggingIn(true);
        window.location.href = 'http://localhost:8080/oauth2/authorization/github';
    };

    // localStorage History
    const [history, setHistory] = useState<HistoryItem[]>(() => {
        try {
            const saved = localStorage.getItem('github_analysis_history');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Session Cache
    const cache = useRef<Record<string, AnalysisResponse>>({});

    const addToHistory = (newOwner: string, newRepo: string) => {
        const item: HistoryItem = { owner: newOwner, repo: newRepo };
        setHistory((prev) => {
            const filtered = prev.filter(
                (i) => i.owner.toLowerCase() !== newOwner.toLowerCase() || i.repo.toLowerCase() !== newRepo.toLowerCase()
            );
            const updated = [item, ...filtered].slice(0, 5);
            localStorage.setItem('github_analysis_history', JSON.stringify(updated));
            return updated;
        });
    };

    const triggerAnalysis = async (cleanOwner: string, cleanRepo: string) => {
        setLoading(true);
        setError('');
        setRetryAttempt(0);

        const cacheKey = `${cleanOwner.toLowerCase()}/${cleanRepo.toLowerCase()}`;

        // Check cache first
        if (cache.current[cacheKey]) {
            setAnalysis(cache.current[cacheKey]);
            setLoading(false);
            addToHistory(cleanOwner, cleanRepo);
            return;
        }

        const maxRetries = 3;
        let attempt = 0;
        let delay = 1000;
        const url = `http://localhost:8080/api/github/analyze/${cleanOwner}/${cleanRepo}`;

        while (true) {
            try {
                const response = await axios.get<AnalysisResponse>(url);
                if (response.data && response.data.identity) {
                    cache.current[cacheKey] = response.data;
                    setAnalysis(response.data);
                    addToHistory(cleanOwner, cleanRepo);
                    break;
                } else {
                    throw new Error("UNEXPECTED_DATA_FORMAT");
                }
            } catch (err: any) {
                const isNetworkError = !err.response;
                const is502 = err.response?.status === 502;

                if (err.response?.status === 401) {
                    window.location.href = 'http://localhost:8080/oauth2/authorization/github';
                    return;
                }

                if ((isNetworkError || is502) && attempt < maxRetries) {
                    attempt++;
                    setRetryAttempt(attempt);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    delay *= 2;
                    continue;
                }

                if (err.response) {
                    const errMsg = err.response.data?.message || err.response.data?.error || "GENERIC_ERROR";
                    setError(errMsg);
                } else {
                    setError("CONNECTION_ERROR_DESC");
                }
                setAnalysis(null);
                break;
            }
        }
        setLoading(false);
        setRetryAttempt(0);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const cleanOwner = owner.trim();
        const cleanRepo = repo.trim();
        if (cleanOwner && cleanRepo) {
            navigate(`/${cleanOwner}/${cleanRepo}`);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            const cleanOwner = owner.trim();
            const cleanRepo = repo.trim();
            if (cleanOwner && cleanRepo) {
                navigate(`/${cleanOwner}/${cleanRepo}`);
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">

                {/* Header Bar */}
                <div className="flex justify-between items-center mb-10 bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            {t('title')}
                        </h1>
                        <p className="text-slate-500 text-xs mt-1">
                            {t('subtitle')}
                        </p>
                    </div>
                    <div className="flex items-center gap-4 font-sans">
                        {/* Selector de langue */}
                        <LanguageSelector currentLang={i18nInstance.language} onChange={(lang) => i18nInstance.changeLanguage(lang)} />

                        {isAuthenticated === true ? (
                            <div className="flex items-center gap-2.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={username} className="w-6 h-6 rounded-full border border-slate-200" />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                        {username.substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <span className="text-sm font-semibold text-slate-700">{username}</span>
                                <a
                                    href="http://localhost:8080/api/auth/logout"
                                    className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer border-l border-slate-200 pl-2.5 transition-colors"
                                >
                                    {t('logout')}
                                </a>
                            </div>
                        ) : isAuthenticated === false ? (
                            <button
                                onClick={handleLoginClick}
                                disabled={isLoggingIn}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium shadow-sm transition-all cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                            >
                                {isLoggingIn ? (
                                    <>
                                        <LoadingSpinner className="w-4 h-4 text-slate-400" />
                                        <span>{t('connecting')}</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                                        </svg>
                                        <span>{t('connectButton')}</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="w-32 h-8 bg-slate-100 animate-pulse rounded-lg"></div>
                        )}
                    </div>
                </div>

                {/* Formulaire de recherche */}
                <form onSubmit={handleSearchSubmit} className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6 transition-opacity ${isAuthenticated !== true ? 'opacity-80' : ''}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                {t('ownerLabel')}
                            </label>
                            <input
                                type="text"
                                value={owner}
                                onChange={(e) => setOwner(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isAuthenticated !== true}
                                placeholder={t('ownerPlaceholder')}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                {t('repoLabel')}
                            </label>
                            <input
                                type="text"
                                value={repo}
                                onChange={(e) => setRepo(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isAuthenticated !== true}
                                placeholder={t('repoPlaceholder')}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || isAuthenticated !== true}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-all cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed border disabled:border-slate-200/60"
                    >
                        {loading ? (
                            <>
                                <LoadingSpinner />
                                <span>{t('analyzing')}</span>
                            </>
                        ) : (
                            <>
                                <SearchIcon />
                                <span>{t('generateButton')}</span>
                            </>
                        )}
                    </button>

                    {isAuthenticated === false && (
                        <p className="text-center text-xs text-amber-600 font-semibold mt-3">
                            {t('loginRequired')}
                        </p>
                    )}

                    {/* Historique tag-pills */}
                    {history.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-slate-100">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <HistoryIcon />
                                <span>{t('recentSearchesTitle')}</span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {history.map((item, idx) => (
                                    <button
                                        type="button"
                                        key={idx}
                                        onClick={() => navigate(`/${item.owner}/${item.repo}`)}
                                        className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 text-sm font-medium transition-colors cursor-pointer border border-slate-200/50"
                                    >
                                        {item.owner}/{item.repo}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </form>

                {/* Messages d'erreur */}
                {error && (
                    <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-xl flex items-start gap-3 mb-6 shadow-sm">
                        <ErrorIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-red-800">{t('errorTitle')}</h4>
                            <p className="text-sm mt-0.5">{t(error)}</p>
                        </div>
                    </div>
                )}

                {/* Exponential Backoff Retries Info */}
                {loading && retryAttempt > 0 && (
                    <div className="bg-blue-50 text-blue-700 border border-blue-200 p-4 rounded-xl flex items-center gap-3 mb-6 shadow-sm animate-pulse">
                        <LoadingSpinner className="w-5 h-5 text-blue-500 shrink-0" />
                        <div>
                            <p className="font-medium">{t('syncing', { attempt: retryAttempt })}</p>
                        </div>
                    </div>
                )}

                {/* Dashboard principal / Skeleton Loader */}
                <div className="mt-8">
                    {loading ? (
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm animate-pulse">
                                <div className="h-5 bg-slate-200 rounded w-1/4 mb-4"></div>
                                <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm animate-pulse h-48"></div>
                                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm animate-pulse h-48"></div>
                            </div>
                        </div>
                    ) : analysis ? (
                        <div className="space-y-8">
                            {/* Titre principal et bouton d'export */}
                            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        {routeOwner} / {routeRepo}
                                    </h2>
                                    <p className="text-xs text-slate-400 font-sans">
                                        {t('subtitle')}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsMarkdownModalOpen(true)}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-sm transition-colors cursor-pointer font-sans"
                                >
                                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                    <span>{t('previewMarkdown')}</span>
                                </button>
                            </div>

                            {/* SECTION 1: Le Readme Dynamique */}
                            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2.5 mb-4 border-b border-slate-100 pb-3">
                                    <InfoIcon className="text-slate-400" />
                                    <h2 className="text-xl font-bold text-slate-900">{t('cardTitle')}</h2>
                                </div>

                                <p className="text-slate-700 leading-relaxed text-base mb-6">
                                    {analysis.identity.summary}
                                </p>

                                <div className="mb-6">
                                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                        {t('stackTitle')}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.identity.stack.map((item, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100"
                                            >
                                                {item.name} v{item.version} <span className="text-blue-400 ml-1.5 font-normal">({t(item.type)})</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                        {t('infraTitle')}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.identity.infrastructure.map((item, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                                                title={t(item.description)}
                                            >
                                                {item.name} <span className="text-slate-400 ml-1.5 font-normal">({t(item.description)})</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* SECTION 2: Configuration & Prérequis */}
                            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2.5 mb-4 border-b border-slate-100 pb-3">
                                    <SettingsIcon className="text-slate-400" />
                                    <h2 className="text-xl font-bold text-slate-900">{t('manifestTitle')}</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-1 border-r border-slate-100 pr-6">
                                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                            {t('prerequisites')}
                                        </h4>
                                        <ul className="space-y-2">
                                            {analysis.configManifest.prerequisites.map((req, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                                                    <span>{translatePrerequisite(req)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="md:col-span-2">
                                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                            {t('envVars')}
                                        </h4>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-slate-100">
                                                <thead>
                                                    <tr>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('envVarName')}</th>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('envVarSource')}</th>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('envVarDesc')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 text-sm">
                                                    {analysis.configManifest.variables.map((v, idx) => (
                                                        <tr key={idx} className="hover:bg-slate-50/50">
                                                            <td className="px-3 py-2 font-mono text-slate-800 font-medium">{v.name === "NONE" ? t("NONE") : v.name}</td>
                                                            <td className="px-3 py-2 text-slate-400 font-mono text-xs">{v.sourceFile}</td>
                                                            <td className="px-3 py-2 text-slate-500">{t(v.description)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* SECTION V3-1: Démarrage Rapide */}
                            {analysis.quickStart && (
                                <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
                                        <div className="flex items-center gap-2.5">
                                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                                                <polygon points="5 3 19 12 5 21 5 3" />
                                            </svg>
                                            <h2 className="text-xl font-bold text-slate-900">{t('quickStartTitle')}</h2>
                                        </div>
                                        <div className="flex items-center gap-2 font-sans">
                                            <label className="text-xs font-semibold text-slate-400 uppercase">{t('pkgManager')}:</label>
                                            <select
                                                value={packageManager}
                                                onChange={(e) => setPackageManager(e.target.value as any)}
                                                className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-sans"
                                            >
                                                <option value="native">{t('native')}</option>
                                                <option value="winget">Windows (Winget)</option>
                                                <option value="brew">macOS/Linux (Homebrew)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <p className="text-slate-500 text-xs mb-3 font-sans">
                                        {t('quickStartSub')}
                                    </p>

                                    {/* Terminal Selector */}
                                    <div className="flex bg-slate-100 p-1 rounded-md w-fit mb-4 border border-slate-200 font-sans">
                                        <button
                                            type="button"
                                            onClick={() => setTerminalType('bash')}
                                            className={`text-slate-500 hover:text-slate-700 px-3 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${terminalType === 'bash' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'border border-transparent'
                                                }`}
                                        >
                                            <span>Bash / Zsh (Mac/Linux)</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTerminalType('powershell')}
                                            className={`text-slate-500 hover:text-slate-700 px-3 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${terminalType === 'powershell' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'border border-transparent'
                                                }`}
                                        >
                                            <span>PowerShell (Windows)</span>
                                        </button>
                                    </div>

                                    <div className="relative bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-xs text-slate-800 whitespace-pre-wrap select-all">
                                        {(() => {
                                            const rawCmds = packageManager === 'winget' ? analysis.quickStart.wingetCommands :
                                                packageManager === 'brew' ? analysis.quickStart.brewCommands :
                                                    analysis.quickStart.nativeCommands;
                                            if (!rawCmds) return "No commands generated";
                                            if (terminalType === 'powershell') {
                                                return rawCmds.split(" && ").join("\n");
                                            }
                                            return rawCmds;
                                        })()}
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                const rawCmds = packageManager === 'winget' ? analysis.quickStart?.wingetCommands :
                                                    packageManager === 'brew' ? analysis.quickStart?.brewCommands :
                                                        analysis.quickStart?.nativeCommands;
                                                if (rawCmds) {
                                                    const cmds = terminalType === 'powershell' ? rawCmds.split(" && ").join("\n") : rawCmds;
                                                    await navigator.clipboard.writeText(cmds);
                                                    setCopiedCode(true);
                                                    setTimeout(() => setCopiedCode(false), 2000);
                                                }
                                            }}
                                            className="absolute top-3 right-3 px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded text-[10px] font-semibold transition-colors cursor-pointer font-sans"
                                        >
                                            {copiedCode ? t('copied') : t('copy')}
                                        </button>
                                    </div>

                                    {analysis.quickStart.hasCommittedEnv && (
                                        <div className="mt-4 p-4 bg-orange-50 text-orange-900 border border-orange-200 rounded-lg flex items-start gap-3">
                                            <svg className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                                <line x1="12" y1="9" x2="12" y2="13" />
                                                <line x1="12" y1="17" x2="12.01" y2="17" />
                                            </svg>
                                            <div className="text-xs font-medium font-sans">
                                                {t('ENV_WARNING')}
                                            </div>
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* SECTION 3: Fichiers Piliers */}
                            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2.5 mb-4 border-b border-slate-100 pb-3">
                                    <FolderIcon className="text-slate-400" />
                                    <h2 className="text-xl font-bold text-slate-900">{t('pivotalFilesTitle')}</h2>
                                </div>

                                <div className="space-y-3">
                                    {analysis.criticalFiles.map((file, idx) => (
                                        <div
                                            key={idx}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-slate-50 flex items-center justify-center border border-slate-200/50">
                                                    <CodeIcon className="text-slate-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-slate-800 text-sm">{file.name}</h4>
                                                    <p className="text-slate-400 text-xs font-mono">{file.path}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <p className="text-slate-500 text-xs sm:text-right max-w-sm sm:line-clamp-1">{translateCriticalFileReason(file.reason)}</p>
                                                <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 text-xs font-bold border border-orange-100">
                                                    {t('score')}: {file.score}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* SECTION V3-2: Radar de Dette Technique */}
                            {analysis.technicalDebt && (
                                <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-2.5 mb-4 border-b border-slate-100 pb-3">
                                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900">{t('techDebtTitle')}</h2>
                                            <p className="text-slate-400 text-xs font-sans mt-0.5">{t('techDebtSub')}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {analysis.technicalDebt.riskyFiles.map((file, idx) => {
                                            const normalizedScore = Math.min(file.riskScore, 100);
                                            let barColor = "bg-slate-300";
                                            if (file.riskCategory === "GOD_OBJECT" || normalizedScore > 70) {
                                                barColor = "bg-red-500";
                                            } else if (normalizedScore > 40) {
                                                barColor = "bg-orange-500";
                                            }
                                            return (
                                                <div key={idx} className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/30">
                                                    <div className="flex justify-between items-start gap-3 mb-2">
                                                        <div>
                                                            <span className="font-semibold text-slate-800 text-sm">{file.name}</span>
                                                            <p className="text-slate-400 text-xs font-mono truncate max-w-xs md:max-w-md">{file.path}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${file.riskCategory === "GOD_OBJECT" ? "bg-red-50 text-red-700 border border-red-100" : "bg-slate-100 text-slate-700 border border-slate-200"
                                                                }`}>
                                                                {t(file.riskCategory)}
                                                            </span>
                                                            <div className="text-[10px] text-slate-400 mt-1">
                                                                {t('size')}: {(file.sizeBytes / 1024).toFixed(1)} KB | {t('churn')}: {file.churn}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
                                                        <div className={`h-full ${barColor} transition-all`} style={{ width: `${normalizedScore}%` }}></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}

                            {/* SECTION V3-3: Points d'Entrée Applicatifs */}
                            {analysis.entryPoints && analysis.entryPoints.length > 0 && (
                                <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-2.5 mb-4 border-b border-slate-100 pb-3">
                                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3z" />
                                            <path d="M6 21a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3v12a3 3 0 0 0 3 3z" />
                                        </svg>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900">{t('entryPointsTitle')}</h2>
                                            <p className="text-slate-400 text-xs font-sans mt-0.5">{t('entryPointsSub')}</p>
                                        </div>
                                    </div>
                                    <div className="border-l-2 border-slate-100 pl-4 space-y-4">
                                        {analysis.entryPoints.map((ep, idx) => (
                                            <div key={idx} className="relative flex items-start gap-3">
                                                <div className="absolute -left-[22px] w-4 h-0.5 bg-slate-200 mt-2"></div>
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                                                <div className="min-w-0">
                                                    <span className="font-mono text-sm text-slate-800 font-semibold">{ep.name}</span>
                                                    <span className="text-slate-400 text-xs font-mono ml-2">({ep.path})</span>
                                                    <p className="text-slate-500 text-xs mt-0.5">{t(ep.description)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* SECTION 4: Les Gardiens du Temple */}
                            {analysis.topContributors && analysis.topContributors.length > 0 && (
                                <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-2.5 mb-4 border-b border-slate-100 pb-3">
                                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                        </svg>
                                        <h2 className="text-xl font-bold text-slate-900">{t('guardians')}</h2>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {analysis.topContributors.map((c, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                                                {c.avatarUrl ? (
                                                    <img src={c.avatarUrl} alt={c.name} className="w-9 h-9 rounded-full border border-slate-200 shrink-0" />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                                                        {c.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <h4 className="font-semibold text-slate-800 text-sm truncate">{c.name}</h4>
                                                    <p className="text-slate-400 text-xs">{c.commitCount} {t('commitsCount')}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* SECTION 5: Radar de Dépendances Majeures */}
                            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2.5 mb-4 border-b border-slate-100 pb-3">
                                    <CpuIcon className="text-slate-400" />
                                    <h2 className="text-xl font-bold text-slate-900">{t('radarTitle')}</h2>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/40">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('securityAuth')}</h3>
                                        <div className="flex flex-col gap-2">
                                            {analysis.dependencies.security.length > 0 && analysis.dependencies.security[0] !== "UNDETECTED" ? (
                                                analysis.dependencies.security.map((dep, idx) => (
                                                    <span key={idx} className="px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-medium shadow-sm font-mono truncate">{dep}</span>
                                                ))
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">{t('noDeps')}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/40">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('dataOrm')}</h3>
                                        <div className="flex flex-col gap-2">
                                            {analysis.dependencies.persistence.length > 0 && analysis.dependencies.persistence[0] !== "UNDETECTED" ? (
                                                analysis.dependencies.persistence.map((dep, idx) => (
                                                    <span key={idx} className="px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-medium shadow-sm font-mono truncate">{dep}</span>
                                                ))
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">{t('noDeps')}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/40">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('stateManagement')}</h3>
                                        <div className="flex flex-col gap-2">
                                            {analysis.dependencies.state.length > 0 && analysis.dependencies.state[0] !== "UNDETECTED" ? (
                                                analysis.dependencies.state.map((dep, idx) => (
                                                    <span key={idx} className="px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-medium shadow-sm font-mono truncate">{dep}</span>
                                                ))
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">{t('noDeps')}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/40">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('criticalTools')}</h3>
                                        <div className="flex flex-col gap-2">
                                            {analysis.dependencies.tools.length > 0 && analysis.dependencies.tools[0] !== "UNDETECTED" ? (
                                                analysis.dependencies.tools.map((dep, idx) => (
                                                    <span key={idx} className="px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-medium shadow-sm font-mono truncate">{dep}</span>
                                                ))
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">{t('noDeps')}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* SECTION V3-4: Audit de Conformité Légale */}
                            {analysis.licenceAudit && (
                                <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
                                        <div className="flex items-center gap-2.5">
                                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                            <div>
                                                <h2 className="text-xl font-bold text-slate-900">{t('licenceTitle')}</h2>
                                                <p className="text-slate-400 text-xs font-sans mt-0.5">{t('licenceSub')}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:items-end font-sans">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${analysis.licenceAudit.globalStatus === "COPYLEFT_WARNING"
                                                ? "bg-amber-50 text-amber-700 border-amber-100"
                                                : "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                }`}>
                                                {t(analysis.licenceAudit.globalStatus)}
                                            </span>
                                            <span className="text-[10px] text-slate-400 mt-1 font-mono font-medium">{t('globalLicence')}: {t(analysis.licenceAudit.mainLicence)}</span>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-slate-100 text-xs text-left">
                                            <thead>
                                                <tr>
                                                    <th className="px-3 py-2 font-bold text-slate-400 uppercase tracking-wider">{t('dependency')}</th>
                                                    <th className="px-3 py-2 font-bold text-slate-400 uppercase tracking-wider">{t('licence')}</th>
                                                    <th className="px-3 py-2 font-bold text-slate-400 uppercase tracking-wider">{t('commercialStatus')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {analysis.licenceAudit.details.map((item, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50/50">
                                                        <td className="px-3 py-2 font-mono font-medium text-slate-800">{item.dependencyName}</td>
                                                        <td className="px-3 py-2 font-mono text-slate-600">{item.licenceName}</td>
                                                        <td className="px-3 py-2">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${item.status === "RESTRICTED" ? "bg-red-50 text-red-600 border border-red-100" :
                                                                item.status === "WARNING" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                                                    "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                                }`}>
                                                                {t(item.status)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )}

                            {/* SECTION 6: Le Fil d'Ariane */}
                            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2.5 mb-6 border-b border-slate-100 pb-3">
                                    <CalendarIcon className="text-slate-400" />
                                    <h2 className="text-xl font-bold text-slate-900">{t('timeline')}</h2>
                                </div>

                                <div className="relative pl-6 border-l border-slate-200 ml-3 space-y-8">
                                    {analysis.decisions.slice().reverse().map((decision, idx) => (
                                        <div key={idx} className="relative">
                                            <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm"></div>

                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="font-bold text-slate-900 text-base leading-tight">
                                                        {decision.title}
                                                    </h4>
                                                    <span className="text-xs text-slate-400 font-mono font-medium">{decision.date}</span>
                                                </div>
                                                <p className="text-slate-500 text-sm leading-relaxed">{decision.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
                            <CodeIcon className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">{t('noAnalysisYet')}</p>
                            <p className="text-slate-400 text-sm mt-1">{t('noAnalysisSub')}</p>
                        </div>
                    )}
                </div>
            </div>
            {analysis && (
                <MarkdownPreviewModal
                    isOpen={isMarkdownModalOpen}
                    onClose={() => setIsMarkdownModalOpen(false)}
                    markdownText={generateMarkdownText(analysis, routeRepo || 'repo', t)}
                    repoName={routeRepo || 'repo'}
                    t={t}
                />
            )}
        </div>
    );
}

// Router root wrapper for AppContent routing
function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AppContent />} />
                <Route path="/:owner/:repo" element={<AppContent />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;