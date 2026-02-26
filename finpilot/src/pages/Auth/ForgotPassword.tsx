import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import styles from './Auth.module.css';

const forgotPasswordSchema = z.object({
    email: z.string().email("Format d'email invalide"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPassword() {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordValues>({
        resolver: zodResolver(forgotPasswordSchema)
    });

    const onSubmit = async (data: ForgotPasswordValues) => {
        setIsLoading(true);
        setError(null);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            // We always show success to prevent email enumeration attacks,
            // unless there is a severe server error (500)
            if (!response.ok && response.status === 500) {
                throw new Error(result.error || 'Erreur lors de la demande');
            }

            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <Card className={styles.authCard}>
                <div className={styles.authHeader}>
                    <div className={styles.logo}>FinPilot</div>
                    <h2>Mot de passe oublié</h2>
                    <p>Saisissez votre email pour recevoir un lien de réinitialisation.</p>
                </div>

                {error && <div className={styles.errorMessage}>{error}</div>}

                {success ? (
                    <div className={styles.successMessage}>
                        Si un compte correspond à cette adresse, un email de réinitialisation a été envoyé.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className={styles.authForm}>
                        <div className={styles.formGroup}>
                            <label>Email</label>
                            <div className={styles.inputWrapper}>
                                <Mail className={styles.inputIcon} size={18} />
                                <input type="email" placeholder="jean.dupont@entreprise.fr" {...register('email')} />
                            </div>
                            {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
                        </div>

                        <Button type="submit" disabled={isLoading} className={styles.submitButton}>
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Envoyer le lien'}
                        </Button>
                    </form>
                )}

                <div className={styles.authFooter} style={{ marginTop: '32px' }}>
                    <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <ArrowLeft size={16} /> Retour à la connexion
                    </Link>
                </div>
            </Card>
        </div>
    );
}
