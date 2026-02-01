import { ConfigProvider, Table, Tabs, Button, message, Modal, Form, Input, Select, Switch, InputNumber, Card, Statistic, Row, Col, Spin } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState, useCallback } from "react";
import { ResponsiveBar } from "@nivo/bar";
import {
  useGetAdminUsersQuery,
  useUpdateAdminUserMutation,
  useGetAdminFilesQuery,
  useDeleteAdminFileMutation,
  useGetAdminNotesQuery,
  useDeleteAdminNoteMutation,
  useGetAdminInvitesQuery,
  useGetAdminSessionsQuery,
  useGetAdminStatsQuery,
  useGetAdminTasksQuery,
  useDeleteAdminTaskMutation,
  useGetAdminEventsQuery,
  useDeleteAdminEventMutation,
  useGetAdminBoardsQuery,
  useDeleteAdminBoardMutation,
  useGetAdminFeatureFlagsQuery,
  useCreateAdminFeatureFlagMutation,
  useUpdateAdminFeatureFlagMutation,
  useDeleteAdminFeatureFlagMutation,
  useGetAdminFeatureFlagUsersQuery,
  useSetAdminFeatureFlagUserMutation,
  useRemoveAdminFeatureFlagUserMutation,
  type AdminFeatureFlagItem,
} from "../../../features/admin/api/adminApi";
import { sizeFormat } from "../../../shared";
import styles from "./admin-panel.module.scss";

// Ant Design dark theme
const darkTheme = {
  token: {
    colorBgContainer: "#1f1f1f",
    colorBgElevated: "#1f1f1f",
    colorBorder: "#303030",
    colorText: "rgba(255,255,255,0.85)",
    colorTextSecondary: "rgba(255,255,255,0.65)",
    colorPrimary: "#1890ff",
  },
  components: {
    Table: {
      colorBgContainer: "#1f1f1f",
      colorBorderSecondary: "#303030",
    },
    Modal: {
      contentBg: "#1f1f1f",
      headerBg: "#1f1f1f",
    },
    Input: { colorBgContainer: "#141414" },
    Select: { colorBgContainer: "#141414" },
  },
};

const PAGE_SIZE = 20;

const AdminPanel = () => {
  const [usersPage, setUsersPage] = useState(1);
  const [filesPage, setFilesPage] = useState(1);
  const [notesPage, setNotesPage] = useState(1);
  const [invitesPage, setInvitesPage] = useState(1);
  const [sessionsPage, setSessionsPage] = useState(1);
  const [tasksPage, setTasksPage] = useState(1);
  const [eventsPage, setEventsPage] = useState(1);
  const [boardsPage, setBoardsPage] = useState(1);
  const [editUserModal, setEditUserModal] = useState<{ id: number; userName: string | null; email: string; role: string; isActivated: boolean; isBlocked: boolean; diskSpace: string } | null>(null);
  const [featureFlagModal, setFeatureFlagModal] = useState<AdminFeatureFlagItem | null>(null);
  const [featureFlagForm] = Form.useForm();
  const [overrideModalFlag, setOverrideModalFlag] = useState<AdminFeatureFlagItem | null>(null);
  const [overrideForm] = Form.useForm();

  const { data: statsData, isLoading: statsLoading } = useGetAdminStatsQuery();
  const { data: usersData, isLoading: usersLoading } = useGetAdminUsersQuery({ page: usersPage, limit: PAGE_SIZE });
  const { data: filesData, isLoading: filesLoading } = useGetAdminFilesQuery({ page: filesPage, limit: PAGE_SIZE });
  const { data: notesData, isLoading: notesLoading } = useGetAdminNotesQuery({ page: notesPage, limit: PAGE_SIZE });
  const { data: invitesData, isLoading: invitesLoading } = useGetAdminInvitesQuery({ page: invitesPage, limit: PAGE_SIZE });
  const { data: sessionsData, isLoading: sessionsLoading } = useGetAdminSessionsQuery({ page: sessionsPage, limit: PAGE_SIZE });
  const { data: tasksData, isLoading: tasksLoading } = useGetAdminTasksQuery({ page: tasksPage, limit: PAGE_SIZE });
  const { data: eventsData, isLoading: eventsLoading } = useGetAdminEventsQuery({ page: eventsPage, limit: PAGE_SIZE });
  const { data: boardsData, isLoading: boardsLoading } = useGetAdminBoardsQuery({ page: boardsPage, limit: PAGE_SIZE });
  const { data: featureFlagsData, isLoading: featureFlagsLoading } = useGetAdminFeatureFlagsQuery();
  const { data: overrideUsersData, isLoading: overrideUsersLoading } = useGetAdminFeatureFlagUsersQuery(
    overrideModalFlag?.id ?? 0,
    { skip: !overrideModalFlag }
  );
  const { data: overrideUsersListData } = useGetAdminUsersQuery(
    { page: 1, limit: 500 },
    { skip: !overrideModalFlag }
  );

  const [updateUser, { isLoading: updateUserLoading }] = useUpdateAdminUserMutation();
  const [createFeatureFlag] = useCreateAdminFeatureFlagMutation();
  const [updateFeatureFlag, { isLoading: updateFeatureFlagLoading }] = useUpdateAdminFeatureFlagMutation();
  const [deleteFeatureFlag] = useDeleteAdminFeatureFlagMutation();
  const [setFeatureFlagUser, { isLoading: setOverrideLoading }] = useSetAdminFeatureFlagUserMutation();
  const [removeFeatureFlagUser] = useRemoveAdminFeatureFlagUserMutation();
  const [deleteFile] = useDeleteAdminFileMutation();
  const [deleteNote] = useDeleteAdminNoteMutation();
  const [deleteTask] = useDeleteAdminTaskMutation();
  const [deleteEvent] = useDeleteAdminEventMutation();
  const [deleteBoard] = useDeleteAdminBoardMutation();

  const [form] = Form.useForm();

  const handleEditUser = useCallback((record: { id: number; userName: string | null; email: string; role: string; isActivated: boolean; isBlocked: boolean; diskSpace: string }) => {
    setEditUserModal(record);
    form.setFieldsValue({
      userName: record.userName ?? "",
      role: record.role,
      isActivated: record.isActivated,
      isBlocked: record.isBlocked ?? false,
      diskSpace: Number(record.diskSpace) || 0,
    });
  }, [form]);

  const handleSaveUser = useCallback(async () => {
    if (!editUserModal) return;
    try {
      const values = await form.validateFields();
      await updateUser({
        id: editUserModal.id,
        userName: values.userName,
        role: values.role,
        isActivated: values.isActivated,
        isBlocked: values.isBlocked,
        diskSpace: values.diskSpace,
      }).unwrap();
      message.success("User updated");
      setEditUserModal(null);
    } catch (e: any) {
      if (e?.data?.message) message.error(e.data.message);
      else if (e?.errorFields) return;
      else message.error("Failed to update");
    }
  }, [editUserModal, form, updateUser]);

  const handleDelete = useCallback(
    async (mutation: (id: number) => any, id: number, label: string) => {
      try {
        await mutation(id).unwrap();
        message.success(`${label} deleted`);
      } catch {
        message.error(`Failed to delete ${label.toLowerCase()}`);
      }
    },
    []
  );

  const userColumns: ColumnsType<Record<string, unknown>> = [
    { title: "ID", dataIndex: "id", width: 70 },
    { title: "User name", dataIndex: "userName", ellipsis: true },
    { title: "Email", dataIndex: "email", ellipsis: true },
    { title: "Role", dataIndex: "role", width: 90 },
    { title: "Activated", dataIndex: "isActivated", width: 90, render: (v: boolean) => (v ? "Yes" : "No") },
    { title: "Blocked", dataIndex: "isBlocked", width: 80, render: (v: boolean) => (v ? "Yes" : "No") },
    { title: "Disk", dataIndex: "diskSpace", width: 90 },
    { title: "Used", dataIndex: "usedSpace", width: 90 },
    {
      title: "Actions",
      width: 100,
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => handleEditUser(record as Parameters<typeof handleEditUser>[0])}>
          Edit
        </Button>
      ),
    },
  ];

  const fileColumns: ColumnsType<Record<string, unknown>> = [
    { title: "ID", dataIndex: "id", width: 70 },
    { title: "Type", dataIndex: "type", width: 80 },
    { title: "Size", dataIndex: "size", width: 80 },
    { title: "User", dataIndex: ["user", "email"], ellipsis: true },
    { title: "Created", dataIndex: "createdAt", width: 160 },
    {
      title: "Actions",
      width: 100,
      render: (_, record) => (
        <Button type="link" danger size="small" onClick={() => handleDelete(deleteFile, record.id as number, "File")}>
          Delete
        </Button>
      ),
    },
  ];

  const noteColumns: ColumnsType<Record<string, unknown>> = [
    { title: "ID", dataIndex: "id", width: 70 },
    { title: "User", dataIndex: ["user", "email"], ellipsis: true },
    { title: "Starred", dataIndex: "isStarred", width: 80, render: (v: boolean) => (v ? "Yes" : "No") },
    { title: "Removed", dataIndex: "isRemoved", width: 80, render: (v: boolean) => (v ? "Yes" : "No") },
    { title: "Created", dataIndex: "createdAt", width: 160 },
    {
      title: "Actions",
      width: 100,
      render: (_, record) => (
        <Button type="link" danger size="small" onClick={() => handleDelete(deleteNote, record.id as number, "Note")}>
          Delete
        </Button>
      ),
    },
  ];

  const inviteColumns: ColumnsType<Record<string, unknown>> = [
    { title: "ID", dataIndex: "id", width: 70 },
    { title: "User name", dataIndex: "userName", ellipsis: true },
    { title: "Email", dataIndex: "email", ellipsis: true },
    { title: "Used", dataIndex: "isUsed", width: 80, render: (v: boolean) => (v ? "Yes" : "No") },
    { title: "Created", dataIndex: "createdAt", width: 180 },
  ];

  const sessionColumns: ColumnsType<Record<string, unknown>> = [
    { title: "ID", dataIndex: "id", ellipsis: true, width: 120 },
    { title: "User", dataIndex: ["user", "email"], ellipsis: true },
    { title: "User agent", dataIndex: "userAgent", ellipsis: true },
    { title: "IP", dataIndex: "ip", width: 120 },
    { title: "Last activity", dataIndex: "lastActivity", width: 180 },
  ];

  const taskColumns: ColumnsType<Record<string, unknown>> = [
    { title: "ID", dataIndex: "id", width: 70 },
    { title: "Status", dataIndex: "status", width: 90 },
    { title: "Priority", dataIndex: "priority", width: 90 },
    { title: "User", dataIndex: ["user", "email"], ellipsis: true },
    { title: "Created", dataIndex: "createdAt", width: 160 },
    {
      title: "Actions",
      width: 100,
      render: (_, record) => (
        <Button type="link" danger size="small" onClick={() => handleDelete(deleteTask, record.id as number, "Task")}>
          Delete
        </Button>
      ),
    },
  ];

  const eventColumns: ColumnsType<Record<string, unknown>> = [
    { title: "ID", dataIndex: "id", width: 70 },
    { title: "Start", dataIndex: "startDate", width: 160 },
    { title: "End", dataIndex: "endDate", width: 160 },
    { title: "User", dataIndex: ["user", "email"], ellipsis: true },
    { title: "Created", dataIndex: "createdAt", width: 160 },
    {
      title: "Actions",
      width: 100,
      render: (_, record) => (
        <Button type="link" danger size="small" onClick={() => handleDelete(deleteEvent, record.id as number, "Event")}>
          Delete
        </Button>
      ),
    },
  ];

  const boardColumns: ColumnsType<Record<string, unknown>> = [
    { title: "ID", dataIndex: "id", width: 70 },
    { title: "User", dataIndex: ["user", "email"], ellipsis: true },
    { title: "Created", dataIndex: "createdAt", width: 180 },
    {
      title: "Actions",
      width: 100,
      render: (_, record) => (
        <Button type="link" danger size="small" onClick={() => handleDelete(deleteBoard, record.id as number, "Board")}>
          Delete
        </Button>
      ),
    },
  ];

  const featureFlagColumns: ColumnsType<AdminFeatureFlagItem> = [
    { title: "ID", dataIndex: "id", width: 70 },
    { title: "Key", dataIndex: "key", width: 120 },
    { title: "Name", dataIndex: "name", ellipsis: true },
    { title: "Description", dataIndex: "description", ellipsis: true },
    { title: "Enabled", dataIndex: "isEnabled", width: 90, render: (v: boolean) => (v ? "Yes" : "No") },
    { title: "Overrides", dataIndex: ["_count", "enabledForUsers"], width: 90 },
    {
      title: "Actions",
      width: 200,
      render: (_, record) => (
        <>
          <Button type="link" size="small" onClick={() => setOverrideModalFlag(record)}>
            Overrides
          </Button>
          <Button type="link" size="small" onClick={() => { setFeatureFlagModal(record); featureFlagForm.setFieldsValue({ key: record.key, name: record.name, description: record.description ?? "", isEnabled: record.isEnabled }); }}>
            Edit
          </Button>
          <Button type="link" danger size="small" onClick={() => handleDelete(deleteFeatureFlag, record.id, "Flag")}>
            Delete
          </Button>
        </>
      ),
    },
  ];

  const handleCreateFeatureFlag = useCallback(() => {
    setFeatureFlagModal(null);
    featureFlagForm.resetFields();
    featureFlagForm.setFieldsValue({ isEnabled: false });
    setFeatureFlagModal({ id: 0, key: "", name: "", description: null, isEnabled: false, _count: { enabledForUsers: 0 } } as AdminFeatureFlagItem);
  }, [featureFlagForm]);

  const handleSaveFeatureFlag = useCallback(async () => {
    try {
      const values = await featureFlagForm.validateFields();
      if (featureFlagModal?.id) {
        await updateFeatureFlag({ id: featureFlagModal.id, key: values.key, name: values.name, description: values.description || null, isEnabled: values.isEnabled }).unwrap();
        message.success("Feature flag updated");
      } else {
        await createFeatureFlag({ key: values.key, name: values.name, description: values.description || undefined, isEnabled: values.isEnabled }).unwrap();
        message.success("Feature flag created");
      }
      setFeatureFlagModal(null);
    } catch (e: any) {
      if (e?.data?.message) message.error(e.data.message);
      else if (e?.errorFields) return;
      else message.error("Failed to save");
    }
  }, [featureFlagModal, featureFlagForm, updateFeatureFlag, createFeatureFlag]);

  const handleAddOverride = useCallback(async () => {
    if (!overrideModalFlag) return;
    try {
      const values = await overrideForm.validateFields();
      await setFeatureFlagUser({
        featureFlagId: overrideModalFlag.id,
        userId: values.userId,
        isEnabled: values.isEnabled,
      }).unwrap();
      message.success("Override set");
      overrideForm.resetFields();
      overrideForm.setFieldsValue({ isEnabled: true });
    } catch (e: any) {
      if (e?.data?.message) message.error(e.data.message);
      else if (e?.errorFields) return;
      else message.error("Failed to set override");
    }
  }, [overrideModalFlag, overrideForm, setFeatureFlagUser]);

  const handleRemoveOverride = useCallback(
    async (userId: number) => {
      if (!overrideModalFlag) return;
      try {
        await removeFeatureFlagUser({ featureFlagId: overrideModalFlag.id, userId }).unwrap();
        message.success("Override removed");
      } catch {
        message.error("Failed to remove override");
      }
    },
    [overrideModalFlag, removeFeatureFlagUser]
  );

  const tabItems = [
    { key: "dashboard", label: "Dashboard", isDashboard: true },
    { key: "users", label: "Users", children: usersData?.data ?? [], columns: userColumns, loading: usersLoading, page: usersPage, total: usersData?.total ?? 0, setPage: setUsersPage },
    { key: "files", label: "Files", children: filesData?.data ?? [], columns: fileColumns, loading: filesLoading, page: filesPage, total: filesData?.total ?? 0, setPage: setFilesPage },
    { key: "notes", label: "Notes", children: notesData?.data ?? [], columns: noteColumns, loading: notesLoading, page: notesPage, total: notesData?.total ?? 0, setPage: setNotesPage },
    { key: "tasks", label: "Tasks", children: tasksData?.data ?? [], columns: taskColumns, loading: tasksLoading, page: tasksPage, total: tasksData?.total ?? 0, setPage: setTasksPage },
    { key: "events", label: "Events", children: eventsData?.data ?? [], columns: eventColumns, loading: eventsLoading, page: eventsPage, total: eventsData?.total ?? 0, setPage: setEventsPage },
    { key: "boards", label: "Boards", children: boardsData?.data ?? [], columns: boardColumns, loading: boardsLoading, page: boardsPage, total: boardsData?.total ?? 0, setPage: setBoardsPage },
    { key: "invites", label: "Invites", children: invitesData?.data ?? [], columns: inviteColumns, loading: invitesLoading, page: invitesPage, total: invitesData?.total ?? 0, setPage: setInvitesPage },
    { key: "sessions", label: "Sessions", children: sessionsData?.data ?? [], columns: sessionColumns, loading: sessionsLoading, page: sessionsPage, total: sessionsData?.total ?? 0, setPage: setSessionsPage },
    { key: "featureFlags", label: "Feature flags", isFeatureFlags: true, children: featureFlagsData ?? [], columns: featureFlagColumns, loading: featureFlagsLoading },
  ];

  return (
    <ConfigProvider theme={darkTheme}>
      <div className={styles.root}>
        <h1 className={styles.title}>Admin panel</h1>
        <p className={styles.subtitle}>
          Only users in <code>ADMIN_USER_IDS</code> can access this page. Manage users, files, notes, tasks, events, boards, invites, and view sessions.
        </p>

        <Tabs
          className={styles.tabs}
          defaultActiveKey="dashboard"
          items={tabItems.map((item: any) => {
            if (item.isDashboard) {
              return {
                key: item.key,
                label: item.label,
                children: (
                  <div className={styles.dashboard}>
                    {statsLoading ? (
                      <Spin size="large" />
                    ) : statsData ? (
                      <>
                        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                          <Col xs={24} sm={12} md={8}>
                            <Card size="small" className={styles.statCard}>
                              <Statistic
                                title={<span className={styles.statTitle}>Storage used</span>}
                                value={sizeFormat(Number(statsData.totalStorageUsed))}
                                valueStyle={{ color: "rgba(255,255,255,0.85)" }}
                              />
                            </Card>
                          </Col>
                          <Col xs={24} sm={12} md={8}>
                            <Card size="small" className={styles.statCard}>
                              <Statistic
                                title={<span className={styles.statTitle}>Storage limit</span>}
                                value={sizeFormat(Number(statsData.totalStorageLimit))}
                                valueStyle={{ color: "rgba(255,255,255,0.85)" }}
                              />
                            </Card>
                          </Col>
                          <Col xs={24} sm={12} md={8}>
                            <Card size="small" className={styles.statCard}>
                              <Statistic
                                title={<span className={styles.statTitle}>Usage</span>}
                                value={statsData.usagePercent}
                                suffix="%"
                                valueStyle={{ color: "rgba(255,255,255,0.85)" }}
                              />
                            </Card>
                          </Col>
                          <Col xs={24} sm={8}>
                            <Card size="small" className={styles.statCard}>
                              <Statistic
                                title={<span className={styles.statTitle}>Users</span>}
                                value={statsData.usersCount}
                                valueStyle={{ color: "rgba(255,255,255,0.85)" }}
                              />
                            </Card>
                          </Col>
                          <Col xs={24} sm={8}>
                            <Card size="small" className={styles.statCard}>
                              <Statistic
                                title={<span className={styles.statTitle}>Files</span>}
                                value={statsData.filesCount}
                                valueStyle={{ color: "rgba(255,255,255,0.85)" }}
                              />
                            </Card>
                          </Col>
                          <Col xs={24} sm={8}>
                            <Card size="small" className={styles.statCard}>
                              <Statistic
                                title={<span className={styles.statTitle}>Notes</span>}
                                value={statsData.notesCount}
                                valueStyle={{ color: "rgba(255,255,255,0.85)" }}
                              />
                            </Card>
                          </Col>
                        </Row>
                        <Card
                          size="small"
                          title={<span className={styles.cardTitle}>Active users by day (last 14 days)</span>}
                          className={styles.statCard}
                        >
                          {statsData.activeUsersByDay?.length ? (
                            <div className={styles.chartWrap} style={{ height: 280 }}>
                              <ResponsiveBar
                                data={statsData.activeUsersByDay.map((d) => ({
                                  date: d.date.slice(5),
                                  count: d.count,
                                  fullDate: d.date,
                                }))}
                                indexBy="date"
                                keys={["count"]}
                                margin={{ top: 16, right: 16, left: 48, bottom: 48 }}
                                padding={0.35}
                                valueScale={{ type: "linear" }}
                                indexScale={{ type: "band", round: true }}
                                colors="#1890ff"
                                borderRadius={4}
                                axisTop={null}
                                axisRight={null}
                                axisBottom={{
                                  tickSize: 0,
                                  tickPadding: 8,
                                  tickRotation: -45,
                                  legend: "",
                                  truncateTickAt: 0,
                                }}
                                axisLeft={{
                                  tickSize: 0,
                                  tickPadding: 8,
                                  tickRotation: 0,
                                  legend: "Users",
                                  legendPosition: "middle",
                                  legendOffset: -40,
                                  truncateTickAt: 0,
                                }}
                                theme={{
                                  axis: {
                                    ticks: {
                                      text: { fill: "rgba(255,255,255,0.65)", fontSize: 11 },
                                    },
                                    domain: {
                                      line: { stroke: "#303030", strokeWidth: 1 },
                                    },
                                  },
                                  grid: {
                                    line: { stroke: "#303030", strokeWidth: 1, strokeDasharray: "3 3" },
                                  },
                                  tooltip: {
                                    container: {
                                      background: "#1f1f1f",
                                      border: "1px solid #303030",
                                      borderRadius: 6,
                                      color: "rgba(255,255,255,0.85)",
                                      fontSize: 12,
                                    },
                                  },
                                }}
                                tooltip={({ value, indexValue }) => {
                                  const fullDate = statsData.activeUsersByDay?.find(
                                    (d) => d.date.slice(5) === indexValue
                                  )?.date;
                                  return (
                                    <div
                                      style={{
                                        padding: "8px 12px",
                                        background: "#1f1f1f",
                                        border: "1px solid #303030",
                                        borderRadius: 6,
                                        color: "rgba(255,255,255,0.85)",
                                        fontSize: 12,
                                      }}
                                    >
                                      <strong>{fullDate ?? indexValue}</strong>
                                      <br />
                                      Active users: <strong>{value}</strong>
                                    </div>
                                  );
                                }}
                                enableLabel={false}
                                role="img"
                                ariaLabel="Active users by day chart"
                              />
                            </div>
                          ) : (
                            <p className={styles.chartEmpty}>No activity data</p>
                          )}
                        </Card>
                      </>
                    ) : null}
                  </div>
                ),
              };
            }
            if (item.isFeatureFlags) {
              const { key, label, children, columns, loading } = item;
              return {
                key,
                label,
                children: (
                  <div className={styles.tableWrap}>
                    <div style={{ marginBottom: 16 }}>
                      <Button type="primary" onClick={handleCreateFeatureFlag}>
                        Create feature flag
                      </Button>
                      <p style={{ marginTop: 8, color: "rgba(255,255,255,0.65)", fontSize: 12 }}>
                        Key must match frontend: files, notes, chats, planner, kanban, webhooks. Global &quot;Enabled&quot; = for everyone; use &quot;User overrides&quot; in DB for per-user.
                      </p>
                    </div>
                    <Table
                      rowKey="id"
                      loading={loading}
                      columns={columns}
                      dataSource={children}
                      size="small"
                      scroll={{ x: 700 }}
                      pagination={false}
                    />
                  </div>
                ),
              };
            }
            const { key, label, children, columns, loading, page, total, setPage } = item;
            return {
              key,
              label,
              children: (
                <div className={styles.tableWrap}>
                  <Table
                    rowKey="id"
                    loading={loading}
                    columns={columns}
                    dataSource={children}
                    pagination={{
                      current: page,
                      pageSize: PAGE_SIZE,
                      total,
                      onChange: setPage,
                      showSizeChanger: false,
                    }}
                    size="small"
                    scroll={{ x: 700 }}
                  />
                </div>
              ),
            };
          })}
        />

        <Modal
          title="Edit user"
          open={!!editUserModal}
          onCancel={() => setEditUserModal(null)}
          onOk={handleSaveUser}
          confirmLoading={updateUserLoading}
          destroyOnClose
          okText="Save"
        >
          {editUserModal && (
            <Form form={form} layout="vertical">
              <Form.Item name="userName" label="User name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="role" label="Role" rules={[{ required: true }]}>
                <Select options={[{ value: "USER", label: "USER" }, { value: "ADMIN", label: "ADMIN" }]} />
              </Form.Item>
              <Form.Item name="isActivated" label="Activated" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="isBlocked" label="Blocked (access denied)" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="diskSpace" label="Disk space (bytes)">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Form>
          )}
        </Modal>

        <Modal
          title={featureFlagModal?.id ? "Edit feature flag" : "Create feature flag"}
          open={!!featureFlagModal}
          onCancel={() => setFeatureFlagModal(null)}
          onOk={handleSaveFeatureFlag}
          confirmLoading={updateFeatureFlagLoading}
          destroyOnClose
          okText="Save"
        >
          {featureFlagModal && (
            <Form form={featureFlagForm} layout="vertical">
              <Form.Item name="key" label="Key (e.g. files, notes)" rules={[{ required: true }]}>
                <Input placeholder="files" disabled={!!featureFlagModal.id} />
              </Form.Item>
              <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input placeholder="Files" />
              </Form.Item>
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={2} placeholder="File storage feature" />
              </Form.Item>
              <Form.Item name="isEnabled" label="Enabled globally" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Form>
          )}
        </Modal>

        <Modal
          title={overrideModalFlag ? `User overrides: ${overrideModalFlag.name}` : ""}
          open={!!overrideModalFlag}
          onCancel={() => { setOverrideModalFlag(null); overrideForm.resetFields(); }}
          footer={null}
          width={640}
          destroyOnClose
        >
          {overrideModalFlag && (
            <>
              <p style={{ marginBottom: 16, color: "rgba(255,255,255,0.65)", fontSize: 12 }}>
                Per-user overrides: if a user is listed below, their value overrides the global &quot;Enabled&quot; for this flag.
              </p>
              <div style={{ marginBottom: 16 }}>
                <Form form={overrideForm} layout="inline" onFinish={handleAddOverride} initialValues={{ isEnabled: true }}>
                  <Form.Item name="userId" label="User" rules={[{ required: true, message: "Select user" }]} style={{ minWidth: 200 }}>
                    <Select
                      placeholder="Select user"
                      showSearch
                      optionFilterProp="label"
                      options={overrideUsersListData?.data?.map((u: any) => ({ value: u.id, label: u.email || u.userName || `#${u.id}` })) ?? []}
                    />
                  </Form.Item>
                  <Form.Item name="isEnabled" label="Enabled" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={setOverrideLoading}>
                      Add override
                    </Button>
                  </Form.Item>
                </Form>
              </div>
              <Table
                rowKey="userId"
                loading={overrideUsersLoading}
                dataSource={overrideUsersData ?? []}
                size="small"
                columns={[
                  { title: "User", key: "user", render: (_: any, r: any) => r.user?.email || r.user?.userName || `#${r.userId}` },
                  { title: "Enabled", dataIndex: "isEnabled", width: 90, render: (v: boolean) => (v ? "Yes" : "No") },
                  {
                    title: "Actions",
                    width: 90,
                    render: (_: any, r: any) => (
                      <Button type="link" danger size="small" onClick={() => handleRemoveOverride(r.userId)}>
                        Remove
                      </Button>
                    ),
                  },
                ]}
                pagination={false}
              />
            </>
          )}
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default AdminPanel;
