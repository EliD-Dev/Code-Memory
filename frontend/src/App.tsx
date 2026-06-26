import { useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { GitCommit, AlertCircle } from 'lucide-react'; // ← removed GitHub

axios.defaults.withCredentials = true;

interface CommitInfo {
    sha: string;
    commit: {
        message: string;
        author: { name: string; date: string };
    };
}

// Simple GitHub Octocat SVG component
const GitHubIcon = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ display: 'block' }}>
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
);

function App() {
    const [owner, setOwner] = useState('EliD-Dev');
    const [repo, setRepo] = useState('EliD-Dev');
    const [commits, setCommits] = useState<CommitInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchCommits = async () => {
        setLoading(true);
        setError('');
        try {
            const cleanOwner = owner.trim();
            const cleanRepo = repo.trim();
            const response = await axios.get(`http://localhost:8080/api/github/commits/${cleanOwner}/${cleanRepo}`);

            // Sécurité : on vérifie que la donnée est bien un tableau
            if (Array.isArray(response.data)) {
                setCommits(response.data);
            } else if (response.data && response.data.message) {
                // Cas où GitHub renvoie une erreur JSON (ex: Not Found)
                setError(`Erreur GitHub : ${response.data.message}`);
                setCommits([]);
            } else {
                setError("Format de données inattendu reçu de l'API.");
                setCommits([]);
            }

        } catch (err: any) {
            if (err.response?.status === 401) {
                window.location.href = 'http://localhost:8080/oauth2/authorization/github';
            } else {
                setError("Erreur lors de la récupération. Le dépôt existe-t-il ?");
                setCommits([]);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
            <h1>Mémoire de Code - MVP</h1>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <input
                    value={owner}
                    onChange={e => setOwner(e.target.value)}
                    placeholder="Owner (ex: facebook)"
                    style={{ padding: '0.5rem' }}
                />
                <input
                    value={repo}
                    onChange={e => setRepo(e.target.value)}
                    placeholder="Repo (ex: react)"
                    style={{ padding: '0.5rem' }}
                />
                <button onClick={fetchCommits} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                    <GitHubIcon size={18} />  {/* ← inline SVG */}
                    {loading ? 'Ingestion...' : 'Générer la Timeline'}
                </button>
            </div>

            {error && (
                <div style={{ color: 'red', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            <div style={{ borderLeft: '2px solid #ddd', paddingLeft: '1rem' }}>
                {Array.isArray(commits) && commits.map((c) => (
                    <div key={c.sha} style={{ marginBottom: '1.5rem', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '-1.85rem', background: 'white', padding: '0.2rem' }}>
                            <GitCommit size={20} color="#666" />
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.2rem' }}>
                            {format(new Date(c.commit.author.date), 'dd MMM yyyy, HH:mm')} par {c.commit.author.name}
                        </div>
                        <div style={{ fontWeight: 'bold' }}>{c.commit.message.split('\n')[0]}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;