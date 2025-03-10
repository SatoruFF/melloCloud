import { Empty } from 'antd';
import { useAppSelector } from '../../../app/store/store';
import File from '../../../entities/file/ui/File';

import cn from 'classnames';
import { memo, useCallback } from 'react';
import { IFile } from '../../../entities/file';
import { ObservablePage } from '../../../shared';
import styles from './fileList.module.scss';

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

  const onLoadNextPart = useCallback(() => {
    // debugger;
    console.log(123); // TODO: add offset and limit logic with state and add loading
  }, []);

  if (files.length === 0) {
    return (
      <h1 className={cn(styles.filesNotFound, 'animate__animated animate__fadeIn')}>
        <Empty className="emptyFolder" />{' '}
      </h1>
    );
  }

  if (fileView == 'plate') {
    return (
      <ObservablePage onScrollEnd={onLoadNextPart}>
        <div className={cn(styles.filePlateListWrapper, 'animate__animated animate__fadeIn')}>
          {files.map((file: IFile) => (
            <File key={Math.random()} file={file} />
          ))}
        </div>
      </ObservablePage>
    );
  }

  return (
    <ObservablePage onScrollEnd={onLoadNextPart}>
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
    </ObservablePage>
  );
};

// TODO: add sceletons on load

export default memo(Filelist);
