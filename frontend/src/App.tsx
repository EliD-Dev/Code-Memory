import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

axios.defaults.withCredentials = true;

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
}

interface Decision {
    title: string;
    description: string;
    date: string;
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
}

interface HistoryItem {
    owner: string;
    repo: string;
}

// Inline minimalist SVG Icons (stroke-width: 1.5, fill: none)
const SearchIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={"w-5 h-5" + className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </svg>
);

const HistoryIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={"w-4 h-4" + className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l4 2" />
    </svg>
);

const ErrorIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={"w-5 h-5" + className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
    </svg>
);

const CodeIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={"w-4 h-4" + className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="m18 16 4-4-4-4" />
        <path d="m6 8-4 4 4 4" />
        <path d="m14.5 4-5 16" />
    </svg>
);

const InfoIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={"w-5 h-5" + className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
    </svg>
);

const SettingsIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={"w-5 h-5" + className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const FolderIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={"w-5 h-5" + className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z" />
    </svg>
);

const CpuIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={"w-5 h-5" + className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
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
    <svg className={"w-5 h-5" + className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
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

function App() {
    const [owner, setOwner] = useState('EliD-Dev');
    const [repo, setRepo] = useState('EliD-Dev');
    const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [retryAttempt, setRetryAttempt] = useState(0);
    const [error, setError] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [username, setUsername] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

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

    const handleLogout = () => {
        window.location.href = 'http://localhost:8080/api/auth/logout';
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

    const fetchAnalysis = async (targetOwner = owner, targetRepo = repo) => {
        const cleanOwner = targetOwner.trim();
        const cleanRepo = targetRepo.trim();

        if (!cleanOwner || !cleanRepo) {
            setError("Veuillez saisir le propriétaire et le dépôt.");
            return;
        }

        setOwner(cleanOwner);
        setRepo(cleanRepo);
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
                    // Save to cache and state
                    cache.current[cacheKey] = response.data;
                    setAnalysis(response.data);
                    addToHistory(cleanOwner, cleanRepo);
                    break;
                } else {
                    throw new Error("Format de données d'analyse inattendu reçu.");
                }
            } catch (err: any) {
                const isNetworkError = !err.response;
                const is502 = err.response?.status === 502;

                if (err.response?.status === 401) {
                    // Redirect to OAuth
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

                // Translate status code to friendly French message
                if (err.response) {
                    const errMsg = err.response.data?.message || err.response.data?.error || "Une erreur est survenue lors de l'analyse.";
                    setError(errMsg);
                } else {
                    setError("Impossible de se connecter au moteur d'analyse. Veuillez vérifier que le serveur est démarré.");
                }
                setAnalysis(null);
                break;
            }
        }
        setLoading(false);
        setRetryAttempt(0);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            fetchAnalysis();
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                
                {/* Header Bar */}
                <div className="flex justify-between items-center mb-10 bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            Mémoire de Code
                        </h1>
                        <p className="text-slate-500 text-xs mt-1">
                            Carte d'identité et analyse d'architecture de votre codebase.
                        </p>
                    </div>
                    <div>
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
                                <button
                                    onClick={handleLogout}
                                    className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer border-l border-slate-200 pl-2.5 transition-colors"
                                >
                                    Déconnexion
                                </button>
                            </div>
                        ) : isAuthenticated === false ? (
                            <a
                                href="http://localhost:8080/oauth2/authorization/github"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium shadow-sm transition-colors cursor-pointer"
                            >
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                                </svg>
                                <span>Se connecter avec GitHub</span>
                            </a>
                        ) : (
                            <div className="w-32 h-8 bg-slate-100 animate-pulse rounded-lg"></div>
                        )}
                    </div>
                </div>

                {/* Formulaire de recherche */}
                <div className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6 transition-opacity ${isAuthenticated !== true ? 'opacity-80' : ''}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Propriétaire
                            </label>
                            <input
                                type="text"
                                value={owner}
                                onChange={(e) => setOwner(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isAuthenticated !== true}
                                placeholder="ex: facebook"
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Dépôt
                            </label>
                            <input
                                type="text"
                                value={repo}
                                onChange={(e) => setRepo(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isAuthenticated !== true}
                                placeholder="ex: react"
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => fetchAnalysis()}
                        disabled={loading || isAuthenticated !== true}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-all cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed border disabled:border-slate-200/60"
                    >
                        {loading ? (
                            <>
                                <LoadingSpinner />
                                <span>Analyse de la codebase en cours...</span>
                            </>
                        ) : (
                            <>
                                <SearchIcon />
                                <span>Générer l'analyse premium</span>
                            </>
                        )}
                    </button>

                    {isAuthenticated === false && (
                        <p className="text-center text-xs text-amber-600 font-semibold mt-3">
                            Veuillez vous connecter pour lancer une analyse.
                        </p>
                    )}

                    {/* Historique tag-pills */}
                    {history.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-slate-100">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <HistoryIcon />
                                <span>Dépôts consultés récemment</span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {history.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => fetchAnalysis(item.owner, item.repo)}
                                        className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 text-sm font-medium transition-colors cursor-pointer border border-slate-200/50"
                                    >
                                        {item.owner}/{item.repo}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Messages d'erreur */}
                {error && (
                    <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-xl flex items-start gap-3 mb-6 shadow-sm">
                        <ErrorIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-red-800">Erreur lors de l'analyse</h4>
                            <p className="text-sm mt-0.5">{error}</p>
                        </div>
                    </div>
                )}

                {/* Exponential Backoff Retries Info */}
                {loading && retryAttempt > 0 && (
                    <div className="bg-blue-50 text-blue-700 border border-blue-200 p-4 rounded-xl flex items-center gap-3 mb-6 shadow-sm animate-pulse">
                        <LoadingSpinner className="w-5 h-5 text-blue-500 shrink-0" />
                        <div>
                            <p className="font-medium">Synchronisation avec le moteur d'analyse en cours (tentative {retryAttempt}/3)...</p>
                        </div>
                    </div>
                )}

                {/* Dashboard principal / Skeleton Loader */}
                <div className="mt-8">
                    {loading ? (
                        // Premium Skeleton Loader
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
                            {/* SECTION 1: Le Readme Dynamique */}
                            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2.5 mb-4 border-b border-slate-100 pb-3">
                                    <InfoIcon className="text-slate-400" />
                                    <h2 className="text-xl font-bold text-slate-900">Carte d'Identité</h2>
                                </div>

                                {/* Résumé sémantique */}
                                <p className="text-slate-700 leading-relaxed text-base mb-6">
                                    {analysis.identity.summary}
                                </p>

                                {/* Stack technique réelle */}
                                <div className="mb-6">
                                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                        Stack Technique Détectée
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.identity.stack.map((item, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100"
                                            >
                                                {item.name} v{item.version} <span className="text-blue-400 ml-1.5 font-normal">({item.type})</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Outils d'infrastructure */}
                                <div>
                                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                        Outils d'Infrastructure
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.identity.infrastructure.map((item, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                                                title={item.description}
                                            >
                                                {item.name} <span className="text-slate-400 ml-1.5 font-normal">({item.description})</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* SECTION 2: Configuration & Prérequis */}
                            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2.5 mb-4 border-b border-slate-100 pb-3">
                                    <SettingsIcon className="text-slate-400" />
                                    <h2 className="text-xl font-bold text-slate-900">Manifeste de Configuration</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Prérequis système */}
                                    <div className="md:col-span-1 border-r border-slate-100 pr-6">
                                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                            Prérequis Système
                                        </h4>
                                        <ul className="space-y-2">
                                            {analysis.configManifest.prerequisites.map((req, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                                                    <span>{req}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Variables d'environnement */}
                                    <div className="md:col-span-2">
                                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                            Variables d'Environnement
                                        </h4>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-slate-100">
                                                <thead>
                                                    <tr>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Nom</th>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Source</th>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Rôle / Description</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 text-sm">
                                                    {analysis.configManifest.variables.map((v, idx) => (
                                                        <tr key={idx} className="hover:bg-slate-50/50">
                                                            <td className="px-3 py-2 font-mono text-slate-800 font-medium">{v.name}</td>
                                                            <td className="px-3 py-2 text-slate-400 font-mono text-xs">{v.sourceFile}</td>
                                                            <td className="px-3 py-2 text-slate-500">{v.description}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* SECTION 3: Fichiers Piliers */}
                            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2.5 mb-4 border-b border-slate-100 pb-3">
                                    <FolderIcon className="text-slate-400" />
                                    <h2 className="text-xl font-bold text-slate-900">Cartographie des Fichiers Piliers</h2>
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
                                                <p className="text-slate-500 text-xs sm:text-right max-w-sm sm:line-clamp-1">{file.reason}</p>
                                                <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 text-xs font-bold border border-orange-100">
                                                    Score: {file.score}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* SECTION 4: Radar de Dépendances Majeures */}
                            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2.5 mb-4 border-b border-slate-100 pb-3">
                                    <CpuIcon className="text-slate-400" />
                                    <h2 className="text-xl font-bold text-slate-900">Radar de Dépendances Majeures</h2>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                    {/* Sécurité */}
                                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/40">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Sécurité & Auth</h3>
                                        <div className="flex flex-col gap-2">
                                            {analysis.dependencies.security.length > 0 ? (
                                                analysis.dependencies.security.map((dep, idx) => (
                                                    <span key={idx} className="px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-medium shadow-sm font-mono truncate">{dep}</span>
                                                ))
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">Aucune</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Persistance */}
                                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/40">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Données & ORM</h3>
                                        <div className="flex flex-col gap-2">
                                            {analysis.dependencies.persistence.length > 0 ? (
                                                analysis.dependencies.persistence.map((dep, idx) => (
                                                    <span key={idx} className="px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-medium shadow-sm font-mono truncate">{dep}</span>
                                                ))
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">Aucune</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Gestion d'état */}
                                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/40">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Gestion d'État</h3>
                                        <div className="flex flex-col gap-2">
                                            {analysis.dependencies.state.length > 0 ? (
                                                analysis.dependencies.state.map((dep, idx) => (
                                                    <span key={idx} className="px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-medium shadow-sm font-mono truncate">{dep}</span>
                                                ))
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">Aucune</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Outils */}
                                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/40">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Outils Critiques</h3>
                                        <div className="flex flex-col gap-2">
                                            {analysis.dependencies.tools.length > 0 ? (
                                                analysis.dependencies.tools.map((dep, idx) => (
                                                    <span key={idx} className="px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-medium shadow-sm font-mono truncate">{dep}</span>
                                                ))
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">Aucune</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* SECTION 5: Le Fil d'Ariane */}
                            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2.5 mb-6 border-b border-slate-100 pb-3">
                                    <CalendarIcon className="text-slate-400" />
                                    <h2 className="text-xl font-bold text-slate-900">Le Fil d'Ariane (Décisions Clés)</h2>
                                </div>

                                <div className="relative pl-6 border-l border-slate-200 ml-3 space-y-8">
                                    {analysis.decisions.slice().reverse().map((decision, idx) => (
                                        <div key={idx} className="relative">
                                            {/* Bullet connector */}
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
                            <p className="text-slate-500 font-medium">Aucune analyse chargée pour le moment.</p>
                            <p className="text-slate-400 text-sm mt-1">Saisissez un propriétaire et un dépôt ci-dessus pour inspecter l'architecture.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;