import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import { Button } from 'antd';

import styles from './PageError.module.scss';

const PageError = () => {
  const { t } = useTranslation();

  const reloadPage = () => location.reload();

  return (
    <div className={cn(styles.pageErrorWrapper)}>
      <div className={cn(styles.pageErrorContent)}>
        <p className={cn(styles.pageErrorTitle)}>{t('exceptions.just-error')}</p>
        <Button onClick={reloadPage}>{t('buttons.reload-page')}</Button>
      </div>
    </div>
  );
};

export default PageError;
