import { useLocation } from 'react-router-dom';

import Register from '../../../widgets/register/ui/Register';
import Login from '../../../widgets/login/ui/Login';
import ParticleEffect from '../../../shared/ui/particleEffect/ParticleEffect';

import styles from '../styles/auth.module.scss';
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
