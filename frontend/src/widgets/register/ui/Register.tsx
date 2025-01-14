import { useState } from 'react';
import { Form, Input, Button, message, Spin, notification } from 'antd';
import Divider from 'antd/es/divider';
import { NavLink, useNavigate } from 'react-router-dom';
import { unwrapResult } from '@reduxjs/toolkit';
import { SmileOutlined } from '@ant-design/icons';

import { LOGIN_ROUTE, ACTIVATION_ROUTE } from '../../../shared/consts/consts';
import { userApi } from '../../../shared/api/user';
import { useAppDispatch } from '../../../app/store/store';
import { setUser } from '../../../app/store/reducers/userSlice';

import styles from '../styles/auth.module.scss';
import cn from 'classnames';

const Register = () => {
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
      <div className={cn(styles.authFormTitle)}>Registration</div>
      <Form layout="vertical">
        <Form.Item
          label="username:"
          name="firstName"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="please input your username here..."
          />
        </Form.Item>
        <Form.Item label="email:" name="email" rules={[{ required: true, message: 'Please input your email!' }]}>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="please input your email here..."
          />
        </Form.Item>
        <Form.Item
          label="password:"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="please input your password here..."
          />
        </Form.Item>
      </Form>
      <div>
        {isLoading ? (
          <Spin />
        ) : (
          <Button onClick={() => handleCreate()} type="primary" htmlType="submit">
            Submit
          </Button>
        )}
      </div>
      <Divider orientation="left">Already have account?</Divider>
      <Button>
        <NavLink to={LOGIN_ROUTE}>Log in</NavLink>
      </Button>
    </div>
  );
};

export default Register;
