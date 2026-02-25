import { Button } from 'antd';
import type { FC } from 'react';
import { NavLink } from 'react-router-dom';

interface ILink {
  route: string;
  title: string;
}

const NavLinkComponent: FC<ILink> = ({ route, title }) => {
  return (
    <Button ghost>
      <NavLink to={route}>
        {title}
      </NavLink>
    </Button>
  );
};

export default NavLinkComponent;
