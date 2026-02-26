import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_fallback_key_for_dev';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
    }
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.auth_token;

    if (!token) {
        return res.status(401).json({ error: 'Accès refusé. Veuillez vous connecter.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Session expirée ou invalide. Veuillez vous reconnecter.' });
    }
};
