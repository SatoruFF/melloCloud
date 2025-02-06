import { useState } from 'react';
import { Form, Input, Checkbox, Button, Spin, message, notification } from 'antd';
import Divider from 'antd/es/divider';
import { NavLink, useNavigate } from 'react-router-dom';
import { SmileOutlined } from '@ant-design/icons';
import { unwrapResult } from '@reduxjs/toolkit';
import { useTranslation } from 'react-i18next';

import { FILE_ROUTE, REGISTRATION_ROUTE } from '../../../shared/consts/routes';
import { useAppDispatch } from '../../../app/store/store';
import { setUser } from '../../../app/store/reducers/userSlice';
import { userApi } from '../../../shared/api/user';

import styles from '../styles/auth.module.scss';
import cn from 'classnames';

const Login = () => {
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [setLogin, { isLoading, error: logError }]: any = userApi.useLoginMutation();
  // const isAuth = useAppSelector((state) => state.users.isAuth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleClick = async () => {
    try {
      if (email == '' || password == '') {
        return message.error(`error: some fields are empty`);
      }
      const user: any = await setLogin({
        email,
        password,
      });
      if (logError) {
        return message.error(`error: ${logError.error}`); // idk why, but if stat code != 200, this code does not fall to catch
      }
      unwrapResult(user);
      const userData = user.data ? user.data : user;
      dispatch(setUser(userData as any));
      notification.open({
        message: 'Success log in',
        description: `User with email: ${email} has log in`,
        placement: 'topLeft',
        icon: <SmileOutlined style={{ color: '#52c41a' }} />,
      });
      navigate(FILE_ROUTE);
    } catch (e: any) {
      message.error(`error: ${e.data.message || e.error}`);
    }
  };

  return (
    <div className={cn(styles.rightSideForm)}>
      <div className={cn(styles.authFormTitle)}>{t('auth.authorization')}</div>
      <Form layout="vertical">
        <Form.Item label={t('auth.email')} name="email" rules={[{ required: true, message: t('auth.email-warning') }]}>
          <Input value={email} onChange={e => setEmail(e.target.value)} placeholder={t('auth.email-placeholder')} />
        </Form.Item>
        <Form.Item
          label={t('auth.password')}
          name="password"
          rules={[{ required: true, message: t('auth.password-warning') }]}
        >
          <Input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={t('auth.password-placeholder')}
          />
        </Form.Item>
        <Form.Item name="remember" valuePropName="checked">
          <Checkbox>{t('auth.remember')}</Checkbox>
        </Form.Item>
        <Form.Item>
          <div>
            {isLoading ? (
              <Spin />
            ) : (
              <Button onClick={() => handleClick()} type="primary" htmlType="submit">
                {t('auth.submit')}
              </Button>
            )}
          </div>
        </Form.Item>
        <Divider orientation="left">{t('auth.no-account')}</Divider>
        <Button>
          <NavLink to={REGISTRATION_ROUTE}>{t('auth.create-profile')}</NavLink>{' '}
        </Button>
      </Form>
    </div>
  );
};

export default Login;
