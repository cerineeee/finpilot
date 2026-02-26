import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { sendVerificationEmail } from '../services/email.service';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_fallback_key_for_dev';

export const register = async (req: Request, res: Response) => {
    try {
        const { fullName, email, password, companyName, currency, industry, legalStatus } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                fullName,
                email,
                passwordHash,
                companyName,
                currency,
                industry,
                legalStatus,
                emailVerified: true, // DEV MODE: Auto-validate for immediate login
            },
        });

        // Create verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        await prisma.verificationToken.create({
            data: {
                token: verificationToken,
                type: 'VERIFY_EMAIL',
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                userId: newUser.id
            }
        });

        // Send Email via Resend
        await sendVerificationEmail(newUser.email, verificationToken);

        res.status(201).json({ message: 'Inscription réussie. Veuillez vérifier votre email.' });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Erreur lors de l\'inscription.' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Identifiants invalides.' });
        }

        // Check locks
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            return res.status(403).json({ error: 'Compte verrouillé suite à trop d\'échecs. Réessayez plus tard.' });
        }

        if (!user.emailVerified) {
            return res.status(403).json({ error: 'Veuillez vérifier votre adresse email avant de vous connecter.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            const attempts = user.failedLoginAttempts + 1;
            let lockedUntil = null;
            if (attempts >= 5) {
                lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
            }
            await prisma.user.update({
                where: { id: user.id },
                data: { failedLoginAttempts: attempts, lockedUntil }
            });
            return res.status(401).json({ error: 'Identifiants invalides.' });
        }

        // Reset failed login attempts on success
        await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() }
        });

        // Create JWT
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '2h' });

        // Set HttpOnly cookie
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 2 * 60 * 60 * 1000 // 2 hours
        });

        res.json({ message: 'Connexion réussie', user: { id: user.id, email: user.email, fullName: user.fullName } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Erreur lors de la connexion.' });
    }
};

export const logout = (req: Request, res: Response) => {
    res.clearCookie('auth_token');
    res.json({ message: 'Déconnecté avec succès.' });
};

export const me = async (req: Request, res: Response) => {
    const token = req.cookies.auth_token;
    if (!token) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, fullName: true, companyName: true, plan: true, currency: true }
        });

        if (!user) return res.status(401).json({ error: 'Utilisateur introuvable' });

        res.json({ user });
    } catch (error) {
        res.status(401).json({ error: 'Token invalide ou expiré' });
    }
};
