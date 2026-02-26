import { Router } from 'express';
import { register, login, logout, me } from '../controllers/auth.controller';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', me);

// GET Verification Route 
router.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;
        if (!token || typeof token !== 'string') {
            return res.status(400).send('Token manquant ou invalide.');
        }

        const verificationToken = await prisma.verificationToken.findUnique({
            where: { token },
            include: { user: true }
        });

        if (!verificationToken || verificationToken.type !== 'VERIFY_EMAIL') {
            return res.status(400).send('Token invalide ou introuvable.');
        }

        if (verificationToken.expiresAt < new Date()) {
            return res.status(400).send('Le token a expiré. Veuillez redemander un lien de vérification.');
        }

        // Activate user
        await prisma.user.update({
            where: { id: verificationToken.userId },
            data: { emailVerified: true }
        });

        // Delete token to prevent reuse
        await prisma.verificationToken.delete({ where: { id: verificationToken.id } });

        // Redirect to Frontend Login
        res.redirect('http://localhost:5173/login?verified=true');
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).send('Erreur lors de la vérification.');
    }
});

export default router;
