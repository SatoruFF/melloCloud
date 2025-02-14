import { ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface IPortal {
  children: ReactNode;
  element?: HTMLElement;
}

const Portal = ({ children, element = document.body }: IPortal) => {
  return createPortal(children, element);
};

export default Portal;
