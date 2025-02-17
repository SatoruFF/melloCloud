import cn from 'classnames';

import { Layout } from 'antd';

import styles from './chats.module.scss';
import { UsersList } from '../../../widgets/usersList/index';

const Chats = () => {
  return (
    <Layout className={cn(styles.chatContainer)}>
      <UsersList></UsersList>
    </Layout>
  );
};

export default Chats;
