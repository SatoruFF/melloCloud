import {
  ApiOutlined,
  CarryOutOutlined,
  DownOutlined,
  FieldTimeOutlined,
  FolderOpenOutlined,
  SendOutlined,
  SettingOutlined,
  SnippetsOutlined,
} from '@ant-design/icons';
import { Dropdown, MenuProps, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
// import { useMediaQuery } from "react-responsive";
import { CHATS_ROUTE, FILE_ROUTE, NOTES_ROUTE, POMODORO_ROUTE, TODO_ROUTE } from '../../../shared/consts/routes';

const WorkspacesDropdown = ({ viewAll, logOut, setProfile }: { viewAll: boolean; logOut: any; setProfile: any }) => {
  const { t } = useTranslation();

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: <NavLink to={CHATS_ROUTE}>{t('tabs.chats')}</NavLink>,
      icon: <SendOutlined />,
    },
    {
      key: '2',
      label: <NavLink to={NOTES_ROUTE}>{t('tabs.notes')}</NavLink>,
      icon: <SnippetsOutlined />,
    },
    {
      key: '3',
      label: <NavLink to={TODO_ROUTE}>{t('tabs.to-do')}</NavLink>,
      icon: <CarryOutOutlined />,
    },
    {
      key: '4',
      label: <NavLink to={POMODORO_ROUTE}>{t('tabs.pomodoro')}</NavLink>,
      danger: true,
      icon: <FieldTimeOutlined />,
    },
  ];

  if (viewAll) {
    items.push(
      {
        key: '5',
        label: <NavLink to={FILE_ROUTE}>{t('tabs.files')}</NavLink>,
        icon: <FolderOpenOutlined />,
      },
      {
        key: '6',
        label: <div onClick={() => setProfile(true)}>{t('tabs.settings')}</div>,
        icon: <SettingOutlined />,
      },
      {
        key: '7',
        label: <div onClick={() => logOut()}>{t('auth.logout')}</div>,
        icon: <ApiOutlined />,
      },
    );
  }

  return (
    <Dropdown menu={{ items }}>
      <a onClick={e => e.preventDefault()}>
        <Space style={{ cursor: 'default', paddingRight: '30px' }}>
          {t('workspace')}
          <DownOutlined />
        </Space>
      </a>
    </Dropdown>
  );
};

export default WorkspacesDropdown;
