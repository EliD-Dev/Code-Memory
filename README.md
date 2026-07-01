<div align="center">
  <h1>Code Memory</h1>
  <h3>Semantic analysis and architectural mapping for developers</h3>
  <p>
    <img src="https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB&style=flat-square" alt="React" />
    <img src="https://img.shields.io/badge/Spring_Boot-F2F4F9?logo=spring-boot&logoColor=6DB33F&style=flat-square" alt="Spring Boot" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white&style=flat-square" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/License-MIT-3b82f6?style=flat-square" alt="License MIT" />
  </p>
</div>

---

## Semantic Summary

> Code Memory is an enterprise-grade static analysis platform designed to inspect codebase architectures, track technological stack configurations, estimate technical debt risk, and facilitate developer onboarding with collaborative file annotations.
<hr>

## Core Features

<table>
  <thead>
    <tr>
      <th align="left">Feature</th>
      <th align="left">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>Real Stack Detector</b></td>
      <td>Statically scans project repositories for pivot files and detects backend, frontend, database, mobile, and container configurations. Supports Java, Kotlin, Swift, Rust, Ruby, Elixir, Go, C#, Python, and JS/TS stacks.</td>
    </tr>
    <tr>
      <td><b>Technical Debt Radar</b></td>
      <td>Maps critical files by tracking commit churn and file sizes to calculate a risk score index, highlighting components that need refactoring.</td>
    </tr>
    <tr>
      <td><b>Automated Quick Start</b></td>
      <td>Generates tailored environment setup commands (winget, Homebrew, native OS) dynamically generated for the specific repository configurations.</td>
    </tr>
    <tr>
      <td><b>Collaborative Knowledge Layer</b></td>
      <td>Allows developers to append, read, and moderate annotations directly on analyzed source code files, easing team alignment.</td>
    </tr>
    <tr>
      <td><b>BYOT Security</b></td>
      <td>Secures user quotas with a Personal Access Token (PAT) input. Jeton keys are encrypted end-to-end using AES-256 before database storage.</td>
    </tr>
  </tbody>
</table>

---

## Architecture

- **Frontend Interface**: React single-page application, TailwindCSS for premium styling, react-router-dom for navigation.
- **Backend API**: Reactive Spring Boot application with WebFlux, Spring Security OAuth2, and Spring Data JPA.
- **Data Persistence**: Managed PostgreSQL database.

Live Production URL: [https://code-memory.eli-dev.fr](https://code-memory.eli-dev.fr)

---

## Local Setup & Quick Start

<details>
  <summary>Click to expand setup instructions</summary>

### Prerequisites

- Java Development Kit (JDK) 17 or higher
- Node.js 18 or higher with npm
- PostgreSQL database instance

### Steps to Run

1. Clone the project repository:
   ```bash
   git clone https://github.com/EliD-Dev/Code-Memory.git
   cd Code-Memory
   ```

2. Create a `.env` file at the root using `.env.template` as a model:
   ```env
    # Github OAuth 
    # Tutorial : https://github.com/settings/developers -> New OAuth App 
    # Homepage URL = http://localhost:8080
    # Authorization callback URL = http://localhost:8080/login/oauth2/code/github
    GITHUB_CLIENT_ID=your_github_oauth_id
    GITHUB_CLIENT_SECRET=your_github_oauth_secret

    # Database
    SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/
    SPRING_DATASOURCE_USERNAME=postgres
    SPRING_DATASOURCE_PASSWORD=postgres

    # App
    # Tutorial : https://randomkeygen.com/encryption-key
    APP_ENCRYPTION_KEY=your_aes_32_character_security_key

    FRONTEND_URL=http://localhost:5173
   ```

3. Launch the development servers:
   - **On Windows (PowerShell)**:
     ```powershell
     ./start-dev.ps1
     ```
   - **On Linux / macOS (Bash)**:
     ```bash
     chmod +x start-dev.sh
     ./start-dev.sh
     ```
</details>

---

## Legal & Compliance

This platform is operated by **[SASU EliDev](https://eli-dev.fr/)**. All GitHub Personal Access Tokens submitted by users to increase GitHub API rate limits are encrypted using AES-256 before database persistence. Users can access, edit, or delete their profile information and search history at any time.

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
