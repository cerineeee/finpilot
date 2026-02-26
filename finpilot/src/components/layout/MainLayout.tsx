import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, BarChart3 } from 'lucide-react';
import classNames from 'classnames';
import styles from './MainLayout.module.css';

const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/invoices', label: 'Factures', icon: Receipt },
    { to: '/analysis', label: 'Analyse Mensuelle', icon: BarChart3 },
];

export function MainLayout({ children }: { children: ReactNode }) {
    return (
        <div className={styles.layout}>
            {/* Sidebar for Desktop */}
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                        <BarChart3 size={20} />
                    </div>
                    FinPilot
                </div>
                <nav className={styles.nav}>
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) =>
                                    classNames(styles.navItem, { [styles.navItemActive]: isActive })
                                }
                            >
                                <Icon size={20} />
                                {link.label}
                            </NavLink>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className={styles.content}>
                {children}
            </main>

            {/* Bottom Bar for Mobile */}
            <nav className={styles.bottomBar}>
                {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                classNames(styles.bottomNavItem, { [styles.bottomNavItemActive]: isActive })
                            }
                        >
                            <Icon size={24} />
                            {link.label}
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );
}
