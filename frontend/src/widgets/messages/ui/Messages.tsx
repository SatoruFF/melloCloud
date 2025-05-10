import { Avatar, Input, List, Button } from 'antd';
import cn from 'classnames';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import MessagesList from './MessagesList';
import { Message } from '../../../entities/message/index';

import styles from './messages.module.scss';

const Messages = () => {
  const { t } = useTranslation();
  const initialMessages = [];

  // FIXME: typo
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: 'Me',
      text: inputValue,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      self: true,
    };

    setMessages([...messages, newMessage]);
    setInputValue('');
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={styles.messagesWrapper}>
      <MessagesList messages={messages} />
      <div className={styles.inputWrapper}>
        <Input.TextArea
          placeholder={t('messages.messages-input-placeholder')}
          className={styles.textArea}
          autoSize={{ minRows: 1, maxRows: 4 }}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onPressEnter={handleInputKeyDown}
        />
        <Button type="text" icon={<Send />} onClick={handleSendMessage} className={styles.sendButton} />
      </div>
    </div>
  );
};

export default Messages;
