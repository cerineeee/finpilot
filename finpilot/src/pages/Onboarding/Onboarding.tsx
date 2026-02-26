import { useNavigate } from 'react-router-dom';
import { UploadCloud, Bot, FileText } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import styles from './Onboarding.module.css';

export function Onboarding() {
    const { completeOnboarding } = useAppContext();
    const navigate = useNavigate();

    const handleSubmit = () => {
        completeOnboarding();
        navigate('/');
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Bienvenue sur FinPilot</h1>
                    <p className={styles.subtitle}>Votre copilote financier intelligent. <br />Prenez des décisions éclairées, simplement.</p>
                </div>

                <div className={styles.features}>
                    <div className={styles.feature}>
                        <div className={styles.iconWrapper}><UploadCloud size={20} /></div>
                        <div className={styles.featureText}>
                            <span className={styles.featureTitle}>Déposez vos factures</span>
                            <span className={styles.featureDesc}>Glissez ou photographiez vos documents facilement.</span>
                        </div>
                    </div>
                    <div className={styles.feature}>
                        <div className={styles.iconWrapper}><Bot size={20} /></div>
                        <div className={styles.featureText}>
                            <span className={styles.featureTitle}>L'IA analyse pour vous</span>
                            <span className={styles.featureDesc}>Catégorisation automatique de vos dépenses.</span>
                        </div>
                    </div>
                    <div className={styles.feature}>
                        <div className={styles.iconWrapper}><FileText size={20} /></div>
                        <div className={styles.featureText}>
                            <span className={styles.featureTitle}>Recevez votre bilan intelligent</span>
                            <span className={styles.featureDesc}>PDF clair, graphiques simples et recommandations.</span>
                        </div>
                    </div>
                </div>

                <Button onClick={handleSubmit} fullWidth size="lg">
                    Accéder au tableau de bord
                </Button>
            </div>
        </div>
    );
}
