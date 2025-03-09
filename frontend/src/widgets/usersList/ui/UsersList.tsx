import { Avatar, List } from 'antd';
import cn from 'classnames';
import React from 'react';
import { useState } from 'react';
import { ResizableBox } from 'react-resizable';

import { Search } from '../../../shared';
import styles from './users-list.module.scss';

const UsersList: React.FC = () => {
  const [search, onSearch] = useState('');
  const [messages, setMessages] = useState([
    { text: 'Can you do it?', sender: 'You' },
    { text: 'Yea all right', sender: 'John' },
  ]);

  const [width, setWidth] = useState(300);

  return (
    <ResizableBox
      width={width}
      height={0} // Даем ему расти по содержимому
      axis="x"
      minConstraints={[200, 100]}
      maxConstraints={[500, 100]}
      onResizeStop={(e, { size }) => setWidth(size.width)}
    >
      <div className={cn(styles.usersListWrapper)} style={{ width }}>
        <Search onSearch={onSearch} className={styles.searchChats} />
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
