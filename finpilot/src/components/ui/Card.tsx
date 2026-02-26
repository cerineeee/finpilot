import type { ReactNode, CSSProperties } from 'react';
import classNames from 'classnames';
import styles from './Card.module.css';

interface CardProps {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
    onClick?: () => void;
}

export function Card({ children, className, style, onClick }: CardProps) {
    return (
        <div
            className={classNames(
                styles.card,
                { [styles.cardInteractive]: !!onClick },
                className
            )}
            style={style}
            onClick={onClick}
        >
            {children}
        </div>
    );
}
