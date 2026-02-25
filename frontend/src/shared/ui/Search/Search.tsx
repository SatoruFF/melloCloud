import { Input } from 'antd';
import cn from 'classnames';
import type { ReactNode } from 'react';

import styles from './search.module.scss';

const { Search } = Input;

interface ISearchProps {
  placeholder?: string;
  className?: string;
  onSearch: (value: string) => void;
  enterButton?: ReactNode;
}

const CustomSearch: React.FC<ISearchProps> = ({
  placeholder = 'find something',
  className = '',
  onSearch,
  enterButton,
}) => {
  return (
    <Search
      placeholder={placeholder}
      className={cn(styles.search, className)}
      onSearch={onSearch}
      enterButton={enterButton ?? true}
    />
  );
};

export default CustomSearch;
