package com.memoiredecode.api.service;

import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class GithubAnalysisService {

    private final WebClient webClient;

    public GithubAnalysisService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://api.github.com").build();
    }

    // Records for the analysis response
    public record AnalysisResponse(
            Identity identity,
            ConfigManifest configManifest,
            List<CriticalFile> criticalFiles,
            Dependencies dependencies,
            List<Decision> decisions,
            List<TopContributor> topContributors,
            QuickStartInfo quickStart,
            TechnicalDebt technicalDebt,
            List<EntryPoint> entryPoints,
            LicenceAudit licenceAudit) {
    }

    public record TopContributor(
            String name,
            String avatarUrl,
            int commitCount) {
    }

    public record Identity(
            String summary,
            List<StackItem> stack,
            List<InfrastructureItem> infrastructure) {
    }

    public record StackItem(String name, String version, String type) {
    }

    public record InfrastructureItem(String name, String description) {
    }

    public record ConfigManifest(
            List<EnvVar> variables,
            List<String> prerequisites) {
    }

    public record EnvVar(String name, String description, String sourceFile) {
    }

    public record CriticalFile(
            String name,
            String path,
            String reason,
            int score) {
    }

    public record Dependencies(
            List<String> security,
            List<String> persistence,
            List<String> state,
            List<String> tools,
            List<String> core) {
    }

    public record Decision(
            String title,
            String description,
            String date) {
    }

    public record TechnicalDebt(
            int globalRiskScore,
            List<TechnicalDebtFile> riskyFiles) {
    }

    public record TechnicalDebtFile(
            String name,
            String path,
            int sizeBytes,
            int churn,
            int riskScore,
            String riskCategory) {
    }

    public record EntryPoint(
            String name,
            String path,
            String description) {
    }

    public record LicenceAudit(
            String globalStatus,
            String mainLicence,
            List<DependencyLicence> details) {
    }

    public record DependencyLicence(
            String dependencyName,
            String licenceName,
            String status) {
    }

    // Main analysis flow
    public Mono<AnalysisResponse> analyzeRepository(String owner, String repo, String token) {
        String authHeader = "Bearer " + token;

        // 1. Get repository details
        Mono<Map> repoDetailsMono = this.webClient.get()
                .uri("/repos/{owner}/{repo}", owner, repo)
                .header("Authorization", authHeader)
                .header("Accept", "application/vnd.github.v3+json")
                .retrieve()
                .bodyToMono(Map.class);

        // 2. Get default branch
        return repoDetailsMono.flatMap(repoDetails -> {
            String defaultBranch = (String) repoDetails.getOrDefault("default_branch", "main");
            String repoDesc = (String) repoDetails.getOrDefault("description", "");

            // Get file list (tree API recursive)
            Mono<Map> treeMono = this.webClient.get()
                    .uri("/repos/{owner}/{repo}/git/trees/{branch}?recursive=1", owner, repo, defaultBranch)
                    .header("Authorization", authHeader)
                    .header("Accept", "application/vnd.github.v3+json")
                    .retrieve()
                    .bodyToMono(Map.class);

            // Get README base64
            Mono<Map> readmeMono = this.webClient.get()
                    .uri("/repos/{owner}/{repo}/readme", owner, repo)
                    .header("Authorization", authHeader)
                    .header("Accept", "application/vnd.github.v3+json")
                    .retrieve()
                    .bodyToMono(Map.class)
                    .onErrorResume(e -> Mono.just(Collections.emptyMap()));

            // Fetch up to 100 commits to get a comprehensive real history
            Mono<List> commitsMono = this.webClient.get()
                    .uri("/repos/{owner}/{repo}/commits?per_page=100", owner, repo)
                    .header("Authorization", authHeader)
                    .header("Accept", "application/vnd.github.v3+json")
                    .retrieve()
                    .bodyToMono(List.class);

            return Mono.zip(treeMono, readmeMono, commitsMono).flatMap(tuple -> {
                Map treeData = tuple.getT1();
                Map readmeData = tuple.getT2();
                List commitsData = tuple.getT3();

                List<Map> treeFiles = (List<Map>) treeData.getOrDefault("tree", Collections.emptyList());

                // Scan project root for pivot files
                Optional<String> composerJsonPath = findFilePath(treeFiles, "composer.json");
                Optional<String> packageJsonPath = findFilePath(treeFiles, "package.json");
                Optional<String> pomXmlPath = findFilePath(treeFiles, "pom.xml");
                Optional<String> buildGradlePath = findFilePath(treeFiles, "build.gradle");
                Optional<String> requirementsTxtPath = findFilePath(treeFiles, "requirements.txt");
                Optional<String> pyprojectTomlPath = findFilePath(treeFiles, "pyproject.toml");
                Optional<String> pubspecYamlPath = findFilePath(treeFiles, "pubspec.yaml");
                Optional<String> csprojPath = treeFiles.stream()
                        .map(f -> (String) f.get("path"))
                        .filter(path -> path != null && path.endsWith(".csproj"))
                        .findFirst();
                Optional<String> goModPath = findFilePath(treeFiles, "go.mod");

                Optional<String> dockerComposePath = findFilePath(treeFiles, "docker-compose.yml");
                if (dockerComposePath.isEmpty()) {
                    dockerComposePath = findFilePath(treeFiles, "docker-compose.yaml");
                }
                Optional<String> envTemplatePath = findFilePath(treeFiles, ".env.template");
                if (envTemplatePath.isEmpty()) {
                    envTemplatePath = findFilePath(treeFiles, ".env");
                }
                Optional<String> appPropertiesPath = findFilePath(treeFiles, "application.properties");
                Optional<String> appYmlPath = findFilePath(treeFiles, "application.yml");

                // Download contents in parallel with Anti-OOM safety
                List<Mono<Map.Entry<String, String>>> downloadMonos = List.of(
                        downloadFileContent(owner, repo, composerJsonPath, authHeader, treeFiles)
                                .map(c -> Map.entry("composerJson", c)),
                        downloadFileContent(owner, repo, packageJsonPath, authHeader, treeFiles)
                                .map(c -> Map.entry("packageJson", c)),
                        downloadFileContent(owner, repo, pomXmlPath, authHeader, treeFiles)
                                .map(c -> Map.entry("pomXml", c)),
                        downloadFileContent(owner, repo, buildGradlePath, authHeader, treeFiles)
                                .map(c -> Map.entry("buildGradle", c)),
                        downloadFileContent(owner, repo, requirementsTxtPath, authHeader, treeFiles)
                                .map(c -> Map.entry("requirementsTxt", c)),
                        downloadFileContent(owner, repo, pyprojectTomlPath, authHeader, treeFiles)
                                .map(c -> Map.entry("pyprojectToml", c)),
                        downloadFileContent(owner, repo, pubspecYamlPath, authHeader, treeFiles)
                                .map(c -> Map.entry("pubspecYaml", c)),
                        downloadFileContent(owner, repo, csprojPath, authHeader, treeFiles)
                                .map(c -> Map.entry("csproj", c)),
                        downloadFileContent(owner, repo, goModPath, authHeader, treeFiles)
                                .map(c -> Map.entry("goMod", c)),
                        downloadFileContent(owner, repo, dockerComposePath, authHeader, treeFiles)
                                .map(c -> Map.entry("dockerCompose", c)),
                        downloadFileContent(owner, repo, envTemplatePath, authHeader, treeFiles)
                                .map(c -> Map.entry("envTemplate", c)),
                        downloadFileContent(owner, repo, appPropertiesPath, authHeader, treeFiles)
                                .map(c -> Map.entry("appProperties", c)),
                        downloadFileContent(owner, repo, appYmlPath, authHeader, treeFiles)
                                .map(c -> Map.entry("appYml", c)));

                return Mono.zip(
                        downloadMonos,
                        results -> Arrays.stream(results)
                                .map(o -> (Map.Entry<String, String>) o)
                                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue)))
                        .flatMap(contents -> {
                            String readmeContent = decodeBase64((String) readmeData.get("content"));

                            // 1. Detect Stack
                            List<StackItem> stack = detectStack(contents);

                            // 2. Detect Infrastructure
                            List<InfrastructureItem> infrastructure = detectInfrastructure(
                                    contents.get("dockerCompose"),
                                    contents.get("appProperties"),
                                    contents.get("appYml"));

                            // 3. Extract Env Variables
                            List<EnvVar> variables = extractEnvVars(
                                    contents.get("envTemplate"),
                                    contents.get("appProperties"),
                                    contents.get("appYml"));

                            // 4. Prerequisites
                            List<String> prerequisites = getPrerequisites(stack, infrastructure);

                            // 5. Dependencies Radar
                            Dependencies dependencies = categorizeDependencies(contents);

                            // 6. Timeline and Summary
                            return generateSummaryAndDecisions(owner, repo, repoDesc, readmeContent, commitsData,
                                    authHeader)
                                    .flatMap(summaryAndDecisions -> {
                                        String summary = summaryAndDecisions.summary;
                                        List<Decision> decisions = summaryAndDecisions.decisions;

                                        // 7. Critical Files
                                        return getCriticalFilesScore(owner, repo, treeFiles, commitsData, authHeader)
                                                .flatMap(scoredFilesResult -> {
                                                    return getTopContributorsForFiles(owner, repo,
                                                            scoredFilesResult.criticalFiles(), authHeader)
                                                            .map(topContributors -> {
                                                                Identity identity = new Identity(summary, stack,
                                                                        infrastructure);
                                                                ConfigManifest configManifest = new ConfigManifest(
                                                                        variables, prerequisites);

                                                                QuickStartInfo quickStart = QuickStartService.generate(
                                                                        owner, repo, stack, infrastructure, treeFiles);
                                                                TechnicalDebt technicalDebt = getTechnicalDebt(
                                                                        treeFiles, scoredFilesResult.fileChurnMap());
                                                                List<EntryPoint> entryPoints = getEntryPoints(
                                                                        treeFiles);
                                                                LicenceAudit licenceAudit = getLicenceAudit(contents,
                                                                        treeFiles);

                                                                return new AnalysisResponse(
                                                                        identity,
                                                                        configManifest,
                                                                        scoredFilesResult.criticalFiles(),
                                                                        dependencies,
                                                                        decisions,
                                                                        topContributors,
                                                                        quickStart,
                                                                        technicalDebt,
                                                                        entryPoints,
                                                                        licenceAudit);
                                                            });
                                                });
                                    });
                        });
            });
        });
    }

    private Optional<String> findFilePath(List<Map> treeFiles, String targetName) {
        return treeFiles.stream()
                .map(f -> (String) f.get("path"))
                .filter(path -> path != null && (path.endsWith("/" + targetName) || path.equals(targetName)))
                .findFirst();
    }

    private Mono<String> downloadFileContent(String owner, String repo, Optional<String> path, String authHeader,
            List<Map> treeFiles) {
        if (path.isEmpty()) {
            return Mono.just("");
        }

        // Anti-OOM secure boundary: 2MB size limit
        String targetPath = path.get();
        long size = 0;
        if (treeFiles != null) {
            for (Map f : treeFiles) {
                if (targetPath.equals(f.get("path"))) {
                    Number sz = (Number) f.get("size");
                    if (sz != null) {
                        size = sz.longValue();
                    }
                    break;
                }
            }
        }

        if (size > 2 * 1024 * 1024) {
            System.err.println("IGNORE_LARGE_CONFIG_FILE: " + targetPath
                    + " (" + size + " bytes)");
            return Mono.just("");
        }

        return this.webClient.get()
                .uri("/repos/{owner}/{repo}/contents/{path}", owner, repo, targetPath)
                .header("Authorization", authHeader)
                .header("Accept", "application/vnd.github.v3+json")
                .retrieve()
                .bodyToMono(Map.class)
                .map(m -> decodeBase64((String) m.get("content")))
                .onErrorReturn("");
    }

    private String decodeBase64(String content) {
        if (content == null)
            return "";
        String cleaned = content.replaceAll("\\s", "");
        try {
            byte[] decoded = Base64.getDecoder().decode(cleaned);
            return new String(decoded, StandardCharsets.UTF_8);
        } catch (IllegalArgumentException e) {
            try {
                byte[] decoded = Base64.getMimeDecoder().decode(cleaned);
                return new String(decoded, StandardCharsets.UTF_8);
            } catch (Exception ex) {
                return "";
            }
        }
    }

    // Stack Detection (Polyglot) - Wrapped with try-catch
    private List<StackItem> detectStack(Map<String, String> contents) {
        List<StackItem> stack = new ArrayList<>();

        try {
            String composerJson = contents.getOrDefault("composerJson", "");
            String packageJson = contents.getOrDefault("packageJson", "");
            String pomXml = contents.getOrDefault("pomXml", "");
            String buildGradle = contents.getOrDefault("buildGradle", "");
            String requirementsTxt = contents.getOrDefault("requirementsTxt", "");
            String pyprojectToml = contents.getOrDefault("pyprojectToml", "");
            String pubspecYaml = contents.getOrDefault("pubspecYaml", "");
            String csproj = contents.getOrDefault("csproj", "");
            String goMod = contents.getOrDefault("goMod", "");

            // 1. PHP/Composer
            if (!composerJson.isEmpty()) {
                String phpVer = extractRegex(composerJson, "\"php\"\\s*:\\s*\"([^\"]+)\"", 1);
                stack.add(new StackItem("PHP", phpVer.isEmpty() ? "8.x" : cleanVersion(phpVer), "MAIN_LANGUAGE"));
                if (composerJson.contains("symfony/")) {
                    String ver = extractRegex(composerJson, "\"symfony/framework-bundle\"\\s*:\\s*\"([^\"]+)\"", 1);
                    stack.add(new StackItem("Symfony", ver.isEmpty() ? "6.x" : cleanVersion(ver), "BACKEND_FRAMEWORK"));
                }
                if (composerJson.contains("laravel/")) {
                    String ver = extractRegex(composerJson, "\"laravel/framework\"\\s*:\\s*\"([^\"]+)\"", 1);
                    stack.add(
                            new StackItem("Laravel", ver.isEmpty() ? "10.x" : cleanVersion(ver), "BACKEND_FRAMEWORK"));
                }
                if (composerJson.contains("api-platform/core")) {
                    String ver = extractRegex(composerJson, "\"api-platform/core\"\\s*:\\s*\"([^\"]+)\"", 1);
                    stack.add(
                            new StackItem("API Platform", ver.isEmpty() ? "3.x" : cleanVersion(ver), "API_FRAMEWORK"));
                }
            }

            // 2. Python
            if (!requirementsTxt.isEmpty() || !pyprojectToml.isEmpty()) {
                String pyVer = extractRegex(pyprojectToml, "requires-python\\s*=\\s*\"([^\"]+)\"", 1);
                stack.add(new StackItem("Python", pyVer.isEmpty() ? "3.x" : cleanVersion(pyVer), "MAIN_LANGUAGE"));
                String combinedPy = requirementsTxt + "\n" + pyprojectToml;
                if (combinedPy.toLowerCase().contains("django")) {
                    String ver = extractRegex(combinedPy, "(?i)django==([0-9.]+)", 1);
                    stack.add(new StackItem("Django", ver.isEmpty() ? "5.x" : ver, "BACKEND_FRAMEWORK"));
                }
                if (combinedPy.toLowerCase().contains("flask")) {
                    String ver = extractRegex(combinedPy, "(?i)flask==([0-9.]+)", 1);
                    stack.add(new StackItem("Flask", ver.isEmpty() ? "3.x" : ver, "BACKEND_FRAMEWORK"));
                }
                if (combinedPy.toLowerCase().contains("fastapi")) {
                    String ver = extractRegex(combinedPy, "(?i)fastapi==([0-9.]+)", 1);
                    stack.add(new StackItem("FastAPI", ver.isEmpty() ? "0.x" : ver, "BACKEND_FRAMEWORK"));
                }
            }

            // 3. Dart/Flutter
            if (!pubspecYaml.isEmpty()) {
                stack.add(new StackItem("Dart", "3.x", "MAIN_LANGUAGE"));
                if (pubspecYaml.contains("sdk: flutter") || pubspecYaml.contains("flutter:")) {
                    stack.add(new StackItem("Flutter", "3.x", "MOBILE_WEB_FRAMEWORK"));
                }
            }

            // 4. C# / .NET
            if (!csproj.isEmpty()) {
                String netVer = extractRegex(csproj, "<TargetFramework>([^<]+)</TargetFramework>", 1);
                stack.add(new StackItem("C#", "12", "MAIN_LANGUAGE"));
                stack.add(new StackItem(".NET", netVer.isEmpty() ? "8.0" : netVer, "BACKEND_FRAMEWORK"));
            }

            // 5. Go
            if (!goMod.isEmpty()) {
                String goVer = extractRegex(goMod, "go\\s+([0-9.]+)", 1);
                stack.add(new StackItem("Go", goVer.isEmpty() ? "1.x" : goVer, "MAIN_LANGUAGE"));
            }

            // 6. Java/Kotlin
            if (!pomXml.isEmpty() || !buildGradle.isEmpty()) {
                boolean isKotlin = buildGradle.contains("kotlin") || pomXml.contains("kotlin");
                stack.add(new StackItem(isKotlin ? "Kotlin" : "Java", "17", "MAIN_LANGUAGE"));
                String combinedJava = pomXml + "\n" + buildGradle;
                if (combinedJava.contains("spring-boot")) {
                    String ver = extractRegex(combinedJava, "<version>([^<]+)</version>", 1);
                    stack.add(new StackItem("Spring Boot", ver.isEmpty() ? "3.x" : cleanVersion(ver),
                            "BACKEND_FRAMEWORK"));
                }
                if (combinedJava.contains("quarkus")) {
                    stack.add(new StackItem("Quarkus", "3.x", "BACKEND_FRAMEWORK"));
                }
            }

            // 7. JavaScript/TypeScript (Only prioritizing if no backend pivot language has
            // been loaded)
            if (!packageJson.isEmpty() && stack.isEmpty()) {
                boolean hasTS = packageJson.contains("\"typescript\"") || packageJson.contains("\"@types/");
                stack.add(new StackItem(hasTS ? "TypeScript" : "JavaScript", "ES6+", "MAIN_LANGUAGE"));
                if (packageJson.contains("\"react\"")) {
                    String ver = extractRegex(packageJson, "\"react\"\\s*:\\s*\"([^\"]+)\"", 1);
                    stack.add(new StackItem("React", ver.isEmpty() ? "18.x" : cleanVersion(ver), "FRONTEND_FRAMEWORK"));
                }
                if (packageJson.contains("\"next\"")) {
                    String ver = extractRegex(packageJson, "\"next\"\\s*:\\s*\"([^\"]+)\"", 1);
                    stack.add(new StackItem("Next.js", ver.isEmpty() ? "14.x" : cleanVersion(ver),
                            "FRONTEND_META_FRAMEWORK"));
                }
                if (packageJson.contains("\"vue\"")) {
                    String ver = extractRegex(packageJson, "\"vue\"\\s*:\\s*\"([^\"]+)\"", 1);
                    stack.add(new StackItem("Vue.js", ver.isEmpty() ? "3.x" : cleanVersion(ver), "FRONTEND_FRAMEWORK"));
                }
                if (packageJson.contains("\"@angular/core\"")) {
                    String ver = extractRegex(packageJson, "\"@angular/core\"\\s*:\\s*\"([^\"]+)\"", 1);
                    stack.add(
                            new StackItem("Angular", ver.isEmpty() ? "17.x" : cleanVersion(ver), "FRONTEND_FRAMEWORK"));
                }
                if (packageJson.contains("\"nuxt\"")) {
                    String ver = extractRegex(packageJson, "\"nuxt\"\\s*:\\s*\"([^\"]+)\"", 1);
                    stack.add(
                            new StackItem("Nuxt.js", ver.isEmpty() ? "3.x" : cleanVersion(ver), "FRONTEND_FRAMEWORK"));
                }
                if (packageJson.contains("\"@nestjs/core\"")) {
                    String ver = extractRegex(packageJson, "\"@nestjs/core\"\\s*:\\s*\"([^\"]+)\"", 1);
                    stack.add(new StackItem("NestJS", ver.isEmpty() ? "10.x" : cleanVersion(ver), "BACKEND_FRAMEWORK"));
                }
            }
        } catch (Exception e) {
            System.err.println("ERROR_STACK_DETECTION: " + e.getMessage());
        }

        if (stack.isEmpty()) {
            stack.add(new StackItem("Polyglot/Generic", "N/A", "REPOSITORY_STRUCTURE"));
        }

        return stack;
    }

    // Infrastructure Detection - Wrapped with try-catch
    private List<InfrastructureItem> detectInfrastructure(String dockerCompose, String appProperties, String appYml) {
        List<InfrastructureItem> infra = new ArrayList<>();

        try {
            if (!dockerCompose.isEmpty()) {
                infra.add(new InfrastructureItem("Docker", "DOCKER_CONTAINERIZATION"));
                if (dockerCompose.contains("postgres")) {
                    infra.add(new InfrastructureItem("PostgreSQL", "RELATIONAL_DB_DOCKER"));
                }
                if (dockerCompose.contains("mysql")) {
                    infra.add(new InfrastructureItem("MySQL", "RELATIONAL_DB_DOCKER"));
                }
                if (dockerCompose.contains("redis")) {
                    infra.add(new InfrastructureItem("Redis", "CACHE_MESSAGE_BROKER_DOCKER"));
                }
                if (dockerCompose.contains("kafka")) {
                    infra.add(new InfrastructureItem("Kafka", "DISTRIBUTED_MESSAGE_BROKER_DOCKER"));
                }
            }

            String combinedConfigs = appProperties + "\n" + appYml;
            if (combinedConfigs.contains("postgresql") || combinedConfigs.contains("postgres")) {
                if (infra.stream().noneMatch(i -> i.name().equals("PostgreSQL"))) {
                    infra.add(new InfrastructureItem("PostgreSQL", "DB_DETECTED_IN_CONFIG"));
                }
            }
            if (combinedConfigs.contains("mysql") || combinedConfigs.contains("jdbc:mysql")) {
                if (infra.stream().noneMatch(i -> i.name().equals("MySQL"))) {
                    infra.add(new InfrastructureItem("MySQL", "DB_DETECTED_IN_CONFIG"));
                }
            }
            if (combinedConfigs.contains("redis")) {
                if (infra.stream().noneMatch(i -> i.name().equals("Redis"))) {
                    infra.add(new InfrastructureItem("Redis", "REDIS_CLIENT_CONFIG_DETECTED"));
                }
            }
        } catch (Exception e) {
            System.err
                    .println("ERROR_INFRASTRUCTURE" + e.getMessage());
        }

        if (infra.isEmpty()) {
            infra.add(new InfrastructureItem("Local/Host Direct", "NO_INFRA_DETECTED"));
        }

        return infra;
    }

    // Env Vars Extraction - Wrapped with try-catch
    private List<EnvVar> extractEnvVars(String envTemplate, String appProperties, String appYml) {
        Set<String> uniqueVars = new TreeSet<>();
        List<EnvVar> variables = new ArrayList<>();

        try {
            if (!envTemplate.isEmpty()) {
                Pattern p = Pattern.compile("^[A-Z_0-9]+", Pattern.MULTILINE);
                Matcher m = p.matcher(envTemplate);
                while (m.find()) {
                    String varName = m.group();
                    if (uniqueVars.add(varName)) {
                        variables.add(new EnvVar(varName, "PROJECT_ENV_VAR", ".env.template"));
                    }
                }
            }

            String configContent = appProperties + "\n" + appYml;
            Pattern placeholderPattern = Pattern.compile("\\$\\{([A-Z_0-9]+)(?::[^}]*)?\\}");
            Matcher m2 = placeholderPattern.matcher(configContent);
            while (m2.find()) {
                String varName = m2.group(1);
                if (uniqueVars.add(varName)) {
                    String sourceFile = appProperties.contains(varName) ? "application.properties" : "application.yml";
                    variables.add(new EnvVar(varName, "APP_CONFIG_ENV_VAR", sourceFile));
                }
            }
        } catch (Exception e) {
            System.err
                    .println("ERROR_ENV_VAR" + e.getMessage());
        }

        if (variables.isEmpty()) {
            variables.add(new EnvVar("NONE", "NO_ENV_VAR_DETECTED", "N/A"));
        }

        return variables;
    }

    // Prerequisites
    private List<String> getPrerequisites(List<StackItem> stack, List<InfrastructureItem> infrastructure) {
        List<String> prereqs = new ArrayList<>();

        Optional<StackItem> javaOpt = stack.stream().filter(s -> s.name().equals("Java") || s.name().equals("Kotlin"))
                .findFirst();
        javaOpt.ifPresent(stackItem -> prereqs.add("REQ_JAVA_" + stackItem.version()));

        Optional<StackItem> reactOpt = stack.stream()
                .filter(s -> s.name().equals("React") || s.name().equals("Vue.js") || s.name().equals("Angular"))
                .findFirst();
        if (reactOpt.isPresent()
                || stack.stream().anyMatch(s -> s.name().equals("TypeScript") || s.name().equals("JavaScript"))) {
            prereqs.add("REQ_NODE");
        }

        if (infrastructure.stream().anyMatch(i -> i.name().equals("Docker"))) {
            prereqs.add("REQ_DOCKER");
        }

        for (InfrastructureItem item : infrastructure) {
            if (item.name().equals("PostgreSQL")) {
                prereqs.add("REQ_POSTGRES");
            } else if (item.name().equals("MySQL")) {
                prereqs.add("REQ_MYSQL");
            } else if (item.name().equals("Redis")) {
                prereqs.add("REQ_REDIS");
            } else if (item.name().equals("Kafka")) {
                prereqs.add("REQ_KAFKA");
            }
        }

        if (prereqs.isEmpty()) {
            prereqs.add("NO_PREREQS");
        }

        return prereqs;
    }

    // Dependencies Radar - Try-Catch per file wrapping
    private Dependencies categorizeDependencies(Map<String, String> contents) {
        List<String> security = new ArrayList<>();
        List<String> persistence = new ArrayList<>();
        List<String> state = new ArrayList<>();
        List<String> tools = new ArrayList<>();
        List<String> core = new ArrayList<>();

        for (Map.Entry<String, String> entry : contents.entrySet()) {
            String filename = entry.getKey();
            String fileContent = entry.getValue();
            if (fileContent.isEmpty())
                continue;

            try {
                if (filename.equals("packageJson") || filename.equals("composerJson")) {
                    Pattern p = Pattern.compile("\"([^\"]+)\"\\s*:\\s*\"([^\"]+)\"");
                    Matcher m = p.matcher(fileContent);
                    while (m.find()) {
                        String depName = m.group(1);
                        classifyDependency(depName, security, persistence, state, tools, core);
                    }
                } else if (filename.equals("pomXml")) {
                    Pattern depPattern = Pattern.compile("<artifactId>([^<]+)</artifactId>");
                    Matcher m = depPattern.matcher(fileContent);
                    while (m.find()) {
                        String depName = m.group(1);
                        classifyDependency(depName, security, persistence, state, tools, core);
                    }
                } else if (filename.equals("buildGradle") || filename.equals("requirementsTxt")
                        || filename.equals("pubspecYaml") || filename.equals("pyprojectToml")
                        || filename.equals("goMod")) {
                    Pattern p = Pattern.compile("^[a-zA-Z0-9_./-]+", Pattern.MULTILINE);
                    Matcher m = p.matcher(fileContent);
                    while (m.find()) {
                        String depName = m.group();
                        classifyDependency(depName, security, persistence, state, tools, core);
                    }
                }
            } catch (Exception e) {
                System.err.println("ERROR_DEPENDENCIES" + filename + " : " + e.getMessage());
            }
        }

        // Distinct lists
        List<String> finalSec = security.stream().distinct().limit(10).collect(Collectors.toList());
        List<String> finalPers = persistence.stream().distinct().limit(10).collect(Collectors.toList());
        List<String> finalState = state.stream().distinct().limit(10).collect(Collectors.toList());
        List<String> finalTools = tools.stream().distinct().limit(10).collect(Collectors.toList());
        List<String> finalCore = core.stream().distinct().limit(10).collect(Collectors.toList());

        // Fill empty lists with "Non détecté"
        if (finalSec.isEmpty())
            finalSec = List.of("UNDETECTED");
        if (finalPers.isEmpty())
            finalPers = List.of("UNDETECTED");
        if (finalState.isEmpty())
            finalState = List.of("UNDETECTED");
        if (finalTools.isEmpty())
            finalTools = List.of("UNDETECTED");
        if (finalCore.isEmpty())
            finalCore = List.of("UNDETECTED");

        return new Dependencies(finalSec, finalPers, finalState, finalTools, finalCore);
    }

    private void classifyDependency(String name, List<String> security, List<String> persistence, List<String> state,
            List<String> tools, List<String> core) {
        String lower = name.toLowerCase();

        // 1. Core & Framework
        if (lower.contains("symfony/framework-bundle") || lower.contains("laravel/framework") ||
                lower.contains("spring-boot-starter") || lower.contains("flutter") ||
                lower.equals("react") || lower.equals("next") || lower.equals("vue") || lower.equals("angular") ||
                lower.equals("django") || lower.equals("fastapi") || lower.equals("flask") || lower.contains("quarkus")
                ||
                lower.contains("gin-gonic/gin") || lower.contains("api-platform/core") || lower.contains("nest")) {
            core.add(name);
        }
        // 2. Sécurité & Auth
        else if (lower.contains("security") || lower.contains("oauth") || lower.contains("jwt") ||
                lower.contains("passport") || lower.contains("auth") || lower.contains("bcrypt") ||
                lower.contains("keycloak") || lower.contains("guardian") || lower.contains("crypto")) {
            security.add(name);
        }
        // 3. Données & ORM
        else if (lower.contains("doctrine") || lower.contains("hibernate") || lower.contains("prisma") ||
                lower.contains("mongoose") || lower.contains("sql") || lower.contains("redis") ||
                lower.contains("pg") || lower.contains("mysql") || lower.contains("spring-data") ||
                lower.contains("r2dbc") || lower.contains("sqlalchemy") || lower.contains("peewee") ||
                lower.contains("gorm")) {
            persistence.add(name);
        }
        // 4. Gestion d'État
        else if (lower.contains("redux") || lower.contains("zustand") || lower.contains("recoil") ||
                lower.contains("query") || lower.contains("swr") || lower.contains("context")) {
            state.add(name);
        }
        // 5. Outils Critiques
        else if (lower.contains("axios") || lower.contains("date-fns") || lower.contains("lodash") ||
                lower.contains("uuid") || lower.contains("vite") || lower.contains("webflux") ||
                lower.contains("reactive") || lower.contains("http") || lower.contains("client") ||
                lower.contains("gson") || lower.contains("jackson")) {
            tools.add(name);
        }
    }

    private record SummaryAndDecisions(String summary, List<Decision> decisions) {
    }

    private int calculateBaseScore(String message) {
        if (message == null)
            return 0;
        String lower = message.toLowerCase();
        int score = 0;

        // Foundation: +50 (EN, FR, ES)
        String[] foundationKeywords = { "init", "setup", "start", "base", "config", "debut", "initialisation",
                "configuracion", "inicio" };
        for (String keyword : foundationKeywords) {
            if (lower.contains(keyword)) {
                score += 50;
            }
        }

        // Arch/Domain: +40 (EN, FR, ES)
        String[] archKeywords = { "crud", "role", "voter", "auth", "security", "login", "api", "database", "table",
                "entity", "migration", "docker", "seguridad", "modelo" };
        for (String keyword : archKeywords) {
            if (lower.contains(keyword)) {
                score += 40;
            }
        }

        // Quality: +30 (EN, FR, ES)
        String[] qualityKeywords = { "test", "phpunit", "jest", "ci", "pipeline", "filtre", "filtro", "prueba" };
        for (String keyword : qualityKeywords) {
            if (lower.contains(keyword)) {
                score += 30;
            }
        }

        // Exclusions: -100 (EN, FR, ES)
        String[] exclusionKeywords = { "typo", "oubli", "fix", "wip", "readme", "license", "arreglo", "olvido",
                "error" };
        for (String keyword : exclusionKeywords) {
            if (lower.contains(keyword)) {
                score -= 100;
            }
        }

        return score;
    }

    private Mono<SummaryAndDecisions> generateSummaryAndDecisions(String owner, String repo, String repoDesc,
            String readmeContent, List commitsData, String authHeader) {
        List<Map> rawCommits = (List<Map>) commitsData;

        if (rawCommits == null || rawCommits.isEmpty()) {
            String summary = generateHeuristicSummary(repo, repoDesc, readmeContent);
            return Mono.just(new SummaryAndDecisions(summary, Collections.emptyList()));
        }

        // Identify the very first commit (oldest, last in the list)
        Map oldestCommitRaw = rawCommits.get(rawCommits.size() - 1);
        String oldestSha = (String) oldestCommitRaw.get("sha");

        // Calculate base scores for all commits
        class ScoredCommitCandidate {
            final Map rawCommit;
            final String sha;
            int score;
            String message;
            String date;

            ScoredCommitCandidate(Map rawCommit) {
                this.rawCommit = rawCommit;
                this.sha = (String) rawCommit.get("sha");
                Map commitDetails = (Map) rawCommit.get("commit");
                if (commitDetails != null) {
                    this.message = (String) commitDetails.get("message");
                    Map author = (Map) commitDetails.get("author");
                    if (author != null) {
                        String dStr = (String) author.get("date");
                        this.date = dStr != null && dStr.length() >= 10 ? dStr.substring(0, 10) : "";
                    }
                }
                this.score = calculateBaseScore(this.message);
            }
        }

        List<ScoredCommitCandidate> candidates = rawCommits.stream()
                .map(ScoredCommitCandidate::new)
                .collect(Collectors.toList());

        // We want to fetch detailed stats for:
        // - The oldest commit
        // - The newest commit (candidates.get(0))
        // - Top scoring candidates (excluding oldest, and filtering out score < -50)
        Set<String> shasToFetch = new LinkedHashSet<>();
        shasToFetch.add(oldestSha);
        shasToFetch.add(candidates.get(0).sha);

        List<ScoredCommitCandidate> sortedByBaseScore = candidates.stream()
                .filter(c -> !c.sha.equals(oldestSha))
                .filter(c -> c.score >= -50)
                .sorted((c1, c2) -> Integer.compare(c2.score, c1.score))
                .collect(Collectors.toList());

        for (ScoredCommitCandidate c : sortedByBaseScore) {
            shasToFetch.add(c.sha);
            if (shasToFetch.size() >= 15)
                break; // Fetch detailed stats for max 15 commits
        }

        // Fetch details of all candidates in parallel using Flux
        return Flux.fromIterable(shasToFetch)
                .flatMap(sha -> this.webClient.get()
                        .uri("/repos/{owner}/{repo}/commits/{sha}", owner, repo, sha)
                        .header("Authorization", authHeader)
                        .header("Accept", "application/vnd.github.v3+json")
                        .retrieve()
                        .bodyToMono(Map.class)
                        .onErrorReturn(Collections.emptyMap()))
                .collectList()
                .map(detailedList -> {
                    // Map detailed info back to candidate scores
                    Map<String, Map> detailedMap = detailedList.stream()
                            .filter(m -> m != null && !m.isEmpty())
                            .collect(Collectors.toMap(m -> (String) m.get("sha"), m -> m, (a, b) -> a));

                    // Recalculate scores with technical impact (+20)
                    List<ScoredCommitCandidate> evaluated = candidates.stream()
                            .map(c -> {
                                Map detail = detailedMap.get(c.sha);
                                if (detail != null) {
                                    Map stats = (Map) detail.get("stats");
                                    List files = (List) detail.get("files");
                                    int additions = 0;
                                    int filesCount = 0;
                                    if (stats != null) {
                                        Number addNum = (Number) stats.get("additions");
                                        if (addNum != null)
                                            additions = addNum.intValue();
                                    }
                                    if (files != null) {
                                        filesCount = files.size();
                                    }

                                    if (filesCount > 5 || additions > 100) {
                                        c.score += 20;
                                    }
                                }
                                return c;
                            })
                            .collect(Collectors.toList());

                    // Find oldest jalon (Creation)
                    ScoredCommitCandidate oldestCandidate = evaluated.stream()
                            .filter(c -> c.sha.equals(oldestSha))
                            .findFirst()
                            .orElse(evaluated.get(evaluated.size() - 1));

                    // Remove oldest from remaining pool
                    List<ScoredCommitCandidate> pool = evaluated.stream()
                            .filter(c -> !c.sha.equals(oldestSha))
                            .filter(c -> c.score >= -50)
                            .sorted((c1, c2) -> Integer.compare(c2.score, c1.score))
                            .collect(Collectors.toList());

                    // Select top 4 commits with highest score, enforcing temporal deduplication
                    List<ScoredCommitCandidate> selected = new ArrayList<>();
                    Set<String> selectedDates = new HashSet<>();
                    selectedDates.add(oldestCandidate.date);

                    for (ScoredCommitCandidate c : pool) {
                        if (selected.size() >= 4)
                            break;
                        if (selectedDates.add(c.date)) {
                            selected.add(c);
                        }
                    }

                    // Merge and sort chronologically
                    List<Decision> decisions = new ArrayList<>();
                    decisions.add(new Decision(
                            cleanCommitMessage(oldestCandidate.message),
                            cleanCommitMessage(oldestCandidate.message),
                            oldestCandidate.date));

                    for (ScoredCommitCandidate c : selected) {
                        decisions.add(new Decision(
                                cleanCommitMessage(c.message),
                                cleanCommitMessage(c.message),
                                c.date));
                    }

                    // Sort chronologically (oldest first)
                    decisions.sort((d1, d2) -> d1.date().compareTo(d2.date()));

                    // Keep max 5 items
                    if (decisions.size() > 5) {
                        decisions = decisions.subList(0, 5);
                    }

                    String summary = generateHeuristicSummary(repo, repoDesc, readmeContent);
                    return new SummaryAndDecisions(summary, decisions);
                });
    }

    public record ScoredFilesResult(
            List<CriticalFile> criticalFiles,
            Map<String, Integer> fileChurnMap) {
    }

    // Critical Files Scoring (with STRICT exclusions)
    private Mono<ScoredFilesResult> getCriticalFilesScore(String owner, String repo, List<Map> treeFiles,
            List commitsData, String authHeader) {
        // Step 1: Filter out vendors, locks, styles, cache, and configuration files
        List<Map> sourceFiles = treeFiles.stream()
                .filter(f -> {
                    String path = (String) f.get("path");
                    String type = (String) f.get("type");
                    if (path == null || !"blob".equals(type))
                        return false;
                    return !isExcludedFile(path);
                })
                .collect(Collectors.toList());

        // Step 2: Fetch files modified in recent commits (churn)
        Map<String, Integer> fileChurnMap = new HashMap<>();
        List<String> shas = new ArrayList<>();
        if (commitsData != null) {
            for (Object obj : commitsData) {
                if (obj instanceof Map && shas.size() < 5) {
                    shas.add((String) ((Map) obj).get("sha"));
                }
            }
        }

        List<Mono<List<String>>> fileChangesMonos = shas.stream()
                .map(sha -> this.webClient.get()
                        .uri("/repos/{owner}/{repo}/commits/{sha}", owner, repo, sha)
                        .header("Authorization", authHeader)
                        .header("Accept", "application/vnd.github.v3+json")
                        .retrieve()
                        .bodyToMono(Map.class)
                        .map(m -> {
                            List<Map> files = (List<Map>) m.get("files");
                            if (files == null)
                                return Collections.<String>emptyList();
                            return files.stream()
                                    .map(f -> (String) f.get("filename"))
                                    .filter(Objects::nonNull)
                                    .collect(Collectors.toList());
                        })
                        .onErrorReturn(Collections.emptyList()))
                .collect(Collectors.toList());

        return Mono.zip(fileChangesMonos, results -> {
            for (Object resultList : results) {
                List<String> filenames = (List<String>) resultList;
                for (String name : filenames) {
                    fileChurnMap.put(name, fileChurnMap.getOrDefault(name, 0) + 1);
                }
            }

            // Step 3: Compute final score
            List<CriticalFile> allScored = new ArrayList<>();

            for (Map f : sourceFiles) {
                String path = (String) f.get("path");
                if (path == null)
                    continue;

                String name = path.substring(path.lastIndexOf('/') + 1);
                int score = 10; // Base score

                // Name importance keywords
                String lower = name.toLowerCase();
                if (lower.contains("controller") || lower.contains("service") || lower.contains("config") ||
                        lower.contains("security") || lower.contains("store") || lower.contains("context") ||
                        lower.contains("route") || lower.contains("app") || lower.contains("main")) {
                    score += 40;
                }

                // File size / code amount factor (cap at 20)
                Number sizeNum = (Number) f.get("size");
                int size = sizeNum != null ? sizeNum.intValue() : 0;
                score += Math.min(size / 1000, 20);

                // Churn factor (frequency of recent changes)
                int churn = fileChurnMap.getOrDefault(path, 0);
                score += churn * 30;

                String reason = "PROJECT_STRUCT_SEMANTIC_IMPORTANCE";
                if (churn > 0) {
                    reason = "HIGH_CHURN_COUNT:" + churn;
                } else if (score > 30) {
                    reason = "STATIC_PIVOT_COMPONENT";
                }

                allScored.add(new CriticalFile(name, path, reason, score));
            }

            // Step 4: Sort and limit to 10
            List<CriticalFile> criticals = allScored.stream()
                    .sorted((f1, f2) -> Integer.compare(f2.score(), f1.score()))
                    .limit(10)
                    .collect(Collectors.toList());

            return new ScoredFilesResult(criticals, fileChurnMap);
        });
    }

    private boolean isExcludedFile(String path) {
        if (path == null)
            return true;
        String lower = path.toLowerCase();

        // Lock files (STRICT EXCLUSION)
        if (lower.endsWith(".lock") || lower.endsWith("-lock.json") || lower.endsWith(".sum")
                || lower.equals("go.sum")) {
            return true;
        }

        // Directories (STRICT EXCLUSION)
        if (lower.contains("/vendor/") || lower.startsWith("vendor/") ||
                lower.contains("/node_modules/") || lower.startsWith("node_modules/") ||
                lower.contains("/dist/") || lower.startsWith("dist/") ||
                lower.contains("/build/") || lower.startsWith("build/") ||
                lower.contains("/var/cache/") || lower.startsWith("var/cache/") ||
                lower.contains("/out/") || lower.startsWith("out/") ||
                lower.contains("/target/") || lower.startsWith("target/")) {
            return true;
        }

        // Config / Non-business files (STRICT EXCLUSION)
        String name = path.substring(path.lastIndexOf('/') + 1).toLowerCase();
        if (name.startsWith(".") ||
                name.equals("gitignore") ||
                name.equals("eslint") ||
                name.contains("eslint") ||
                name.startsWith("phpunit") ||
                name.equals("pom.xml") ||
                name.equals("package.json") ||
                name.equals("composer.json") ||
                name.equals("go.mod") ||
                name.equals("go.sum") ||
                name.equals("package-lock.json") ||
                name.equals("yarn.lock") ||
                name.equals("pnpm-lock.yaml") ||
                name.equals("babel.config.js") ||
                name.equals("tsconfig.json") ||
                name.equals("vite.config.ts") ||
                name.equals("tailwind.config.js") ||
                name.equals("postcss.config.js") ||
                name.endsWith(".md") ||
                name.endsWith(".png") ||
                name.endsWith(".jpg") ||
                name.endsWith(".svg") ||
                name.endsWith(".ico") ||
                name.endsWith(".css") ||
                name.endsWith(".scss")) {
            return true;
        }

        return false;
    }

    private String generateHeuristicSummary(String repo, String repoDesc, String readmeContent) {
        if (repoDesc != null && !repoDesc.trim().isEmpty()) {
            return repoDesc.trim();
        }

        if (readmeContent != null && !readmeContent.isEmpty()) {
            String[] lines = readmeContent.split("\n");
            for (String line : lines) {
                String clean = line.trim().replaceAll("[#*`_-]", "");
                if (clean.length() > 30 && !clean.toLowerCase().contains("memoire de code")) {
                    return clean.substring(0, Math.min(clean.length(), 150)) + ".";
                }
            }
        }

        return "Projet " + repo
                + " analysé automatiquement. Ce dépôt contient une architecture structurée avec des composants d'intégration Git.";
    }

    private record ContributorInfo(String name, String avatarUrl, int commitCount) {
    }

    private Mono<List<TopContributor>> getTopContributorsForFiles(String owner, String repo,
            List<CriticalFile> criticalFiles, String authHeader) {
        if (criticalFiles == null || criticalFiles.isEmpty()) {
            return Mono.just(Collections.emptyList());
        }

        List<Mono<List<Map>>> fileCommitsMonos = criticalFiles.stream()
                .limit(5)
                .map(cf -> this.webClient.get()
                        .uri("/repos/{owner}/{repo}/commits?path={path}&per_page=15", owner, repo, cf.path())
                        .header("Authorization", authHeader)
                        .header("Accept", "application/vnd.github.v3+json")
                        .retrieve()
                        .bodyToMono(List.class)
                        .map(list -> {
                            List<Map> res = new ArrayList<>();
                            if (list != null) {
                                for (Object o : list) {
                                    if (o instanceof Map) {
                                        res.add((Map) o);
                                    }
                                }
                            }
                            return res;
                        })
                        .onErrorReturn(Collections.emptyList()))
                .collect(Collectors.toList());

        return Mono.zip(fileCommitsMonos, results -> {
            Map<String, ContributorInfo> contributorsMap = new HashMap<>();
            for (Object resultListObj : results) {
                List<Map> commitList = (List<Map>) resultListObj;
                for (Map commitMap : commitList) {
                    if (commitMap == null)
                        continue;

                    Map authorMap = (Map) commitMap.get("author");
                    Map commitDetail = (Map) commitMap.get("commit");
                    Map gitAuthor = commitDetail != null ? (Map) commitDetail.get("author") : null;

                    String login = null;
                    String avatarUrl = null;
                    if (authorMap != null) {
                        login = (String) authorMap.get("login");
                        avatarUrl = (String) authorMap.get("avatar_url");
                    }

                    String name = login;
                    if (name == null && gitAuthor != null) {
                        name = (String) gitAuthor.get("name");
                    }

                    if (name == null || name.trim().isEmpty()) {
                        continue;
                    }

                    if (avatarUrl == null || avatarUrl.trim().isEmpty()) {
                        avatarUrl = "";
                    }

                    ContributorInfo info = contributorsMap.getOrDefault(name, new ContributorInfo(name, avatarUrl, 0));
                    if (info.avatarUrl().isEmpty() && !avatarUrl.isEmpty()) {
                        info = new ContributorInfo(name, avatarUrl, info.commitCount());
                    }
                    contributorsMap.put(name, new ContributorInfo(name, info.avatarUrl(), info.commitCount() + 1));
                }
            }

            return contributorsMap.values().stream()
                    .sorted((c1, c2) -> Integer.compare(c2.commitCount(), c1.commitCount()))
                    .limit(3)
                    .map(c -> new TopContributor(c.name(), c.avatarUrl(), c.commitCount()))
                    .collect(Collectors.toList());
        });
    }

    private String cleanCommitMessage(String msg) {
        if (msg == null)
            return "";
        return msg.split("\n")[0].trim();
    }

    private String cleanVersion(String v) {
        if (v == null)
            return "N/A";
        return v.replaceAll("[^0-9.]", "");
    }

    private String extractRegex(String content, String regex, int group) {
        if (content == null || content.isEmpty())
            return "";
        Pattern pattern = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(content);
        if (matcher.find()) {
            return matcher.group(group).trim();
        }
        return "";
    }

    private TechnicalDebt getTechnicalDebt(List<Map> treeFiles, Map<String, Integer> fileChurnMap) {
        List<TechnicalDebtFile> riskyFiles = new ArrayList<>();

        List<Map> sourceFiles = treeFiles.stream()
                .filter(f -> {
                    String path = (String) f.get("path");
                    String type = (String) f.get("type");
                    if (path == null || !"blob".equals(type))
                        return false;
                    return !isExcludedFile(path);
                })
                .collect(Collectors.toList());

        for (Map f : sourceFiles) {
            String path = (String) f.get("path");
            if (path == null)
                continue;

            String name = path.substring(path.lastIndexOf('/') + 1);
            Number sizeNum = (Number) f.get("size");
            int sizeBytes = sizeNum != null ? sizeNum.intValue() : 0;
            int churn = fileChurnMap.getOrDefault(path, 0);

            // Risk score croise churn et size
            int riskScore = (churn * 30) + (sizeBytes / 1000);

            // Categorization
            String riskCategory = "STABLE";
            if (sizeBytes > 15000 && churn >= 2) {
                riskCategory = "GOD_OBJECT";
            } else if (riskScore > 50) {
                riskCategory = "MODERATE_DEBT";
            }

            riskyFiles.add(new TechnicalDebtFile(name, path, sizeBytes, churn, riskScore, riskCategory));
        }

        List<TechnicalDebtFile> top3Risky = riskyFiles.stream()
                .sorted((f1, f2) -> Integer.compare(f2.riskScore(), f1.riskScore()))
                .limit(3)
                .collect(Collectors.toList());

        int globalRiskScore = top3Risky.stream()
                .mapToInt(TechnicalDebtFile::riskScore)
                .max()
                .orElse(0);

        return new TechnicalDebt(globalRiskScore, top3Risky);
    }

    private List<EntryPoint> getEntryPoints(List<Map> treeFiles) {
        List<EntryPoint> entryPoints = new ArrayList<>();
        if (treeFiles == null)
            return entryPoints;

        for (Map f : treeFiles) {
            String path = (String) f.get("path");
            if (path == null)
                continue;

            String lower = path.toLowerCase();
            String name = path.substring(path.lastIndexOf('/') + 1);

            if (name.equals("main.tsx") || name.equals("main.jsx") || name.equals("index.tsx")
                    || name.equals("index.jsx")) {
                entryPoints.add(new EntryPoint(name, path, "DOM_ENTRYPOINT"));
            } else if (name.equals("App.tsx") || name.equals("App.jsx") || name.equals("App.vue")) {
                entryPoints.add(new EntryPoint(name, path, "ROOT_COMPONENT"));
            } else if (lower.startsWith("src/app/page.tsx") || lower.startsWith("app/page.tsx")
                    || lower.startsWith("src/pages/index.tsx") || lower.startsWith("pages/index.tsx")) {
                entryPoints.add(new EntryPoint(name, path, "NEXT_PAGE_ROUTE"));
            } else if (name.endsWith("Application.java") || name.endsWith("SpringBootApplication.java")) {
                entryPoints.add(new EntryPoint(name, path, "SPRING_APPLICATION"));
            } else if (lower.endsWith("routes/web.php") || lower.endsWith("routes/api.php")) {
                entryPoints.add(new EntryPoint(name, path, "LARAVEL_ROUTES"));
            } else if (lower.contains("controller/") && (name.endsWith(".php") || name.endsWith(".java"))) {
                entryPoints.add(new EntryPoint(name, path, "API_CONTROLLER"));
            } else if (name.equals("main.go")) {
                entryPoints.add(new EntryPoint(name, path, "GO_ENTRYPOINT"));
            } else if (name.equals("manage.py") || name.equals("main.py") || name.equals("app.py")) {
                entryPoints.add(new EntryPoint(name, path, "PYTHON_SCRIPT"));
            }
        }

        return entryPoints.stream().limit(5).collect(Collectors.toList());
    }

    private LicenceAudit getLicenceAudit(Map<String, String> contents, List<Map> treeFiles) {
        String mainLicence = "UNSPECIFIED";

        boolean hasLicenseFile = treeFiles.stream()
                .map(f -> (String) f.get("path"))
                .filter(Objects::nonNull)
                .anyMatch(path -> {
                    String upper = path.toUpperCase();
                    return upper.equals("LICENSE") || upper.equals("LICENSE.MD") || upper.equals("COPYING")
                            || upper.equals("LICENSE.TXT");
                });

        if (contents.get("packageJson") != null) {
            String pJson = contents.get("packageJson");
            mainLicence = extractRegex(pJson, "\"license\"\\s*:\\s*\"([^\"]+)\"", 1);
        }
        if ((mainLicence == null || mainLicence.isEmpty() || "UNSPECIFIED".equals(mainLicence))
                && contents.get("composerJson") != null) {
            String cJson = contents.get("composerJson");
            mainLicence = extractRegex(cJson, "\"license\"\\s*:\\s*\"([^\"]+)\"", 1);
        }

        if ((mainLicence == null || mainLicence.isEmpty()) && hasLicenseFile) {
            mainLicence = "MIT";
        }
        if (mainLicence == null || mainLicence.isEmpty()) {
            mainLicence = "UNSPECIFIED";
        }

        String globalStatus = "COMMERCIAL_READY";
        String mainLicenceLower = mainLicence.toLowerCase();
        if (mainLicenceLower.contains("gpl") || mainLicenceLower.contains("agpl")) {
            globalStatus = "COPYLEFT_WARNING";
        }

        List<DependencyLicence> details = new ArrayList<>();
        Dependencies dependencies = categorizeDependencies(contents);

        Set<String> allDeps = new LinkedHashSet<>();
        allDeps.addAll(dependencies.security());
        allDeps.addAll(dependencies.persistence());
        allDeps.addAll(dependencies.state());
        allDeps.addAll(dependencies.tools());
        if (dependencies.core() != null) {
            allDeps.addAll(dependencies.core());
        }

        for (String dep : allDeps) {
            if ("UNDETECTED".equals(dep)) {
                continue;
            }
            String depName = dep.toLowerCase();
            String lic = "MIT";
            String status = "ALLOWED";

            if (depName.contains("hibernate")) {
                lic = "LGPL 2.1";
                status = "WARNING";
            } else if (depName.contains("mysql-connector") || depName.contains("gpl")) {
                lic = "GPL v2";
                status = "RESTRICTED";
            } else if (depName.contains("spring") || depName.contains("jackson") || depName.contains("apache")) {
                lic = "Apache 2.0";
                status = "ALLOWED";
            } else {
                lic = "MIT";
                status = "ALLOWED";
            }

            if (status.equals("RESTRICTED") || status.equals("WARNING")) {
                globalStatus = "COPYLEFT_WARNING";
            }

            details.add(new DependencyLicence(dep, lic, status));
        }

        return new LicenceAudit(globalStatus, mainLicence, details);
    }
}
