import { Dropdown, MenuProps, Space } from 'antd';
import {
  DownOutlined,
  FieldTimeOutlined,
  SendOutlined,
  SnippetsOutlined,
  CarryOutOutlined,
  FolderOpenOutlined,
  ApiOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { NavLink } from 'react-router-dom';
// import { useMediaQuery } from "react-responsive";
import { CHATS_ROUTE, FILE_ROUTE, NOTES_ROUTE, POMODORO_ROUTE, TODO_ROUTE } from '../../utils/consts';

const WorkspacesDropdown = ({ viewAll, logOut, setProfile }: { viewAll: boolean; logOut: any; setProfile: any }) => {
  const items: MenuProps['items'] = [
    {
      key: '1',
      label: <NavLink to={CHATS_ROUTE}>Chats</NavLink>,
      icon: <SendOutlined />,
    },
    {
      key: '2',
      label: <NavLink to={NOTES_ROUTE}>Notes</NavLink>,
      icon: <SnippetsOutlined />,
    },
    {
      key: '3',
      label: <NavLink to={TODO_ROUTE}>To-do</NavLink>,
      icon: <CarryOutOutlined />,
    },
    {
      key: '4',
      label: <NavLink to={POMODORO_ROUTE}>Pomodoro</NavLink>,
      danger: true,
      icon: <FieldTimeOutlined />,
    },
  ];

  if (viewAll) {
    items.push(
      {
        key: '5',
        label: <NavLink to={FILE_ROUTE}>Files</NavLink>,
        icon: <FolderOpenOutlined />,
      },
      {
        key: '6',
        label: <div onClick={() => setProfile(true)}>Settings</div>,
        icon: <SettingOutlined />,
      },
      {
        key: '7',
        label: <div onClick={() => logOut()}>Logout</div>,
        icon: <ApiOutlined />,
      },
    );
  }

  return (
    <Dropdown menu={{ items }}>
      <a onClick={(e) => e.preventDefault()}>
        <Space style={{ cursor: 'default', paddingRight: '30px' }}>
          workspace
          <DownOutlined />
        </Space>
      </a>
    </Dropdown>
  );
};

export default WorkspacesDropdown;
