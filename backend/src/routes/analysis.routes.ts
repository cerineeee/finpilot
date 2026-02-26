import { Router } from 'express';
import { prisma } from '../index';
import { analyzeMonthlyTrends } from '../services/ai.service';
import { requireAuth, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

router.get('/monthly', requireAuth, async (req: AuthRequest, res) => {
    try {
        const invoices = await prisma.invoice.findMany({
            where: {
                userId: req.user!.userId
            }
        });

        if (invoices.length === 0) {
            return res.json({ message: "Not enough data" });
        }

        const analysis = await analyzeMonthlyTrends(invoices);

        // Aggrégation basique
        const totalAmount = invoices.reduce((acc, inv) => acc + inv.amountTTC, 0);

        const categoryBreakdown = invoices.reduce((acc: any, inv) => {
            acc[inv.category] = (acc[inv.category] || 0) + inv.amountTTC;
            return acc;
        }, {});

        res.json({
            analysis,
            stats: {
                totalAmount,
                categoryBreakdown,
                invoiceCount: invoices.length
            }
        });

    } catch (error: any) {
        console.error('Analysis error', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
