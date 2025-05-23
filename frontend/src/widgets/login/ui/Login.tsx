import { SmileOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, message, notification } from 'antd';
import Divider from 'antd/es/divider';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';

import { useAppDispatch } from '../../../app/store/store';
import { userApi } from '../../../entities/user/model/api/user';
import { setUser } from '../../../entities/user/model/slice/userSlice';
import { FILE_ROUTE, REGISTRATION_ROUTE } from '../../../shared/consts/routes';

import cn from 'classnames';
import { Spinner } from '../../../shared';
import styles from '../styles/auth.module.scss';

const Login = () => {
  const { t } = useTranslation();

  const [messageApi, errContextHolder] = message.useMessage();
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
      }).unwrap();

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
      const errorMsg = e?.data?.message || e?.error || e?.message || 'Unknown error occurred';
      messageApi.open({
        type: 'error',
        content: errorMsg,
      });
    }
  };

  return (
    <div className={cn(styles.rightSideForm)}>
      {errContextHolder}
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
              <Spinner />
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
