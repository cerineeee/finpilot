import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAppContext } from '../../context/AppContext';
import { Loader2, Mail, Lock } from 'lucide-react';
import styles from './Auth.module.css';

const loginSchema = z.object({
    email: z.string().email("Format d'email invalide"),
    password: z.string().min(1, "Mot de passe requis"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function Login() {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { checkAuth } = useAppContext();
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        setError(null);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include'
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erreur de connexion');
            }

            // Success, cookies are set. Manually trigger context validation to log in user
            await checkAuth();
            navigate('/');
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
                    <h2>Bon retour !</h2>
                    <p>Connectez-vous pour accéder à votre tableau de bord.</p>
                </div>

                {error && (
                    <div className={styles.errorMessage}>{error}</div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className={styles.authForm}>
                    <div className={styles.formGroup}>
                        <label>Email</label>
                        <div className={styles.inputWrapper}>
                            <Mail className={styles.inputIcon} size={18} />
                            <input type="email" placeholder="jean.dupont@entreprise.fr" {...register('email')} />
                        </div>
                        {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <label>Mot de passe</label>
                            <Link to="/forgot-password" className={styles.forgotLink}>Mot de passe oublié ?</Link>
                        </div>
                        <div className={styles.inputWrapper}>
                            <Lock className={styles.inputIcon} size={18} />
                            <input type="password" placeholder="••••••••" {...register('password')} />
                        </div>
                        {errors.password && <span className={styles.fieldError}>{errors.password.message}</span>}
                    </div>

                    <Button type="submit" disabled={isLoading} className={styles.submitButton}>
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Se connecter'}
                    </Button>
                </form>

                <div className={styles.authFooter}>
                    Vous n'avez pas de compte ? <Link to="/register">Inscrivez-vous</Link>
                </div>
            </Card>
        </div>
    );
}
