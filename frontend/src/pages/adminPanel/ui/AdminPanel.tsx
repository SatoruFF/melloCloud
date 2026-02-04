import { ConfigProvider, Table, Tabs, Button, message, Modal, Form, Input, Select, Switch, InputNumber, Card, Statistic, Row, Col } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState, useCallback } from "react";
import { useTranslation, Trans } from "react-i18next";
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
import { sizeFormat, Spinner } from "../../../shared";
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
  const { t } = useTranslation();
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
      message.success(t("admin.messages.userUpdated"));
      setEditUserModal(null);
    } catch (e: any) {
      if (e?.data?.message) message.error(e.data.message);
      else if (e?.errorFields) return;
      else message.error(t("admin.messages.failedToUpdate"));
    }
  }, [editUserModal, form, updateUser, t]);

  const entityKeys = { user: 1, file: 1, note: 1, task: 1, event: 1, board: 1, flag: 1 } as const;
  type AdminEntityKey = keyof typeof entityKeys;

  const handleDelete = useCallback(
    async (mutation: (id: number) => any, id: number, entityKey: AdminEntityKey) => {
      const label = t(`admin.entities.${entityKey}`);
      try {
        await mutation(id).unwrap();
        message.success(t("admin.messages.deleted", { label }));
      } catch {
        message.error(t("admin.messages.failedToDelete", { label }));
      }
    },
    [t]
  );

  const userColumns: ColumnsType<Record<string, unknown>> = [
    { title: t("admin.columns.id"), dataIndex: "id", width: 70 },
    { title: t("admin.columns.userName"), dataIndex: "userName", ellipsis: true },
    { title: t("admin.columns.email"), dataIndex: "email", ellipsis: true },
    { title: t("admin.columns.role"), dataIndex: "role", width: 90 },
    { title: t("admin.columns.activated"), dataIndex: "isActivated", width: 90, render: (v: boolean) => (v ? t("common.yes") : t("common.no")) },
    { title: t("admin.columns.blocked"), dataIndex: "isBlocked", width: 80, render: (v: boolean) => (v ? t("common.yes") : t("common.no")) },
    { title: t("admin.columns.disk"), dataIndex: "diskSpace", width: 90 },
    { title: t("admin.columns.used"), dataIndex: "usedSpace", width: 90 },
    {
      title: t("admin.columns.actions"),
      width: 100,
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => handleEditUser(record as Parameters<typeof handleEditUser>[0])}>
          {t("admin.actions.edit")}
        </Button>
      ),
    },
  ];

  const fileColumns: ColumnsType<Record<string, unknown>> = [
    { title: t("admin.columns.id"), dataIndex: "id", width: 70 },
    { title: t("admin.columns.type"), dataIndex: "type", width: 80 },
    { title: t("admin.columns.size"), dataIndex: "size", width: 80 },
    { title: t("admin.columns.user"), dataIndex: ["user", "email"], ellipsis: true },
    { title: t("admin.columns.created"), dataIndex: "createdAt", width: 160 },
    {
      title: t("admin.columns.actions"),
      width: 100,
      render: (_, record) => (
        <Button type="link" danger size="small" onClick={() => handleDelete(deleteFile, record.id as number, "file")}>
          {t("admin.actions.delete")}
        </Button>
      ),
    },
  ];

  const noteColumns: ColumnsType<Record<string, unknown>> = [
    { title: t("admin.columns.id"), dataIndex: "id", width: 70 },
    { title: t("admin.columns.user"), dataIndex: ["user", "email"], ellipsis: true },
    { title: t("admin.columns.starred"), dataIndex: "isStarred", width: 80, render: (v: boolean) => (v ? t("common.yes") : t("common.no")) },
    { title: t("admin.columns.removed"), dataIndex: "isRemoved", width: 80, render: (v: boolean) => (v ? t("common.yes") : t("common.no")) },
    { title: t("admin.columns.created"), dataIndex: "createdAt", width: 160 },
    {
      title: t("admin.columns.actions"),
      width: 100,
      render: (_, record) => (
        <Button type="link" danger size="small" onClick={() => handleDelete(deleteNote, record.id as number, "note")}>
          {t("admin.actions.delete")}
        </Button>
      ),
    },
  ];

  const inviteColumns: ColumnsType<Record<string, unknown>> = [
    { title: t("admin.columns.id"), dataIndex: "id", width: 70 },
    { title: t("admin.columns.userName"), dataIndex: "userName", ellipsis: true },
    { title: t("admin.columns.email"), dataIndex: "email", ellipsis: true },
    { title: t("admin.columns.used"), dataIndex: "isUsed", width: 80, render: (v: boolean) => (v ? t("common.yes") : t("common.no")) },
    { title: t("admin.columns.created"), dataIndex: "createdAt", width: 180 },
  ];

  const sessionColumns: ColumnsType<Record<string, unknown>> = [
    { title: t("admin.columns.id"), dataIndex: "id", ellipsis: true, width: 120 },
    { title: t("admin.columns.user"), dataIndex: ["user", "email"], ellipsis: true },
    { title: t("admin.columns.userAgent"), dataIndex: "userAgent", ellipsis: true },
    { title: t("admin.columns.ip"), dataIndex: "ip", width: 120 },
    { title: t("admin.columns.lastActivity"), dataIndex: "lastActivity", width: 180 },
  ];

  const taskColumns: ColumnsType<Record<string, unknown>> = [
    { title: t("admin.columns.id"), dataIndex: "id", width: 70 },
    { title: t("admin.columns.status"), dataIndex: "status", width: 90 },
    { title: t("admin.columns.priority"), dataIndex: "priority", width: 90 },
    { title: t("admin.columns.user"), dataIndex: ["user", "email"], ellipsis: true },
    { title: t("admin.columns.created"), dataIndex: "createdAt", width: 160 },
    {
      title: t("admin.columns.actions"),
      width: 100,
      render: (_, record) => (
        <Button type="link" danger size="small" onClick={() => handleDelete(deleteTask, record.id as number, "task")}>
          {t("admin.actions.delete")}
        </Button>
      ),
    },
  ];

  const eventColumns: ColumnsType<Record<string, unknown>> = [
    { title: t("admin.columns.id"), dataIndex: "id", width: 70 },
    { title: t("admin.columns.start"), dataIndex: "startDate", width: 160 },
    { title: t("admin.columns.end"), dataIndex: "endDate", width: 160 },
    { title: t("admin.columns.user"), dataIndex: ["user", "email"], ellipsis: true },
    { title: t("admin.columns.created"), dataIndex: "createdAt", width: 160 },
    {
      title: t("admin.columns.actions"),
      width: 100,
      render: (_, record) => (
        <Button type="link" danger size="small" onClick={() => handleDelete(deleteEvent, record.id as number, "event")}>
          {t("admin.actions.delete")}
        </Button>
      ),
    },
  ];

  const boardColumns: ColumnsType<Record<string, unknown>> = [
    { title: t("admin.columns.id"), dataIndex: "id", width: 70 },
    { title: t("admin.columns.user"), dataIndex: ["user", "email"], ellipsis: true },
    { title: t("admin.columns.created"), dataIndex: "createdAt", width: 180 },
    {
      title: t("admin.columns.actions"),
      width: 100,
      render: (_, record) => (
        <Button type="link" danger size="small" onClick={() => handleDelete(deleteBoard, record.id as number, "board")}>
          {t("admin.actions.delete")}
        </Button>
      ),
    },
  ];

  const featureFlagColumns: ColumnsType<AdminFeatureFlagItem> = [
    { title: t("admin.columns.id"), dataIndex: "id", width: 70 },
    { title: t("admin.columns.key"), dataIndex: "key", width: 120 },
    { title: t("admin.columns.name"), dataIndex: "name", ellipsis: true },
    { title: t("admin.columns.description"), dataIndex: "description", ellipsis: true },
    { title: t("admin.columns.enabled"), dataIndex: "isEnabled", width: 90, render: (v: boolean) => (v ? t("common.yes") : t("common.no")) },
    { title: t("admin.columns.overrides"), dataIndex: ["_count", "enabledForUsers"], width: 90 },
    {
      title: t("admin.columns.actions"),
      width: 200,
      render: (_, record) => (
        <>
          <Button type="link" size="small" onClick={() => setOverrideModalFlag(record)}>
            {t("admin.actions.overrides")}
          </Button>
          <Button type="link" size="small" onClick={() => { setFeatureFlagModal(record); featureFlagForm.setFieldsValue({ key: record.key, name: record.name, description: record.description ?? "", isEnabled: record.isEnabled }); }}>
            {t("admin.actions.edit")}
          </Button>
          <Button type="link" danger size="small" onClick={() => handleDelete(deleteFeatureFlag, record.id, "flag")}>
            {t("admin.actions.delete")}
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
        message.success(t("admin.messages.featureFlagUpdated"));
      } else {
        await createFeatureFlag({ key: values.key, name: values.name, description: values.description || undefined, isEnabled: values.isEnabled }).unwrap();
        message.success(t("admin.messages.featureFlagCreated"));
      }
      setFeatureFlagModal(null);
    } catch (e: any) {
      if (e?.data?.message) message.error(e.data.message);
      else if (e?.errorFields) return;
      else message.error(t("admin.messages.failedToSave"));
    }
  }, [featureFlagModal, featureFlagForm, updateFeatureFlag, createFeatureFlag, t]);

  const handleAddOverride = useCallback(async () => {
    if (!overrideModalFlag) return;
    try {
      const values = await overrideForm.validateFields();
      await setFeatureFlagUser({
        featureFlagId: overrideModalFlag.id,
        userId: values.userId,
        isEnabled: values.isEnabled,
      }).unwrap();
      message.success(t("admin.messages.overrideSet"));
      overrideForm.resetFields();
      overrideForm.setFieldsValue({ isEnabled: true });
    } catch (e: any) {
      if (e?.data?.message) message.error(e.data.message);
      else if (e?.errorFields) return;
      else message.error(t("admin.messages.failedToSetOverride"));
    }
  }, [overrideModalFlag, overrideForm, setFeatureFlagUser, t]);

  const handleRemoveOverride = useCallback(
    async (userId: number) => {
      if (!overrideModalFlag) return;
      try {
        await removeFeatureFlagUser({ featureFlagId: overrideModalFlag.id, userId }).unwrap();
        message.success(t("admin.messages.overrideRemoved"));
      } catch {
        message.error(t("admin.messages.failedToRemoveOverride"));
      }
    },
    [overrideModalFlag, removeFeatureFlagUser, t]
  );

  const tabItems = [
    { key: "dashboard", label: t("admin.tabs.dashboard"), isDashboard: true },
    { key: "users", label: t("admin.tabs.users"), children: usersData?.data ?? [], columns: userColumns, loading: usersLoading, page: usersPage, total: usersData?.total ?? 0, setPage: setUsersPage },
    { key: "files", label: t("admin.tabs.files"), children: filesData?.data ?? [], columns: fileColumns, loading: filesLoading, page: filesPage, total: filesData?.total ?? 0, setPage: setFilesPage },
    { key: "notes", label: t("admin.tabs.notes"), children: notesData?.data ?? [], columns: noteColumns, loading: notesLoading, page: notesPage, total: notesData?.total ?? 0, setPage: setNotesPage },
    { key: "tasks", label: t("admin.tabs.tasks"), children: tasksData?.data ?? [], columns: taskColumns, loading: tasksLoading, page: tasksPage, total: tasksData?.total ?? 0, setPage: setTasksPage },
    { key: "events", label: t("admin.tabs.events"), children: eventsData?.data ?? [], columns: eventColumns, loading: eventsLoading, page: eventsPage, total: eventsData?.total ?? 0, setPage: setEventsPage },
    { key: "boards", label: t("admin.tabs.boards"), children: boardsData?.data ?? [], columns: boardColumns, loading: boardsLoading, page: boardsPage, total: boardsData?.total ?? 0, setPage: setBoardsPage },
    { key: "invites", label: t("admin.tabs.invites"), children: invitesData?.data ?? [], columns: inviteColumns, loading: invitesLoading, page: invitesPage, total: invitesData?.total ?? 0, setPage: setInvitesPage },
    { key: "sessions", label: t("admin.tabs.sessions"), children: sessionsData?.data ?? [], columns: sessionColumns, loading: sessionsLoading, page: sessionsPage, total: sessionsData?.total ?? 0, setPage: setSessionsPage },
    { key: "featureFlags", label: t("admin.tabs.featureFlags"), isFeatureFlags: true, children: featureFlagsData ?? [], columns: featureFlagColumns, loading: featureFlagsLoading },
  ];

  return (
    <ConfigProvider theme={darkTheme}>
      <div className={styles.root}>
        <h1 className={styles.title}>{t("admin.title")}</h1>
        <p className={styles.subtitle}><Trans i18nKey="admin.subtitle" components={[<code key="0" />]} /></p>

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
                      <Spinner size="large" />
                    ) : statsData ? (
                      <>
                        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                          <Col xs={24} sm={12} md={8}>
                            <Card size="small" className={styles.statCard}>
                              <Statistic
                                title={<span className={styles.statTitle}>{t("admin.dashboard.storageUsed")}</span>}
                                value={sizeFormat(Number(statsData.totalStorageUsed))}
                                valueStyle={{ color: "rgba(255,255,255,0.85)" }}
                              />
                            </Card>
                          </Col>
                          <Col xs={24} sm={12} md={8}>
                            <Card size="small" className={styles.statCard}>
                              <Statistic
                                title={<span className={styles.statTitle}>{t("admin.dashboard.storageLimit")}</span>}
                                value={sizeFormat(Number(statsData.totalStorageLimit))}
                                valueStyle={{ color: "rgba(255,255,255,0.85)" }}
                              />
                            </Card>
                          </Col>
                          <Col xs={24} sm={12} md={8}>
                            <Card size="small" className={styles.statCard}>
                              <Statistic
                                title={<span className={styles.statTitle}>{t("admin.dashboard.usage")}</span>}
                                value={statsData.usagePercent}
                                suffix="%"
                                valueStyle={{ color: "rgba(255,255,255,0.85)" }}
                              />
                            </Card>
                          </Col>
                          <Col xs={24} sm={8}>
                            <Card size="small" className={styles.statCard}>
                              <Statistic
                                title={<span className={styles.statTitle}>{t("admin.dashboard.users")}</span>}
                                value={statsData.usersCount}
                                valueStyle={{ color: "rgba(255,255,255,0.85)" }}
                              />
                            </Card>
                          </Col>
                          <Col xs={24} sm={8}>
                            <Card size="small" className={styles.statCard}>
                              <Statistic
                                title={<span className={styles.statTitle}>{t("admin.dashboard.files")}</span>}
                                value={statsData.filesCount}
                                valueStyle={{ color: "rgba(255,255,255,0.85)" }}
                              />
                            </Card>
                          </Col>
                          <Col xs={24} sm={8}>
                            <Card size="small" className={styles.statCard}>
                              <Statistic
                                title={<span className={styles.statTitle}>{t("admin.dashboard.notes")}</span>}
                                value={statsData.notesCount}
                                valueStyle={{ color: "rgba(255,255,255,0.85)" }}
                              />
                            </Card>
                          </Col>
                        </Row>
                        <Card
                          size="small"
                          title={<span className={styles.cardTitle}>{t("admin.dashboard.activeUsersByDay")}</span>}
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
                                  legend: t("admin.dashboard.usersAxis"),
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
                                      {t("admin.dashboard.activeUsersTooltip")} <strong>{value}</strong>
                                    </div>
                                  );
                                }}
                                enableLabel={false}
                                role="img"
                                ariaLabel="Active users by day chart"
                              />
                            </div>
                          ) : (
                            <p className={styles.chartEmpty}>{t("admin.dashboard.noActivityData")}</p>
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
                        {t("admin.createFeatureFlag")}
                      </Button>
                      <p style={{ marginTop: 8, color: "rgba(255,255,255,0.65)", fontSize: 12 }}>
                        {t("admin.featureFlagsHint")}
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
          title={t("admin.modals.editUser")}
          open={!!editUserModal}
          onCancel={() => setEditUserModal(null)}
          onOk={handleSaveUser}
          confirmLoading={updateUserLoading}
          destroyOnClose
          okText={t("admin.actions.save")}
        >
          {editUserModal && (
            <Form form={form} layout="vertical">
              <Form.Item name="userName" label={t("admin.columns.userName")} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="role" label={t("admin.columns.role")} rules={[{ required: true }]}>
                <Select options={[{ value: "USER", label: "USER" }, { value: "ADMIN", label: "ADMIN" }]} />
              </Form.Item>
              <Form.Item name="isActivated" label={t("admin.columns.activated")} valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="isBlocked" label={t("admin.modals.blockedHint")} valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="diskSpace" label={t("admin.modals.diskSpace")}>
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Form>
          )}
        </Modal>

        <Modal
          title={featureFlagModal?.id ? t("admin.modals.editFeatureFlag") : t("admin.modals.createFeatureFlag")}
          open={!!featureFlagModal}
          onCancel={() => setFeatureFlagModal(null)}
          onOk={handleSaveFeatureFlag}
          confirmLoading={updateFeatureFlagLoading}
          destroyOnClose
          okText={t("admin.actions.save")}
        >
          {featureFlagModal && (
            <Form form={featureFlagForm} layout="vertical">
              <Form.Item name="key" label={t("admin.modals.keyLabel")} rules={[{ required: true }]}>
                <Input placeholder={t("admin.modals.keyPlaceholder")} disabled={!!featureFlagModal.id} />
              </Form.Item>
              <Form.Item name="name" label={t("admin.columns.name")} rules={[{ required: true }]}>
                <Input placeholder={t("admin.modals.namePlaceholder")} />
              </Form.Item>
              <Form.Item name="description" label={t("admin.columns.description")}>
                <Input.TextArea rows={2} placeholder={t("admin.modals.descriptionPlaceholder")} />
              </Form.Item>
              <Form.Item name="isEnabled" label={t("admin.modals.enabledGlobally")} valuePropName="checked">
                <Switch />
              </Form.Item>
            </Form>
          )}
        </Modal>

        <Modal
          title={overrideModalFlag ? t("admin.modals.userOverrides", { name: overrideModalFlag.name }) : ""}
          open={!!overrideModalFlag}
          onCancel={() => { setOverrideModalFlag(null); overrideForm.resetFields(); }}
          footer={null}
          width={640}
          destroyOnClose
        >
          {overrideModalFlag && (
            <>
              <p style={{ marginBottom: 16, color: "rgba(255,255,255,0.65)", fontSize: 12 }}>
                {t("admin.modals.userOverridesHint")}
              </p>
              <div style={{ marginBottom: 16 }}>
                <Form form={overrideForm} layout="inline" onFinish={handleAddOverride} initialValues={{ isEnabled: true }}>
                  <Form.Item name="userId" label={t("admin.columns.user")} rules={[{ required: true, message: t("admin.modals.selectUser") }]} style={{ minWidth: 200 }}>
                    <Select
                      placeholder={t("admin.modals.selectUser")}
                      showSearch
                      optionFilterProp="label"
                      options={overrideUsersListData?.data?.map((u: any) => ({ value: u.id, label: u.email || u.userName || `#${u.id}` })) ?? []}
                    />
                  </Form.Item>
                  <Form.Item name="isEnabled" label={t("admin.columns.enabled")} valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={setOverrideLoading}>
                      {t("admin.modals.addOverride")}
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
                  { title: t("admin.columns.user"), key: "user", render: (_: any, r: any) => r.user?.email || r.user?.userName || `#${r.userId}` },
                  { title: t("admin.columns.enabled"), dataIndex: "isEnabled", width: 90, render: (v: boolean) => (v ? t("common.yes") : t("common.no")) },
                  {
                    title: t("admin.columns.actions"),
                    width: 90,
                    render: (_: any, r: any) => (
                      <Button type="link" danger size="small" onClick={() => handleRemoveOverride(r.userId)}>
                        {t("admin.actions.remove")}
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
