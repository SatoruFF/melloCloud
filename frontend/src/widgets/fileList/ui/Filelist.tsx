import { Empty } from 'antd';
import { useAppDispatch, useAppSelector } from '../../../app/store/store';
import File from '../../../entities/file/ui/File';

import cn from 'classnames';
import { memo, useCallback, useEffect, useRef } from 'react';
import type { IFile } from '../../../entities/file';
import {
  getFilesHasMoreSelector,
  getFilesLimitSelector,
  getFilesLoadingSelector,
  getFilesOffsetSelector,
  getFilesSelector,
  getFilesViewSelector,
} from '../../../entities/file/model/selectors/getFiles';
// import { setOffset } from '../../../entities/file/model/slice/fileSlice';
import { ObservablePage } from '../../../shared';
import styles from './fileList.module.scss';

const Filelist: React.FC = () => {
  const files = useAppSelector(getFilesSelector);
  const fileView = useAppSelector(getFilesViewSelector);
  const limit = useAppSelector(getFilesLimitSelector);
  const offset = useAppSelector(getFilesOffsetSelector);
  const filesLoading = useAppSelector(getFilesLoadingSelector);
  const hasMoreFiles = useAppSelector(getFilesHasMoreSelector);

  const dispatch = useAppDispatch();
  const isFetchingRef = useRef(false);

  const onLoadNextPart = useCallback(() => {
    // debugger
    if (isFetchingRef.current || filesLoading) return;

    isFetchingRef.current = true;

    if (hasMoreFiles) {
      // dispatch(setOffset(offset + limit));
    }
  }, [offset, limit, filesLoading]);

  useEffect(() => {
    isFetchingRef.current = false;
  }, [offset]);

  if (files.length === 0) {
    return (
      <h1 className={cn(styles.filesNotFound, 'animate__animated animate__fadeIn')}>
        <Empty className="emptyFolder" />{' '}
      </h1>
    );
  }

  if (fileView === 'plate') {
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
