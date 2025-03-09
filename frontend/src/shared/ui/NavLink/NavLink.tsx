import { Button } from 'antd';
// import { REGISTRATION_ROUTE } from 'path';
import { FC } from 'react';
import { LinkProps, NavLink } from 'react-router-dom';

interface ILink extends LinkProps {
  route: string;
  title: string;
}

const NavLinkComponent: FC<ILink> = ({}) => {
  return (
    <Button ghost>
      <NavLink to={REGISTRATION_ROUTE}>registration</NavLink>
    </Button>
  );
};

export default NavLinkComponent;
