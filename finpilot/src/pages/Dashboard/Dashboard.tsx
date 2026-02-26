import classNames from 'classnames';
import { TrendingDown, TrendingUp, Sparkles, Lightbulb, Activity, CheckCircle2 } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../../components/ui/Card';
import { useAppContext } from '../../context/AppContext';
import styles from './Dashboard.module.css';

// Mock data for charts
const pieData = [
    { name: 'Opérationnelle', value: 4500, color: '#4F46E5' },
    { name: 'Financière', value: 1200, color: '#10B981' },
    { name: 'Exceptionnelle', value: 800, color: '#F59E0B' },
];

const lineData = [
    { name: 'Oct', amount: 4800 },
    { name: 'Nov', amount: 5200 },
    { name: 'Déc', amount: 5000 },
    { name: 'Jan', amount: 6100 },
    { name: 'Fév', amount: 6500 },
];

export function Dashboard() {
    const { state } = useAppContext();
    const userName = state.profile?.industry ? "Entrepreneur" : "Utilisateur";

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Bonjour, {userName} 👋</h1>
                <p className={styles.subtitle}>Voici le résumé de vos finances ce mois-ci.</p>
            </div>

            {/* Main Expense Card */}
            <Card className={styles.mainCard}>
                <div style={{ opacity: 0.9, fontSize: '0.875rem' }}>Dépenses de Février 2026</div>
                <div className={styles.mainAmount}>6 500,00 €</div>
                <div className={classNames(styles.trend, styles.trendUp)}>
                    <TrendingUp size={16} />
                    <span>+6.5% vs mois précédent</span>
                </div>
            </Card>

            {/* 3 Categories Cards */}
            <div className={styles.grid}>
                <Card className={styles.categoryCard}>
                    <div className={styles.categoryHeader}>
                        <span>Opérationnelle</span>
                        <Activity size={16} />
                    </div>
                    <div className={styles.categoryAmount}>4 500 €</div>
                    <div className={classNames(styles.categoryTrend, "text-warning")}>
                        <TrendingUp size={14} /> +12%
                    </div>
                </Card>

                <Card className={styles.categoryCard}>
                    <div className={styles.categoryHeader}>
                        <span>Financière</span>
                        <Activity size={16} />
                    </div>
                    <div className={styles.categoryAmount}>1 200 €</div>
                    <div className={classNames(styles.categoryTrend, "text-success")}>
                        <TrendingDown size={14} /> -3%
                    </div>
                </Card>

                <Card className={styles.categoryCard}>
                    <div className={styles.categoryHeader}>
                        <span>Exceptionnelle</span>
                        <Activity size={16} />
                    </div>
                    <div className={styles.categoryAmount}>800 €</div>
                    <div className={classNames(styles.categoryTrend, "text-danger")}>
                        <TrendingUp size={14} /> +25%
                    </div>
                </Card>
            </div>

            <div className={styles.section}>
                <div className={classNames(styles.grid, styles.gridCharts)}>
                    {/* Charts */}
                    <Card className={styles.chartCard} style={{ gridColumn: '1 / span 2' }}>
                        <h3 className={styles.sectionTitle} style={{ marginBottom: '16px' }}>Évolution des Dépenses</h3>
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={lineData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="amount" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, fill: '#4F46E5', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card className={styles.chartCard}>
                        <h3 className={styles.sectionTitle} style={{ marginBottom: '16px', textAlign: 'center' }}>Répartition</h3>
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Health & AI Cards */}
                    <Card className={styles.healthScoreCard}>
                        <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Santé Financière</h3>
                        <div className={styles.healthCircle}>
                            <div className={styles.healthCircleInner}>
                                <span className={styles.healthScore}>85</span>
                                <span className={styles.healthText}>/ 100</span>
                            </div>
                        </div>
                        <p className={styles.healthText}>
                            Bonne maîtrise des charges fixes. Attention à l'exceptionnel (assurances).
                        </p>
                    </Card>
                </div>
            </div>

            <div className={styles.section}>
                <Card className={styles.aiBlock}>
                    <div className={styles.aiHeader}>
                        <Sparkles size={24} />
                        <h2>Recommandations IA</h2>
                    </div>
                    <ul className={styles.aiList}>
                        <li className={styles.aiItem}>
                            <Lightbulb className={styles.aiItemIcon} size={18} />
                            <span><strong>Abonnements logiciels :</strong> Nous avons détecté 4 abonnements similaires (outils design). Les consolider pourrait vous faire économiser <strong>~45 € / mois</strong>.</span>
                        </li>
                        <li className={styles.aiItem}>
                            <CheckCircle2 className="text-success flex-shrink-0 mt-0.5" size={18} />
                            <span><strong>Frais de déplacement :</strong> Vos factures d'essence ont baissé de 15%. Bonne optimisation de vos tournées !</span>
                        </li>
                        <li className={styles.aiItem}>
                            <Lightbulb className={styles.aiItemIcon} size={18} />
                            <span><strong>Fournisseur télécom :</strong> Votre forfait actuel semble plus élevé que 80% des entreprises de votre taille.</span>
                        </li>
                    </ul>
                </Card>
            </div>

        </div>
    );
}
