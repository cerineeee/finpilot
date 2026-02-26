import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || "dummy",
});

export interface InvoiceExtractedData {
    vendor: string;
    date: string;
    amountHT: number;
    amountTTC: number;
    tax: number;
    currency: string;
    description: string;
    category: 'Opérationnelle' | 'Financière' | 'Exceptionnelle';
    expenseType: 'abonnement' | 'ponctuelle' | 'recurrente';
    confidenceScore: number;
}

export const extractInvoiceData = async (buffer: Buffer, mimeType: string): Promise<InvoiceExtractedData> => {
    const base64Image = buffer.toString('base64');

    const prompt = `Tu es un expert-comptable très précis et un expert en extraction de données. Tu vas recevoir une image de facture ou de reçu. Tu dois extraire les informations et les retourner STRICTEMENT sous la forme d'un objet JSON.
Le JSON doit respecter cette structure exacte sans markdown, sans le mot "json" ou autres fioritures :
{
  "vendor": "le nom du fournisseur",
  "date": "YYYY-MM-DD",
  "amountHT": nombre (montant HT en format nombre ex: 100.5),
  "amountTTC": nombre (montant TTC),
  "tax": nombre (montant de la TVA),
  "currency": "EUR" ou autre devise,
  "description": "une courte description de ce qui a été acheté",
  "category": "Opérationnelle" ou "Financière" ou "Exceptionnelle",
  "expenseType": "abonnement" ou "ponctuelle" ou "recurrente",
  "confidenceScore": nombre entier entre 0 et 100
}
Si tu ne trouves pas une information, mets null ou une valeur par défaut cohérente (par exemple 0 pour les montants introuvables).`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: mimeType,
                }
            }
        ],
        config: {
            temperature: 0.1,
            responseMimeType: "application/json",
        }
    });

    const content = response.text;
    if (!content) throw new Error("L'IA n'a pas renvoyé de réponse.");

    return JSON.parse(content) as InvoiceExtractedData;
};

export const analyzeMonthlyTrends = async (invoices: any[]) => {
    const dataToAnalyze = invoices.map(i => ({
        vendor: i.vendor,
        amount: i.amountTTC,
        category: i.category,
        date: i.date
    }));

    const prompt = `Tu es un conseiller financier analysant les dépenses mensuelles d'une entreprise. Voici une liste des dépenses du mois:
${JSON.stringify(dataToAnalyze)}

Parle en français. Renvoie-moi STRICTEMENT un JSON contenant:
{
   "resume": "Un bref résumé de la situation en 1 paragraphe",
   "anomalies_detectees": ["texte", "texte"],
   "optimisations": ["conseil 1", "conseil 2"],
   "score_sante_financiere": entier entre 0 et 100,
   "niveau_risque": "faible" ou "modere" ou "eleve"
}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            temperature: 0.3,
            responseMimeType: "application/json",
        }
    });

    const content = response.text;
    if (!content) throw new Error("L'IA n'a pas renvoyé d'analyse mensuelle.");
    return JSON.parse(content);
};
