import { Router } from 'express';
import multer from 'multer';
import { extractInvoiceData } from '../services/ai.service';
import { prisma } from '../index';
import { requireAuth, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', requireAuth, upload.single('file'), async (req: AuthRequest, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const userId = req.user!.userId;

        const buffer = req.file.buffer;
        const mimeType = req.file.mimetype;

        const extractedData = await extractInvoiceData(buffer, mimeType);

        // Save initial extraction to DB
        const invoice = await prisma.invoice.create({
            data: {
                vendor: extractedData.vendor,
                date: new Date(extractedData.date || new Date().toISOString()),
                amountHT: extractedData.amountHT,
                amountTTC: extractedData.amountTTC,
                tax: extractedData.tax,
                currency: extractedData.currency,
                description: extractedData.description,
                category: extractedData.category,
                expenseType: extractedData.expenseType,
                confidenceScore: extractedData.confidenceScore,
                userId: userId
            }
        });

        res.json({ invoice });
    } catch (error: any) {
        console.error('OCR Error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/', requireAuth, async (req: AuthRequest, res) => {
    try {
        const invoices = await prisma.invoice.findMany({
            where: { userId: req.user!.userId },
            orderBy: { date: 'desc' }
        });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
});

router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
        const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id as string } });
        if (!invoice || invoice.userId !== req.user!.userId) {
            return res.status(403).json({ error: 'Interdit' });
        }
        await prisma.invoice.delete({ where: { id: req.params.id as string } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

export default router;
