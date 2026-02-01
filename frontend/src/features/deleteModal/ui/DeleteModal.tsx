import { Form, Input, Modal, notification } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useAppDispatch } from "../../../app/store/store";
import { useDeleteAccountMutation } from "../../../entities/user";
import { logout } from "../../../entities/user/model/slice/userSlice";
import { WELCOME_ROUTE } from "../../../shared/consts/routes";

const DeleteModal = ({ status, def }: { status: boolean; def: (v: boolean) => void }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [deleteAccount, { isLoading }] = useDeleteAccountMutation();

  const onFinish = async (values: { password: string }) => {
    try {
      await deleteAccount({ password: values.password }).unwrap();
      dispatch(logout());
      def(false);
      form.resetFields();
      navigate(WELCOME_ROUTE);
      notification.success({
        message: t("auth.delete-account"),
        description: t("auth.account-deleted"),
        placement: "topRight",
      });
    } catch (err: any) {
      notification.error({
        message: t("exceptions.just-error"),
        description: err?.data?.message ?? err?.message ?? "Failed to delete account",
        placement: "topRight",
      });
    }
  };

  const handleOk = () => {
    form.submit();
  };

  return (
    <Modal
      title={t("auth.delete-account")}
      open={status}
      onOk={handleOk}
      onCancel={() => def(false)}
      confirmLoading={isLoading}
      okButtonProps={{ danger: true }}
      destroyOnClose
      afterClose={() => form.resetFields()}
    >
      <p style={{ marginBottom: 16 }}>{t("auth.delete-account-confirm")}</p>
      <Form form={form} name="deleteAccount" layout="vertical" onFinish={onFinish} autoComplete="off">
        <Form.Item
          label={t("auth.password")}
          name="password"
          rules={[{ required: true, message: t("auth.password-warning") }]}
        >
          <Input.Password placeholder={t("auth.password-placeholder")} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DeleteModal;
