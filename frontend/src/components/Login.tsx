import { useState } from 'react';
import { Form, Input, Checkbox, Button, Spin, message, notification } from 'antd';
import Divider from 'antd/es/divider';
import { NavLink, useNavigate } from 'react-router-dom';
import { SmileOutlined } from '@ant-design/icons';
import { unwrapResult } from '@reduxjs/toolkit';
import Ajv from 'ajv';

import { FILE_ROUTE, REGISTRATION_ROUTE } from '../utils/consts';
import { useAppDispatch, useAppSelector } from '../store/store';
import { setUser } from '../store/reducers/userSlice';
import { userApi } from './services/user';

import styles from '../style/auth.module.scss';
import cn from 'classnames';

const Login = () => {
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
      <div className={cn(styles.authFormTitle)}>Login</div>
      <Form layout="vertical">
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
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="please input your password here..."
          />
        </Form.Item>
        <Form.Item name="remember" valuePropName="checked">
          <Checkbox>Remember me</Checkbox>
        </Form.Item>
        <Form.Item>
          <div>
            {isLoading ? (
              <Spin />
            ) : (
              <Button onClick={() => handleClick()} type="primary" htmlType="submit">
                Submit
              </Button>
            )}
          </div>
        </Form.Item>
        <Divider orientation="left">No account?</Divider>
        <Button>
          <NavLink to={REGISTRATION_ROUTE}>Create profile</NavLink>{' '}
        </Button>
      </Form>
    </div>
  );
};

export default Login;
