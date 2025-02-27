import React from 'react';
import { useState } from 'react';
import { List, Avatar } from 'antd';
import { ResizableBox } from 'react-resizable';
import cn from 'classnames';

import styles from './users-list.module.scss';
import { Search } from '../../../shared';

const UsersList: React.FC = () => {
  const [search, onSearch] = useState('');
  const [messages, setMessages] = useState([
    { text: 'Can you do it?', sender: 'You' },
    { text: 'Yea all right', sender: 'John' },
  ]);

  return (
    <ResizableBox
      width={300} // Начальная ширина
      height={Infinity}
      axis="x"
      minConstraints={[200, 100]} // Минимальная ширина
      maxConstraints={[500, 100]} // Максимальная ширина
      // className={cn(styles.usersListWrapper)}
    >
      <div className={cn(styles.usersListWrapper)}>
        <Search onSearch={onSearch} className={styles.searchChats}></Search>
        <List
          dataSource={messages}
          renderItem={msg => (
            <List.Item>
              <List.Item.Meta avatar={<Avatar>{msg.sender[0]}</Avatar>} title={msg.sender} description={msg.text} />
            </List.Item>
          )}
        />
      </div>
    </ResizableBox>
  );
};

export default UsersList;
