import { Layout, Menu, Avatar, Typography } from 'antd';
import { SearchOutlined, SettingOutlined, FileAddOutlined, DeleteOutlined } from '@ant-design/icons';
import cn from 'classnames';
import styles from './notes-sidebar.module.scss';

const { Sider } = Layout;
const { Text } = Typography;

const NotesSidebar = () => {
  return (
    <Sider width={240} className={cn(styles.sidebar)}>
      <div className={styles.header}>
        <Avatar className={styles.avatar}>A</Avatar>
        <Text strong className={styles.username}>
          Holden Caulfield
        </Text>
      </div>
      <Menu mode="vertical" className={styles.menu}>
        <Menu.Item icon={<SearchOutlined />} className={styles.menuItem}>
          Search
        </Menu.Item>
        <Menu.Item icon={<SettingOutlined />} className={styles.menuItem}>
          Settings
        </Menu.Item>
        <Menu.Item icon={<FileAddOutlined />} className={styles.menuItem}>
          New page
        </Menu.Item>
        <Menu.Item icon={<FileAddOutlined />} className={styles.menuItem}>
          Add a page
        </Menu.Item>
        <Menu.Item icon={<DeleteOutlined />} className={styles.menuItem}>
          Trash
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default NotesSidebar;
