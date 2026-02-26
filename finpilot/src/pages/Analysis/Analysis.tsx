import { useState, useEffect } from 'react';
import { Download, AlertTriangle, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import styles from './Analysis.module.css';

export function Analysis() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [analysisData, setAnalysisData] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const response = await fetch(`${API_URL}/api/analysis/monthly`, { credentials: 'include' });
                const data = await response.json();
                if (data.message) {
                    setAnalysisData(null);
                } else {
                    setAnalysisData(data.analysis);
                    setStats(data.stats);
                }
            } catch (error) {
                console.error("Erreur de chargement de l'analyse:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalysis();
    }, []);

    const handleGeneratePDF = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            alert('PDF feature is under construction for the backend !');
        }, 2000);
    };

    if (isLoading) {
        return (
            <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Loader2 size={48} className="animate-spin text-primary" />
            </div>
        );
    }

    if (!analysisData) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Analyse Mensuelle</h1>
                        <p className={styles.subtitle}>Pas assez de données pour l'analyse.</p>
                    </div>
                </div>
                <Card>
                    <p>Ajoutez des factures pour découvrir votre analyse financière !</p>
                </Card>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Analyse Mensuelle</h1>
                    <p className={styles.subtitle}>Bilan de l'Intelligence Artificielle</p>
                </div>
                <Button onClick={handleGeneratePDF} disabled={isGenerating}>
                    {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                    {isGenerating ? "Création du PDF..." : "Générer mon bilan PDF"}
                </Button>
            </div>

            <Card style={{ marginBottom: '1.5rem', backgroundColor: 'rgba(56, 189, 248, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Synthèse de l'IA</h3>
                    <div style={{ padding: '4px 12px', borderRadius: '12px', backgroundColor: 'var(--color-primary)', color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>
                        Score de Santé: {analysisData.score_sante_financiere}/100
                    </div>
                </div>
                <p style={{ lineHeight: 1.6, color: 'var(--color-text)' }}>{analysisData.resume}</p>

                <div style={{ marginTop: '1rem' }}>
                    <h4 style={{ fontSize: '0.875rem', color: 'var(--color-secondary)', marginBottom: '0.5rem' }}>Optimisations Suggérées :</h4>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', color: 'var(--color-text)', fontSize: '0.9rem' }}>
                        {analysisData.optimisations.map((opt: string, i: number) => (
                            <li key={i} style={{ marginBottom: '0.25rem' }}>{opt}</li>
                        ))}
                    </ul>
                </div>
            </Card>

            <div className={styles.grid}>
                <Card>
                    <h3 className={styles.sectionTitle}>Anomalies Détectées ({analysisData.anomalies_detectees.length})</h3>
                    <div className={styles.list}>
                        {analysisData.anomalies_detectees.length === 0 ? (
                            <p className="text-secondary" style={{ fontSize: '0.9rem' }}>Aucune anomalie détectée ce mois-ci.</p>
                        ) : (
                            analysisData.anomalies_detectees.map((ano: string, i: number) => (
                                <div key={i} className={styles.listItem}>
                                    <div className={styles.itemLeft}>
                                        <div className={styles.iconWrapper} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)' }}>
                                            <AlertTriangle size={20} />
                                        </div>
                                        <span className={styles.itemName} style={{ fontSize: '0.875rem' }}>{ano}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                <Card>
                    <h3 className={styles.sectionTitle}>Répartition par Catégorie</h3>
                    <div className={styles.list}>
                        {Object.entries(stats.categoryBreakdown).map(([category, amount]: [string, any], i: number) => (
                            <div key={i} className={styles.listItem}>
                                <div className={styles.itemLeft}>
                                    <div className={styles.iconWrapper}>
                                        <FileSpreadsheet size={20} />
                                    </div>
                                    <div>
                                        <span className={styles.itemName} style={{ display: 'block' }}>{category}</span>
                                    </div>
                                </div>
                                <span className={styles.itemAmount}>{parseFloat(amount).toFixed(2)} €</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}

