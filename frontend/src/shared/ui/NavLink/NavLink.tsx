import { Button } from 'antd';
import { LinkProps, NavLink } from 'react-router-dom';
// import { REGISTRATION_ROUTE } from 'path';
import { FC } from 'react';

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
