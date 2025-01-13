import { useLocation } from 'react-router-dom';

import Register from '../../../components/Register';
import Login from '../../../components/Login';
import ParticleEffect from '../../../components/UI/ParticleEffect';

import styles from '../style/auth.module.scss';
import cn from 'classnames';

const Authorization = () => {
  const whereIAm = useLocation();

  return (
    <div className={cn(styles.authWrapper)}>
      <div className={cn(styles.authSpace)}>
        <div className={cn(styles.authLeftSide)}>
          <div className={cn(styles.leftSideTitle)}>
            Its time <br /> to wake up.
          </div>
        </div>
        <div className={cn(styles.authRightSide)}>
          <ParticleEffect />
          {whereIAm.pathname == '/login' ? <Login /> : <Register />}
        </div>
      </div>
    </div>
  );
};

export default Authorization;
