import { Form, Input, Modal, notification } from "antd";
import { useTranslation } from "react-i18next";

import { useChangePasswordMutation } from "../../../entities/user";

const PasswordModal = ({ status, def }: { status: boolean; def: (v: boolean) => void }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const onFinish = async (values: { currentPassword: string; newPassword: string }) => {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();
      def(false);
      form.resetFields();
      notification.success({
        message: t("auth.change-password"),
        description: t("auth.password-changed"),
        placement: "topRight",
      });
    } catch (err: any) {
      notification.error({
        message: t("exceptions.just-error"),
        description: err?.data?.message ?? err?.message ?? "Failed to change password",
        placement: "topRight",
      });
    }
  };

  const handleOk = () => {
    form.submit();
  };

  return (
    <Modal
      title={t("auth.change-password")}
      open={status}
      onOk={handleOk}
      onCancel={() => def(false)}
      confirmLoading={isLoading}
      destroyOnClose
      afterClose={() => form.resetFields()}
    >
      <Form
        form={form}
        name="changePassword"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label={t("auth.current-password")}
          name="currentPassword"
          rules={[{ required: true, message: t("auth.password-warning") }]}
        >
          <Input.Password placeholder={t("auth.password-placeholder")} />
        </Form.Item>
        <Form.Item
          label={t("auth.new-password")}
          name="newPassword"
          rules={[
            { required: true, message: t("auth.password-warning") },
            { min: 6, message: "At least 6 characters" },
          ]}
        >
          <Input.Password placeholder={t("auth.password-placeholder")} />
        </Form.Item>
        <Form.Item
          label={t("auth.confirm-password")}
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: t("auth.password-warning") },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match"));
              },
            }),
          ]}
        >
          <Input.Password placeholder={t("auth.password-placeholder")} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PasswordModal;
