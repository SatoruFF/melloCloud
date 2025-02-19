import cn from 'classnames';

import { Layout } from 'antd';

import styles from './chats.module.scss';
import { UsersList } from '../../../widgets/usersList/index';
import { Messages } from '../../../widgets/messages';

const Chats = () => {
  return (
    <Layout className={cn(styles.chatContainer)}>
      <UsersList></UsersList>
      <Messages></Messages>
    </Layout>
  );
};

export default Chats;
