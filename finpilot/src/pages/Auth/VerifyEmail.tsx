import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CheckCircle2 } from 'lucide-react';
import styles from './Auth.module.css';

export function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const isVerified = searchParams.get('verified') === 'true';

    useEffect(() => {
        // If we land here but aren't verified by the backend redirect (no query param), bounce to login
        if (!isVerified) {
            navigate('/login');
        }
    }, [isVerified, navigate]);

    return (
        <div className={styles.authContainer}>
            <Card className={styles.authCard}>
                <div className={styles.authHeader}>
                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <CheckCircle2 size={32} />
                    </div>
                    <h2>Compte vérifié !</h2>
                    <p style={{ marginTop: '16px', fontSize: '15px' }}>
                        Merci, votre adresse email a été confirmée avec succès.
                        Vous pouvez désormais vous connecter et utiliser l'application.
                    </p>
                </div>

                <Button onClick={() => navigate('/login')} className={styles.submitButton} style={{ width: '100%' }}>
                    Aller à la connexion
                </Button>
            </Card>
        </div>
    );
}
