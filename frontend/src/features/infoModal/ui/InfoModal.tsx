import { Form, Input, Modal, message } from 'antd';
import { useAppSelector, useAppDispatch } from '../../../app/store/store';
import { useChangeInfoMutation } from '../../../shared/api/user';
import { useState } from 'react';
import _ from 'lodash';

const InfoModal = ({ status, def }) => {
  const [userName, setUserName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const user = useAppSelector((state) => state.users.currentUser);
  const [changeUser, { data, isLoading, isError }] = useChangeInfoMutation();
  const changeInfo = () => {
    def(false);
  };
  return (
    <Modal title="Change profile info" open={status} onOk={changeInfo} onCancel={() => def(false)}>
      <Form
        name="changeInfo"
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        // onFinish={onFinish}
        // onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item label="Username" name="Username">
          <Input placeholder={user.userName} value={userName} onChange={(e: any) => setUserName(e.target.value)} />
        </Form.Item>
        <Form.Item label="Email" name="Email">
          <Input placeholder={user.email} value={email} onChange={(e: any) => setEmail(e.target.value)} />
        </Form.Item>
        <Form.Item
          label="Password"
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
