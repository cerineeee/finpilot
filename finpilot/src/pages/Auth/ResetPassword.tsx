import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loader2, Lock } from 'lucide-react';
import styles from './Auth.module.css';

const resetPasswordSchema = z.object({
    password: z.string()
        .min(10, "Le mot de passe doit contenir au moins 10 caractères")
        .regex(/[A-Z]/, "Doit contenir au moins une majuscule")
        .regex(/[0-9]/, "Doit contenir au moins un chiffre")
        .regex(/[^A-Za-z0-9]/, "Doit contenir au moins un caractère spécial"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPassword() {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordValues>({
        resolver: zodResolver(resetPasswordSchema)
    });

    const passwordValue = watch('password', '');

    const onSubmit = async (data: ResetPasswordValues) => {
        if (!token) {
            setError("Lien de réinitialisation invalide ou expiré.");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    newPassword: data.password
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erreur lors de la réinitialisation');
            }

            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className={styles.authContainer}>
                <Card className={styles.authCard}>
                    <div className={styles.authHeader}>
                        <h2 style={{ color: 'var(--color-success)' }}>Mot de passe modifié !</h2>
                        <p style={{ marginTop: '16px' }}>Votre mot de passe a été mis à jour avec succès.</p>
                        <p style={{ fontSize: '14px', color: 'var(--color-secondary)' }}>Redirection vers la connexion...</p>
                    </div>
                </Card>
            </div>
        );
    }

    if (!token) {
        return (
            <div className={styles.authContainer}>
                <Card className={styles.authCard}>
                    <div className={styles.errorMessage}>
                        Lien invalide ou expiré. Veuillez refaire une demande de réinitialisation.
                    </div>
                    <Button onClick={() => navigate('/forgot-password')} variant="secondary" style={{ width: '100%' }}>
                        Faire une nouvelle demande
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <div className={styles.authContainer}>
            <Card className={styles.authCard}>
                <div className={styles.authHeader}>
                    <div className={styles.logo}>FinPilot</div>
                    <h2>Nouveau mot de passe</h2>
                    <p>Créez un mot de passe sécurisé pour votre compte.</p>
                </div>

                {error && <div className={styles.errorMessage}>{error}</div>}

                <form onSubmit={handleSubmit(onSubmit)} className={styles.authForm}>

                    <div className={styles.formGroup}>
                        <label>Nouveau mot de passe</label>
                        <div className={styles.inputWrapper}>
                            <Lock className={styles.inputIcon} size={18} />
                            <input type="password" placeholder="••••••••" {...register('password')} />
                        </div>
                        {errors.password && <span className={styles.fieldError}>{errors.password.message}</span>}

                        {/* Visual Password Rules */}
                        <div className={styles.passwordRules}>
                            Règles :
                            <ul>
                                <li className={passwordValue.length >= 10 ? styles.valid : styles.invalid}>✓ Min. 10 caractères</li>
                                <li className={/[A-Z]/.test(passwordValue) ? styles.valid : styles.invalid}>✓ 1 Majuscule</li>
                                <li className={/[0-9]/.test(passwordValue) ? styles.valid : styles.invalid}>✓ 1 Chiffre</li>
                                <li className={/[^A-Za-z0-9]/.test(passwordValue) ? styles.valid : styles.invalid}>✓ 1 Caratère spécial</li>
                            </ul>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Confirmer le mot de passe</label>
                        <div className={styles.inputWrapper}>
                            <Lock className={styles.inputIcon} size={18} />
                            <input type="password" placeholder="••••••••" {...register('confirmPassword')} />
                        </div>
                        {errors.confirmPassword && <span className={styles.fieldError}>{errors.confirmPassword.message}</span>}
                    </div>

                    <Button type="submit" disabled={isLoading} className={styles.submitButton}>
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Réinitialiser le mot de passe'}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
