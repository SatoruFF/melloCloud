import { SmileOutlined } from '@ant-design/icons';
import { unwrapResult } from '@reduxjs/toolkit';
import { Button, Form, Input, Spin, message, notification } from 'antd';
import Divider from 'antd/es/divider';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';

import { setUser } from '../../../entities/user/model/slice/userSlice';
import { useAppDispatch } from '../../../app/store/store';
import { userApi } from '../../../shared/api/user';
import { ACTIVATION_ROUTE, LOGIN_ROUTE } from '../../../shared/consts/routes';

import cn from 'classnames';
import styles from '../styles/auth.module.scss';

const Register = () => {
  const { t } = useTranslation();

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [regUser, { isLoading, error }]: any = userApi.useRegistrationMutation();

  const handleCreate = async () => {
    try {
      if (email == '' || password == '' || userName == '') {
        return message.error(`error: some field are empty`);
      }
      const inviteData = await regUser({
        userName,
        email,
        password,
      });
      unwrapResult(inviteData);
      dispatch(setUser(inviteData.data as any));
      notification.open({
        message: 'Success registration',
        description: `User with email: ${email} was created`,
        placement: 'topLeft',
        icon: <SmileOutlined style={{ color: '#108ee9' }} />,
      });
      navigate(ACTIVATION_ROUTE);
    } catch (e: any) {
      message.error(`error: ${error.data.message}`);
    }
  };

  return (
    <div className={cn(styles.rightSideForm)}>
      <div className={cn(styles.authFormTitle)}>{t('auth.registration')}</div>
      <Form layout="vertical">
        <Form.Item
          label={t('auth.nickname')}
          name="firstName"
          rules={[{ required: true, message: t('auth.nickname-warning') }]}
        >
          <Input
            value={userName}
            onChange={e => setUserName(e.target.value)}
            placeholder={t('auth.nickname-placeholder')}
          />
        </Form.Item>
        <Form.Item label={t('auth.email')} name="email" rules={[{ required: true, message: t('auth.email-warning') }]}>
          <Input value={email} onChange={e => setEmail(e.target.value)} placeholder={t('auth.email-placeholder')} />
        </Form.Item>
        <Form.Item
          label={t('auth.password')}
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input
            value={password}
            type="password"
            onChange={e => setPassword(e.target.value)}
            placeholder="please input your password here..."
          />
        </Form.Item>
      </Form>
      <div>
        {isLoading ? (
          <Spin />
        ) : (
          <Button onClick={() => handleCreate()} type="primary" htmlType="submit">
            {t('auth.submit')}
          </Button>
        )}
      </div>
      <Divider orientation="left">{t('auth.have-account')}</Divider>
      <Button>
        <NavLink to={LOGIN_ROUTE}>{t('auth.authorization')}</NavLink>
      </Button>
    </div>
  );
};

export default Register;
