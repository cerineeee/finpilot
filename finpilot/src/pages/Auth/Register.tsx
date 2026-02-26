import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loader2, User, Mail, Lock, Building, DollarSign, Briefcase, FileText } from 'lucide-react';
import styles from './Auth.module.css';

const registerSchema = z.object({
    fullName: z.string().min(2, "Nom trop court"),
    email: z.string().email("Format d'email invalide"),
    password: z.string()
        .min(10, "Le mot de passe doit contenir au moins 10 caractères")
        .regex(/[A-Z]/, "Doit contenir au moins une majuscule")
        .regex(/[0-9]/, "Doit contenir au moins un chiffre")
        .regex(/[^A-Za-z0-9]/, "Doit contenir au moins un caractère spécial"),
    confirmPassword: z.string(),
    companyName: z.string().min(2, "Nom d'entreprise requis"),
    currency: z.enum(['EUR', 'USD', 'GBP', 'CAD', 'CHF']),
    industry: z.string().min(1, "Secteur requis"),
    legalStatus: z.enum(['Micro-entreprise', 'EI', 'EURL', 'SARL', 'SAS', 'SASU', 'Autre']),
    terms: z.boolean().refine((val) => val === true, {
        message: "Vous devez accepter les conditions générales d'utilisation",
    })
}).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function Register() {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            currency: 'EUR',
            legalStatus: 'SASU'
        }
    });

    const passwordValue = watch('password', '');

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        setError(null);
        try {
            // Omit confirmPassword and terms for the backend
            const { confirmPassword, terms, ...backendData } = data;

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(backendData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erreur lors de l\'inscription');
            }

            setSuccess(true);
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
                        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <User size={32} />
                        </div>
                        <h2>Compte créé avec succès !</h2>
                        <p style={{ marginTop: '16px', fontSize: '15px' }}>
                            Votre compte FinPilot est maintenant actif. <br />
                            Vous pouvez vous connecter pour accéder à votre espace de travail.
                        </p>
                    </div>
                    <Button onClick={() => navigate('/login')} className={styles.submitButton} variant="secondary">
                        Accéder à la connexion
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className={styles.authContainer}>
            <Card className={`${styles.authCard} ${styles.wide}`}>
                <div className={styles.authHeader}>
                    <div className={styles.logo}>FinPilot</div>
                    <h2>Créer un compte</h2>
                    <p>Rejoignez-nous et automatisez votre gestion financière.</p>
                </div>

                {error && <div className={styles.errorMessage}>{error}</div>}

                <form onSubmit={handleSubmit(onSubmit)} className={styles.authForm}>

                    <div className={styles.registerGrid}>
                        <div className={styles.formGroup}>
                            <label>Nom Complet</label>
                            <div className={styles.inputWrapper}>
                                <User className={styles.inputIcon} size={18} />
                                <input type="text" placeholder="Jean Dupont" {...register('fullName')} />
                            </div>
                            {errors.fullName && <span className={styles.fieldError}>{errors.fullName.message}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label>Email Professionnel</label>
                            <div className={styles.inputWrapper}>
                                <Mail className={styles.inputIcon} size={18} />
                                <input type="email" placeholder="jean@entreprise.fr" {...register('email')} />
                            </div>
                            {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label>Nom de l'entreprise</label>
                            <div className={styles.inputWrapper}>
                                <Building className={styles.inputIcon} size={18} />
                                <input type="text" placeholder="Acme Corp" {...register('companyName')} />
                            </div>
                            {errors.companyName && <span className={styles.fieldError}>{errors.companyName.message}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label>Secteur d'activité</label>
                            <div className={styles.inputWrapper}>
                                <Briefcase className={styles.inputIcon} size={18} />
                                <input type="text" placeholder="Tech, E-commerce..." {...register('industry')} />
                            </div>
                            {errors.industry && <span className={styles.fieldError}>{errors.industry.message}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label>Devise Principale</label>
                            <div className={styles.inputWrapper}>
                                <DollarSign className={styles.inputIcon} size={18} />
                                <select {...register('currency')}>
                                    <option value="EUR">Euro (EUR)</option>
                                    <option value="USD">Dollar (USD)</option>
                                    <option value="GBP">Livre Sterling (GBP)</option>
                                    <option value="CAD">Dollar Canadien (CAD)</option>
                                    <option value="CHF">Franc Suisse (CHF)</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Statut Juridique</label>
                            <div className={styles.inputWrapper}>
                                <FileText className={styles.inputIcon} size={18} />
                                <select {...register('legalStatus')}>
                                    <option value="Micro-entreprise">Micro-entreprise</option>
                                    <option value="EI">Entreprise Individuelle (EI)</option>
                                    <option value="EURL">EURL</option>
                                    <option value="SARL">SARL</option>
                                    <option value="SAS">SAS</option>
                                    <option value="SASU">SASU</option>
                                    <option value="Autre">Autre</option>
                                </select>
                            </div>
                        </div>

                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label>Mot de passe</label>
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

                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label>Confirmer le mot de passe</label>
                            <div className={styles.inputWrapper}>
                                <Lock className={styles.inputIcon} size={18} />
                                <input type="password" placeholder="••••••••" {...register('confirmPassword')} />
                            </div>
                            {errors.confirmPassword && <span className={styles.fieldError}>{errors.confirmPassword.message}</span>}
                        </div>

                        <div className={`${styles.formGroup} ${styles.fullWidth} ${styles.checkboxGroup}`}>
                            <input type="checkbox" id="terms" {...register('terms')} />
                            <label htmlFor="terms">
                                J'accepte les conditions générales d'utilisation et la politique de confidentialité (RGPD).
                            </label>
                        </div>
                        {errors.terms && <span className={`${styles.fieldError} ${styles.fullWidth}`}>{errors.terms.message}</span>}
                    </div>

                    <Button type="submit" disabled={isLoading} className={styles.submitButton}>
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Créer mon compte sécurisé'}
                    </Button>
                </form>

                <div className={styles.authFooter}>
                    Vous avez déjà un compte ? <Link to="/login">Connectez-vous</Link>
                </div>
            </Card>
        </div>
    );
}
