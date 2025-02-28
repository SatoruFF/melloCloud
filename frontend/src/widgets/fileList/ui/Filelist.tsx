import { Empty } from 'antd';
import { useAppSelector } from '../../../app/store/store';
import File from '../../../entities/file/ui/File';

import cn from 'classnames';
import styles from '../styles/fileList.module.scss';
import { IFile } from '../../../entities/file';
import { memo } from 'react';

// const mockFiles = new Array(1000).fill({
//   id: '10',
//   name: 'landscape.png',
//   type: 'file',
//   size: 3245678,
//   url: 'https://img.icons8.com/?size=512&id=44442&format=png',
//   updatedAt: '2023-10-06T16:49:28',
// });

const Filelist: React.FC = () => {
  const files = useAppSelector(state => state.files.files);
  const fileView = useAppSelector(state => state.files.view);

  if (files.length === 0) {
    return (
      <h1 className={cn(styles.filesNotFound, 'animate__animated animate__fadeIn')}>
        <Empty className="emptyFolder" />{' '}
      </h1>
    );
  }

  if (fileView == 'plate') {
    return (
      <div className={cn(styles.fileplateListWrapper, 'animate__animated animate__fadeIn')}>
        {files.map((file: IFile) => (
          <File key={Math.random()} file={file} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn(styles.filelistWrapper, 'animate__animated animate__fadeIn')}>
      <div className={cn(styles.fileListHeader)}>
        <p className={cn(styles.name)}>Name</p>
        <p className={cn(styles.date)}>Date</p>
        <p className={cn(styles.size)}>Size</p>
      </div>

      {files.map((file: IFile) => (
        <File key={Math.random()} file={file} />
      ))}
    </div>
  );
};

export default memo(Filelist);
