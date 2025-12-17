import { memo } from 'react';
import React, { useEffect, useRef } from 'react';
import { Button } from 'antd';

interface TelegramLoginButtonProps {
  botName: string; // Имя вашего бота без @
  buttonSize?: 'large' | 'medium' | 'small';
  cornerRadius?: number;
  requestAccess?: boolean;
  usePic?: boolean;
  lang?: string;
  onAuthCallback: (user: any) => void;
}

/**
 * Компонент для Telegram Login Widget
 * Документация: https://core.telegram.org/widgets/login
 */
const TelegramLoginButton: React.FC<TelegramLoginButtonProps> = ({
  botName,
  buttonSize = 'large',
  cornerRadius = 8,
  requestAccess = true,
  usePic = false,
  lang = 'en',
  onAuthCallback,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Добавляем callback функцию в window
    (window as any).onTelegramAuth = onAuthCallback;

    // Создаем script для Telegram Widget
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', buttonSize);
    script.setAttribute('data-radius', cornerRadius.toString());
    script.setAttribute('data-request-access', requestAccess ? 'write' : '');
    script.setAttribute('data-userpic', usePic.toString());
    script.setAttribute('data-lang', lang);
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.async = true;

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(script);
    }

    return () => {
      delete (window as any).onTelegramAuth;
    };
  }, [botName, buttonSize, cornerRadius, requestAccess, usePic, lang, onAuthCallback]);

  return <div ref={containerRef} />;
};

export default memo(TelegramLoginButton);