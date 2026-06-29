package com.memoiredecode.api.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class QuickStartService {

    public static QuickStartInfo generate(
        String owner,
        String repo,
        List<GithubAnalysisService.StackItem> stack, 
        List<GithubAnalysisService.InfrastructureItem> infrastructure,
        List<Map> treeFiles
    ) {
        List<String> winget = new ArrayList<>();
        List<String> brew = new ArrayList<>();
        List<String> nativ = new ArrayList<>();

        // Add git clone and cd systematically
        winget.add("git clone https://github.com/" + owner + "/" + repo + ".git");
        winget.add("cd " + repo);

        brew.add("git clone https://github.com/" + owner + "/" + repo + ".git");
        brew.add("cd " + repo);

        nativ.add("git clone https://github.com/" + owner + "/" + repo + ".git");
        nativ.add("cd " + repo);

        // Env file logic
        boolean hasCommittedEnv = false;
        String envSourceFile = null;

        if (treeFiles != null) {
            for (Map f : treeFiles) {
                String path = (String) f.get("path");
                if (path == null) continue;
                String lower = path.toLowerCase();
                if (lower.equals(".env")) {
                    hasCommittedEnv = true;
                } else if (lower.equals(".env.template") || lower.equals(".env.example") || 
                           lower.equals(".env.dist") || lower.equals(".env.test") || 
                           (lower.startsWith(".env.") && !lower.contains("/"))) {
                    if (envSourceFile == null) {
                        envSourceFile = path;
                    }
                }
            }
        }

        if (!hasCommittedEnv && envSourceFile != null) {
            winget.add("copy " + envSourceFile + " .env");
            brew.add("cp " + envSourceFile + " .env");
            nativ.add("cp " + envSourceFile + " .env");
        }

        boolean hasDocker = false;
        boolean hasPostgres = false;
        boolean hasMysql = false;
        boolean hasRedis = false;

        // Middlewares / Infrastructure
        if (infrastructure != null) {
            for (GithubAnalysisService.InfrastructureItem infra : infrastructure) {
                String name = infra.name().toLowerCase();
                if (name.contains("docker")) {
                    hasDocker = true;
                    winget.add("winget install Docker.DockerDesktop");
                    brew.add("brew install --cask docker");
                }
                if (name.contains("postgres")) {
                    hasPostgres = true;
                    winget.add("winget install PostgreSQL.PostgreSQL");
                    brew.add("brew install postgresql");
                }
                if (name.contains("mysql")) {
                    hasMysql = true;
                    winget.add("winget install Oracle.MySQL");
                    brew.add("brew install mysql");
                }
                if (name.contains("redis")) {
                    hasRedis = true;
                    winget.add("winget install Redis.Redis");
                    brew.add("brew install redis");
                }
            }
        }

        // Start non-docker local middlewares if present
        if (!hasDocker) {
            if (hasPostgres) {
                nativ.add("pg_ctl -D /usr/local/var/postgres start");
            }
            if (hasMysql) {
                nativ.add("mysql.server start");
            }
            if (hasRedis) {
                nativ.add("redis-server");
            }
        }

        // Languages & Frameworks
        boolean isNode = false;
        boolean isPhp = false;
        boolean isSymfony = false;
        boolean isLaravel = false;
        boolean isJava = false;
        boolean isPython = false;
        boolean isGo = false;
        boolean isDotnet = false;
        boolean isDart = false;

        if (stack != null) {
            for (GithubAnalysisService.StackItem item : stack) {
                String name = item.name().toLowerCase();
                if (name.contains("node") || name.contains("react") || name.contains("angular") || 
                    name.contains("vue") || name.contains("next") || name.contains("nuxt") || name.contains("nest") ||
                    name.contains("javascript") || name.contains("typescript")) {
                    isNode = true;
                }
                if (name.contains("php") || name.contains("symfony") || name.contains("laravel")) {
                    isPhp = true;
                    if (name.contains("symfony")) isSymfony = true;
                    if (name.contains("laravel")) isLaravel = true;
                }
                if (name.contains("java") || name.contains("kotlin") || name.contains("spring")) {
                    isJava = true;
                }
                if (name.contains("python") || name.contains("django") || name.contains("flask") || name.contains("fastapi")) {
                    isPython = true;
                }
                if (name.contains("go")) {
                    isGo = true;
                }
                if (name.contains("c#") || name.contains(".net") || name.contains("dotnet")) {
                    isDotnet = true;
                }
                if (name.contains("dart") || name.contains("flutter")) {
                    isDart = true;
                }
            }
        }

        String runCommand = null;

        if (isNode) {
            winget.add("winget install OpenJS.NodeJS");
            brew.add("brew install node");
            nativ.add("npm install");
            runCommand = "npm run dev";
        }
        else if (isPhp) {
            winget.add("winget install PHP.Development");
            brew.add("brew install php");
            nativ.add("composer install");
            if (isSymfony) {
                runCommand = "symfony server:start";
            } else if (isLaravel) {
                runCommand = "php artisan serve";
            } else {
                runCommand = "php -S 127.0.0.1:8000 -t public";
            }
        }
        else if (isJava) {
            winget.add("winget install Eclipse.Temurin.JDK.17");
            brew.add("brew install openjdk@17");
            nativ.add("./mvnw clean package");
            runCommand = "./mvnw spring-boot:run";
        }
        else if (isPython) {
            winget.add("winget install Python.Python.3");
            brew.add("brew install python");
            nativ.add("pip install -r requirements.txt");
            runCommand = "python main.py";
        }
        else if (isGo) {
            winget.add("winget install GoLang.Go");
            brew.add("brew install go");
            nativ.add("go build");
            runCommand = "go run main.go";
        }
        else if (isDotnet) {
            winget.add("winget install Microsoft.DotNet.SDK.8");
            brew.add("brew install dotnet");
            nativ.add("dotnet build");
            runCommand = "dotnet run";
        }
        else if (isDart) {
            winget.add("winget install Dart.Dart");
            brew.add("brew install dart");
            nativ.add("pub get");
            runCommand = "flutter run";
        }

        // Add launching/run command at the end (Docker compose has priority if present)
        if (hasDocker) {
            nativ.add("docker compose up -d");
        } else if (runCommand != null) {
            nativ.add(runCommand);
        }

        return new QuickStartInfo(
            String.join(" && ", winget),
            String.join(" && ", brew),
            String.join(" && ", nativ),
            hasCommittedEnv
        );
    }
}
