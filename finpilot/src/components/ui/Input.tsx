import type { InputHTMLAttributes } from 'react';
import classNames from 'classnames';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
    return (
        <div className={styles.inputWrapper}>
            {label && <label htmlFor={id} className={styles.label}>{label}</label>}
            <input
                id={id}
                className={classNames(
                    styles.input,
                    { [styles.error]: !!error },
                    className
                )}
                {...props}
            />
            {error && <span className={styles.errorMessage}>{error}</span>}
        </div>
    );
}
