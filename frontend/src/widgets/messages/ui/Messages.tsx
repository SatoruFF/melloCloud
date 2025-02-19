import { Avatar, List, Input } from 'antd';
import cn from 'classnames';
import styles from './messages.module.scss';
import { useState } from 'react';

const Messages = () => {
  const initialMessages = [
    { id: 1, sender: 'Alice', text: 'Привет! Как дела?', time: '10:30', self: false },
    { id: 2, sender: 'Me', text: 'Привет! Все хорошо, а у тебя?', time: '10:32', self: true },
    { id: 3, sender: 'Alice', text: 'Тоже отлично! Чем занимаешься?', time: '10:35', self: false },
    { id: 4, sender: 'Me', text: 'Пишу код 😎', time: '10:36', self: true },
  ];

  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: 'Me',
      text: inputValue,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
      <List
        className={styles.messageList}
        dataSource={messages}
        renderItem={item => (
          <List.Item className={cn(styles.messageItem, { [styles.self]: item.self })}>
            {!item.self && <Avatar className={styles.avatar}>{item.sender[0]}</Avatar>}
            <div className={styles.messageContent}>
              <div className={styles.messageText}>{item.text}</div>
              <div className={styles.messageTime}>{item.time}</div>
            </div>
          </List.Item>
        )}
      />
      <Input.TextArea
        placeholder="Введите сообщение..."
        className={styles.input}
        autoSize
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onPressEnter={handleInputKeyDown}
      />
    </div>
  );
};

export default Messages;
