import { useState } from 'react';
import { Input, Button, List, Avatar, Card } from 'antd';

const Chats = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: 'You' }]);
      setInput('');
    }
  };

  return (
    <Card style={{ width: 400, margin: 'auto', padding: 10 }}>
      <List
        dataSource={messages}
        renderItem={msg => (
          <List.Item>
            <List.Item.Meta avatar={<Avatar>{msg.sender[0]}</Avatar>} title={msg.sender} description={msg.text} />
          </List.Item>
        )}
        style={{ maxHeight: 300, overflowY: 'auto' }}
      />
      <Input.Group compact>
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onPressEnter={sendMessage}
          placeholder="Type a message..."
          style={{ width: '80%' }}
        />
        <Button type="primary" onClick={sendMessage}>
          Send
        </Button>
      </Input.Group>
    </Card>
  );
};

export default Chats;
