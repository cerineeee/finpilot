import React, { useState, useRef } from 'react';
import { Upload, FileText, Loader2, Edit3, Trash2, Check, X } from 'lucide-react';
import classNames from 'classnames';
import { useAppContext } from '../../context/AppContext';
import type { Invoice, ExpenseCategory } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import styles from './Invoices.module.css';


export function Invoices() {
    const { state, addInvoice, deleteInvoice } = useAppContext();
    const [isUploading, setIsUploading] = useState(false);
    const [extractedInvoice, setExtractedInvoice] = useState<Invoice | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            await processUpload(file);
        }
    };

    const processUpload = async (file: File) => {
        setIsUploading(true);
        setExtractedInvoice(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await fetch(`${API_URL}/api/invoices/upload`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de l\'analyse du document');
            }

            const data = await response.json();
            const invoice = data.invoice;

            const newInvoice: Invoice = {
                id: invoice.id,
                vendor: invoice.vendor,
                date: new Date(invoice.date).toISOString().split('T')[0],
                amountHT: Number(invoice.amountHT),
                amountTTC: Number(invoice.amountTTC),
                tax: Number(invoice.tax),
                category: invoice.category as ExpenseCategory,
                isRecurring: invoice.expenseType === 'abonnement' || invoice.expenseType === 'recurrente',
                type: invoice.expenseType === 'abonnement' ? 'Facture (Abo)' : 'Facture'
            };

            setExtractedInvoice(newInvoice);
        } catch (error: any) {
            alert('Erreur IA: ' + error.message);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const confirmUpload = () => {
        if (extractedInvoice) {
            addInvoice(extractedInvoice);
            setExtractedInvoice(null);
        }
    };

    const cancelUpload = () => {
        setExtractedInvoice(null);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Factures & Reçus</h1>
                    <p className={styles.subtitle}>Gérez et analysez vos dépenses.</p>
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept=".pdf,image/*"
            />

            {isUploading ? (
                <Card className={styles.loadingState}>
                    <Loader2 size={48} className={styles.spinner} />
                    <h3>Analyse par l'IA en cours...</h3>
                    <p className="text-secondary">Extraction automatique des données du document.</p>
                </Card>
            ) : extractedInvoice ? (
                <Card className={styles.extractedSummary}>
                    <div className={styles.summaryHeader}>
                        <div className={styles.summaryIcon}>
                            <Check size={24} className="text-success" />
                        </div>
                        <div>
                            <h3 className={styles.summaryTitle}>Document analysé avec succès</h3>
                            <p className="text-secondary">Vérifiez les informations extraites :</p>
                        </div>
                    </div>

                    <div className={styles.summaryContent}>
                        <div className={styles.summaryRow}>
                            <span className={styles.summaryLabel}>Émetteur</span>
                            <span className={styles.summaryValue}>{extractedInvoice.vendor}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span className={styles.summaryLabel}>Montant TTC</span>
                            <span className={styles.summaryValue}>{extractedInvoice.amountTTC.toFixed(2)} €</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span className={styles.summaryLabel}>Nature</span>
                            <span className={styles.summaryValue}>{extractedInvoice.type}</span>
                        </div>
                    </div>

                    <div className={styles.summaryActions}>
                        <Button variant="secondary" onClick={cancelUpload}>
                            <X size={18} style={{ marginRight: '8px' }} /> Ignorer
                        </Button>
                        <Button onClick={confirmUpload}>
                            <Check size={18} style={{ marginRight: '8px' }} /> Ajouter ce document
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className={styles.uploadZone} onClick={handleUploadClick}>
                    <Upload size={48} className={styles.uploadIcon} />
                    <h3 className={styles.uploadText}>Cliquez ou glissez une facture ici</h3>
                    <p className={styles.uploadHint}>PDF, JPG ou PNG (Max 10 Mo)</p>
                </div>
            )}

            <h3 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Dernières factures</h3>

            <div className={styles.list}>
                {state.invoices.length === 0 ? (
                    <p className="text-secondary">Aucune facture pour le moment. Déposez-en une pour commencer !</p>
                ) : (
                    state.invoices.map(inv => (
                        <Card key={inv.id} className={styles.invoiceCard}>
                            <div className={styles.invoiceInfo}>
                                <div style={{ backgroundColor: 'var(--color-bg-main)', padding: '12px', borderRadius: '8px', color: 'var(--color-primary)' }}>
                                    <FileText size={24} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span className={styles.vendor}>
                                        {inv.vendor} <span className="text-secondary" style={{ fontSize: '0.85rem', fontWeight: 400 }}>• {inv.type}</span>
                                    </span>
                                    <span className={styles.date}>{inv.date}</span>
                                </div>
                                <div className={classNames(styles.categoryTag, styles[`tag-${inv.category}`])}>
                                    {inv.category}
                                </div>
                            </div>

                            <div className={styles.amounts}>
                                <span className={styles.amount}>{inv.amountTTC.toFixed(2)} €</span>
                                <span className={styles.tax}>dont TVA: {inv.tax.toFixed(2)} €</span>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Button variant="secondary" size="sm" onClick={() => alert('Modification manuelle à venir !')}><Edit3 size={16} /></Button>
                                <Button variant="secondary" size="sm" onClick={() => deleteInvoice(inv.id)} className="text-danger"><Trash2 size={16} /></Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
