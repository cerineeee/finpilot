import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import invoiceRoutes from './routes/invoices.routes';
import analysisRoutes from './routes/analysis.routes';
import authRoutes from './routes/auth.routes';

dotenv.config();

export const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: ['http://localhost:5173', 'https://finpilot.vercel.app', 'https://finpilot-dbn7bpd59-bensalahcerine-8814s-projects.vercel.app'],
    credentials: true // Crucial for HttpOnly cookies
}));
app.use(express.json());
app.use(cookieParser());

// Main health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/analysis', analysisRoutes);

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
