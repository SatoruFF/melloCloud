import { Form, Input, Modal } from 'antd';
import _ from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '../../../app/store/store';
import { useChangeInfoMutation } from '../../../shared/api/user';

const InfoModal = ({ status, def }) => {
  const { t } = useTranslation();
  const [userName, setUserName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const user = useAppSelector(state => state.user);
  const [changeUser, { data, isLoading, isError }] = useChangeInfoMutation();
  const changeInfo = () => {
    def(false);
  };
  return (
    <Modal title={t('auth.change-profile-info')} open={status} onOk={changeInfo} onCancel={() => def(false)}>
      <Form
        name="changeInfo"
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        // onFinish={onFinish}
        // onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item label={t('auth.nickname')} name="Username">
          <Input placeholder={user.userName} value={userName} onChange={(e: any) => setUserName(e.target.value)} />
        </Form.Item>
        <Form.Item label={t('auth.email')} name="Email">
          <Input placeholder={user.email} value={email} onChange={(e: any) => setEmail(e.target.value)} />
        </Form.Item>
        <Form.Item
          label={t('auth.password')}
          name="Password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input
            type="password"
            placeholder="Confirm password"
            value={password}
            onChange={(e: any) => setPassword(e.target.value)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default InfoModal;
