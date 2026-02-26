import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type ExpenseCategory = 'Opérationnelle' | 'Financière' | 'Exceptionnelle';

export interface Invoice {
    id: string;
    vendor: string;
    date: string;
    amountHT: number;
    amountTTC: number;
    tax: number;
    category: ExpenseCategory;
    isRecurring: boolean;
    type: string; // Facture, Devis, Reçu, etc.
    fileUrl?: string; // Mock PDF or image URL
}

export interface UserProfile {
    id: string;
    email: string;
    fullName: string;
    companyName: string;
    industry?: string;
    currency?: string;
}

interface AppState {
    profile: UserProfile | null;
    invoices: Invoice[];
    isOnboarded: boolean;
    isAuthenticated: boolean;
    isLoadingAuth: boolean;
}

interface AppContextType {
    state: AppState;
    setProfile: (profile: UserProfile) => void;
    addInvoice: (invoice: Invoice) => void;
    updateInvoice: (id: string, updates: Partial<Invoice>) => void;
    deleteInvoice: (id: string) => void;
    completeOnboarding: () => void;
    refreshInvoices: () => void;
    checkAuth: () => Promise<void>;
    logout: () => Promise<void>;
}

const initialState: AppState = {
    profile: null,
    invoices: [],
    isOnboarded: false,
    isAuthenticated: false,
    isLoadingAuth: true,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AppState>(initialState);

    const checkAuth = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await fetch(`${API_URL}/api/auth/me`, {
                credentials: 'include' // Required to send the HttpOnly cookie cross-origin
            });
            if (response.ok) {
                const data = await response.json();
                setState(prev => ({
                    ...prev,
                    profile: data.user,
                    isAuthenticated: true,
                    isLoadingAuth: false,
                    isOnboarded: true // Assume returning users are onboarded
                }));
            } else {
                setState(prev => ({ ...prev, isAuthenticated: false, isLoadingAuth: false }));
            }
        } catch (error) {
            setState(prev => ({ ...prev, isAuthenticated: false, isLoadingAuth: false }));
        }
    };

    const logout = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            await fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
        } catch (e) { }
        setState(prev => ({ ...prev, isAuthenticated: false, profile: null, invoices: [] }));
    };

    const fetchInvoices = async () => {
        if (!state.isAuthenticated) return;
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await fetch(`${API_URL}/api/invoices`, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                const mappedInvoices = data.map((inv: any) => ({
                    id: inv.id,
                    vendor: inv.vendor,
                    date: new Date(inv.date).toISOString().split('T')[0],
                    amountHT: Number(inv.amountHT),
                    amountTTC: Number(inv.amountTTC),
                    tax: Number(inv.tax),
                    category: inv.category as ExpenseCategory,
                    isRecurring: inv.expenseType === 'abonnement' || inv.expenseType === 'recurrente',
                    type: inv.expenseType === 'abonnement' ? 'Facture (Abo)' : 'Facture'
                }));
                setState((prev) => ({ ...prev, invoices: mappedInvoices }));
            }
        } catch (error) {
            console.error("Erreur chargement factures :", error);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const setProfile = (profile: UserProfile) => {
        setState((prev) => ({ ...prev, profile }));
    };

    const addInvoice = (invoice: Invoice) => {
        // Here we just add it locally for instant UI update, since the backend handles creation
        setState((prev) => ({ ...prev, invoices: [invoice, ...prev.invoices] }));
    };

    const updateInvoice = (id: string, updates: Partial<Invoice>) => {
        setState((prev) => ({
            ...prev,
            invoices: prev.invoices.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv)),
        }));
    };

    const deleteInvoice = async (id: string) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/invoices/${id}`, { method: 'DELETE', credentials: 'include' });
            if (res.ok) {
                setState((prev) => ({
                    ...prev,
                    invoices: prev.invoices.filter((inv) => inv.id !== id),
                }));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const completeOnboarding = () => {
        setState((prev) => ({ ...prev, isOnboarded: true }));
    };

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (state.isAuthenticated) {
            fetchInvoices();
        }
    }, [state.isAuthenticated]);

    return (
        <AppContext.Provider
            value={{ state, setProfile, addInvoice, updateInvoice, deleteInvoice, completeOnboarding, refreshInvoices: fetchInvoices, checkAuth, logout }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}
