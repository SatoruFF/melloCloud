import { Modal } from 'antd';

const DeleteModal = ({ status, def }) => {
  const deleteHandler = () => {
    // ...
    def(false);
  };
  return <Modal title="Delete account" open={status} onOk={deleteHandler} onCancel={() => def(false)}></Modal>;
};

export default DeleteModal;
