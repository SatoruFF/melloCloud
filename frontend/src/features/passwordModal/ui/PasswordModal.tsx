import { Modal } from "antd";

const PasswordModal = ({ status, def }) => {
	const changePassword = () => {
		// ...
		def(false);
	};
	return (
		<Modal
			title="Change password"
			open={status}
			onOk={changePassword}
			onCancel={() => def(false)}
		></Modal>
	);
};

export default PasswordModal;
