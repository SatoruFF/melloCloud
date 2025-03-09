import cn from 'classnames';

import { Layout } from 'antd';

import { Messages } from '../../../widgets/messages';
import { UsersList } from '../../../widgets/usersList/index';
import styles from './chats.module.scss';

const Chats = () => {
  return (
    <Layout className={cn(styles.chatContainer)}>
      <UsersList />
      <Messages />
    </Layout>
  );
};

export default Chats;
