import React from 'react';
import { useState } from 'react';
import { List, Avatar } from 'antd';
import cn from 'classnames';

import styles from './users-list.module.scss';

const UsersList: React.FC = () => {
  const [messages, setMessages] = useState([
    { text: '123', sender: 'You' },
    { text: '123', sender: 'You' },
  ]);

  return (
    <div className={cn(styles.usersListWrapper)}>
      <List
        dataSource={messages}
        renderItem={msg => (
          <List.Item>
            <List.Item.Meta avatar={<Avatar>{msg.sender[0]}</Avatar>} title={msg.sender} description={msg.text} />
          </List.Item>
        )}
      />
    </div>
  );
};

export default UsersList;
