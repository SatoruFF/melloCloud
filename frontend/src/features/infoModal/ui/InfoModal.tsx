import { Form, Input, Modal, notification } from "antd";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "../../../app/store/store";
import { useChangeInfoMutation } from "../../../entities/user/model/api/user";
import { getUserSelector, updateUserInfo } from "../../../entities/user";

const InfoModal = ({ status, def }: { status: boolean; def: (v: boolean) => void }) => {
  const { t } = useTranslation();
  const user = useAppSelector(getUserSelector);
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [changeUser, { isLoading }] = useChangeInfoMutation();

  useEffect(() => {
    if (status && user) {
      form.setFieldsValue({ userName: user.userName ?? "" });
    }
  }, [status, user?.userName, form]);

  const onFinish = async (values: { userName?: string }) => {
    const trimmed = values.userName?.trim();
    if (trimmed == null || trimmed === (user?.userName ?? "")) {
      def(false);
      return;
    }
    const body = { userName: trimmed };
    try {
      const result = await changeUser(body).unwrap();
      dispatch(updateUserInfo(result));
      def(false);
      form.resetFields();
      notification.success({
        message: t("auth.change-profile-info"),
        description: t("common.saved", "Saved successfully"),
        placement: "topRight",
      });
    } catch (err: any) {
      notification.error({
        message: t("exceptions.just-error"),
        description: err?.data?.message ?? err?.message ?? "Failed to update profile",
        placement: "topRight",
      });
    }
  };

  const handleOk = () => {
    form.submit();
  };

  return (
    <Modal
      title={t("auth.change-profile-info")}
      open={status}
      onOk={handleOk}
      onCancel={() => def(false)}
      confirmLoading={isLoading}
      destroyOnClose
      afterClose={() => form.resetFields()}
    >
      <Form
        form={form}
        name="changeInfo"
        layout="vertical"
        initialValues={{ userName: "" }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label={t("auth.nickname")}
          name="userName"
          rules={[{ required: true, message: t("auth.nickname-warning") }]}
        >
          <Input placeholder={t("auth.nickname-placeholder")} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default InfoModal;
