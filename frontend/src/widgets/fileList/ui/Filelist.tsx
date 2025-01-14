import { Empty } from 'antd';
import { useAppSelector } from '../../../app/store/store';
import File from '../../../entities/file/ui/File';

import cn from 'classnames';
import styles from '../style/fileList.module.scss';

const Filelist = () => {
  const files = useAppSelector((state) => state.files.files);
  const fileView = useAppSelector((state) => state.files.view);

  if (files.length === 0) {
    return (
      <h1 className={cn(styles.filesNotFound, 'animate__animated animate__fadeIn')}>
        {' '}
        <Empty className="emptyFolder" />{' '}
      </h1>
    );
  }

  if (fileView == 'plate') {
    return (
      <div className={cn(styles.fileplateListWrapper, 'animate__animated animate__fadeIn')}>
        {files.map((file: any) => (
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

      {files.map((file: any) => (
        <File key={Math.random()} file={file} />
      ))}
    </div>
  );
};

export default Filelist;
