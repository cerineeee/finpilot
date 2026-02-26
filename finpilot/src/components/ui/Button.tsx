import type { ButtonHTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className,
    ...props
}: ButtonProps) {
    return (
        <button
            className={classNames(
                styles.button,
                styles[variant],
                styles[size],
                { [styles.fullWidth]: fullWidth },
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
