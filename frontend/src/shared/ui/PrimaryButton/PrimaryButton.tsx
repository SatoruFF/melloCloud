import cn from 'classnames';
import styles from './primary-button.module.scss';

type ButtonsType = 'button' | 'submit' | 'reset';
type Themes = 'clear' | 'primary';

interface PrimaryButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  theme?: Themes;
  type?: ButtonsType;
}

export const PrimaryButton = ({
  onClick,
  children,
  disabled,
  className,
  theme = 'primary',
  type = 'button',
}: PrimaryButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        styles.mainButton, // Основной класс кнопки
        styles[theme], // Класс темы (primary или clear)
        className, // Пользовательские классы, если переданы
      )}
    >
      {children}
    </button>
  );
};
