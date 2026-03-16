import { useState } from "react";
import { Card, Button, Tag, Table, Row, Col, Divider, Select, Spin, message, ConfigProvider, theme } from "antd";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { getUserSelector } from "../../../entities/user";
import { getEffectivePlan } from "../../../entities/user/model/types/user";
import {
  useGetSubscriptionConfigQuery,
  useGetPaymentHistoryQuery,
  useCreateStripePaymentMutation,
  useCreateYookassaPaymentMutation,
} from "../../../entities/subscription/model/api/subscriptionApi";
import { sizeFormat } from "../../../shared/utils/sizeFormat";
import styles from "./subscription-page.module.scss";

const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorBgContainer: "#1f1f1f",
    colorBgElevated: "#1f1f1f",
    colorBorder: "#303030",
    colorPrimary: "#1890ff",
  },
};

const PLAN_COLOR: Record<string, string> = { FREE: "default", PRO: "blue", ENTERPRISE: "gold" };
const PERIOD_OPTIONS = [
  { value: 1, label: "1 mo" },
  { value: 3, label: "3 mo" },
  { value: 6, label: "6 mo" },
  { value: 12, label: "12 mo" },
];

const SubscriptionPage = () => {
  const { t } = useTranslation();
  const currentUser = useSelector(getUserSelector);
  const effectivePlan = getEffectivePlan(currentUser);
  const [selectedPeriod, setSelectedPeriod] = useState(1);

  const { data: config, isLoading: configLoading } = useGetSubscriptionConfigQuery();
  const { data: history, isLoading: historyLoading } = useGetPaymentHistoryQuery();
  const [createStripe, { isLoading: stripeLoading }] = useCreateStripePaymentMutation();
  const [createYookassa, { isLoading: yookassaLoading }] = useCreateYookassaPaymentMutation();

  const handleStripe = async (plan: "PRO" | "ENTERPRISE") => {
    try {
      const res = await createStripe({ plan, periodMonths: selectedPeriod, currency: "usd" }).unwrap();
      window.open(res.url, "_blank");
    } catch {
      message.error(t("subscription.paymentError"));
    }
  };

  const handleYookassa = async (plan: "PRO" | "ENTERPRISE") => {
    try {
      const res = await createYookassa({ plan, periodMonths: selectedPeriod }).unwrap();
      window.open(res.url, "_blank");
    } catch {
      message.error(t("subscription.paymentError"));
    }
  };

  const isExpired =
    currentUser?.subscriptionExpiresAt &&
    new Date(currentUser.subscriptionExpiresAt) < new Date();

  if (configLoading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    );
  }

  const subscriptionsEnabled = config?.isEnabled ?? false;

  return (
    <ConfigProvider theme={darkTheme}>
    <div className={styles.root}>
      <h1 className={styles.title}>{t("subscription.pageTitle")}</h1>

      {/* Current plan */}
      <Card className={styles.currentPlanCard}>
        <div className={styles.currentPlan}>
          <div>
            <span className={styles.planLabel}>{t("subscription.currentPlan")}</span>
            <Tag color={PLAN_COLOR[effectivePlan] ?? "default"} className={styles.planTag}>
              {effectivePlan}
              {isExpired && ` (${t("subscription.expired")})`}
            </Tag>
          </div>
          {currentUser?.subscriptionExpiresAt && !isExpired && (
            <span className={styles.expiryNote}>
              {t("subscription.expiresOn", {
                date: new Date(currentUser.subscriptionExpiresAt).toLocaleDateString(),
              })}
            </span>
          )}
        </div>
        <div className={styles.limits}>
          {config && (
            <>
              <span>
                {t("subscription.storageLimit")}: {sizeFormat(Number(effectivePlan === "PRO" ? config.proStorageBytes : effectivePlan === "ENTERPRISE" ? config.enterpriseStorageBytes : config.freeStorageBytes))}
              </span>
              <span>
                {t("subscription.notesLimit")}: {
                  (effectivePlan === "PRO" ? config.proMaxNotes : effectivePlan === "ENTERPRISE" ? config.enterpriseMaxNotes : config.freeMaxNotes) === 0
                    ? t("subscription.unlimited")
                    : effectivePlan === "PRO" ? config.proMaxNotes : effectivePlan === "ENTERPRISE" ? config.enterpriseMaxNotes : config.freeMaxNotes
                }
              </span>
              <span>
                {t("subscription.collaboratorsLimit")}: {
                  (effectivePlan === "PRO" ? config.proMaxCollaborators : effectivePlan === "ENTERPRISE" ? config.enterpriseMaxCollaborators : config.freeMaxCollaborators) === 0
                    ? t("subscription.unlimited")
                    : effectivePlan === "PRO" ? config.proMaxCollaborators : effectivePlan === "ENTERPRISE" ? config.enterpriseMaxCollaborators : config.freeMaxCollaborators
                }
              </span>
              <span>
                {t("subscription.videoCall")}: {
                  (effectivePlan === "PRO" ? config.proVideoCall : effectivePlan === "ENTERPRISE" ? config.enterpriseVideoCall : config.freeVideoCall)
                    ? t("common.yes")
                    : t("common.no")
                }
              </span>
            </>
          )}
        </div>
      </Card>

      {!subscriptionsEnabled && (
        <Card className={styles.disabledCard}>
          <p>{t("subscription.systemDisabled")}</p>
        </Card>
      )}

      {subscriptionsEnabled && config && (
        <>
          <div className={styles.periodSelector}>
            <span>{t("subscription.period")}: </span>
            <Select
              value={selectedPeriod}
              onChange={setSelectedPeriod}
              options={PERIOD_OPTIONS}
              style={{ width: 120 }}
            />
          </div>

          <Row gutter={[16, 16]} className={styles.plans}>
            {/* FREE */}
            <Col xs={24} sm={8}>
              <Card
                className={`${styles.planCard} ${effectivePlan === "FREE" ? styles.activePlan : ""}`}
                title={<Tag color="default">FREE</Tag>}
              >
                <ul className={styles.featureList}>
                  <li>{t("subscription.storage")}: {sizeFormat(Number(config.freeStorageBytes))}</li>
                  <li>{t("subscription.maxNotes")}: {config.freeMaxNotes === 0 ? t("subscription.unlimited") : config.freeMaxNotes}</li>
                  <li>{t("subscription.maxCollaborators")}: {config.freeMaxCollaborators === 0 ? t("subscription.unlimited") : config.freeMaxCollaborators}</li>
                  <li>{t("subscription.videoCallFeature")}: {config.freeVideoCall ? "✓" : "✗"}</li>
                </ul>
                <div className={styles.price}>{t("subscription.free")}</div>
              </Card>
            </Col>

            {/* PRO */}
            <Col xs={24} sm={8}>
              <Card
                className={`${styles.planCard} ${effectivePlan === "PRO" ? styles.activePlan : ""}`}
                title={<Tag color="blue">PRO</Tag>}
              >
                <ul className={styles.featureList}>
                  <li>{t("subscription.storage")}: {sizeFormat(Number(config.proStorageBytes))}</li>
                  <li>{t("subscription.maxNotes")}: {config.proMaxNotes === 0 ? t("subscription.unlimited") : config.proMaxNotes}</li>
                  <li>{t("subscription.maxCollaborators")}: {config.proMaxCollaborators === 0 ? t("subscription.unlimited") : config.proMaxCollaborators}</li>
                  <li>{t("subscription.videoCallFeature")}: {config.proVideoCall ? "✓" : "✗"}</li>
                </ul>
                <div className={styles.price}>
                  ${(config.proPriceUsd * selectedPeriod).toFixed(2)} / {selectedPeriod} mo
                </div>
                {effectivePlan !== "PRO" && (
                  <div className={styles.payButtons}>
                    <Button type="primary" size="small" loading={stripeLoading} onClick={() => handleStripe("PRO")}>
                      {t("subscription.payStripe")} (USD)
                    </Button>
                    <Button size="small" loading={yookassaLoading} onClick={() => handleYookassa("PRO")}>
                      {t("subscription.payYookassa")} (RUB) — ₽{(config.proPriceRub * selectedPeriod).toFixed(0)}
                    </Button>
                  </div>
                )}
              </Card>
            </Col>

            {/* ENTERPRISE */}
            <Col xs={24} sm={8}>
              <Card
                className={`${styles.planCard} ${effectivePlan === "ENTERPRISE" ? styles.activePlan : ""}`}
                title={<Tag color="gold">ENTERPRISE</Tag>}
              >
                <ul className={styles.featureList}>
                  <li>{t("subscription.storage")}: {Number(config.enterpriseStorageBytes) === 0 ? t("subscription.unlimited") : sizeFormat(Number(config.enterpriseStorageBytes))}</li>
                  <li>{t("subscription.maxNotes")}: {config.enterpriseMaxNotes === 0 ? t("subscription.unlimited") : config.enterpriseMaxNotes}</li>
                  <li>{t("subscription.maxCollaborators")}: {config.enterpriseMaxCollaborators === 0 ? t("subscription.unlimited") : config.enterpriseMaxCollaborators}</li>
                  <li>{t("subscription.videoCallFeature")}: {config.enterpriseVideoCall ? "✓" : "✗"}</li>
                </ul>
                <div className={styles.price}>
                  ${(config.enterprisePriceUsd * selectedPeriod).toFixed(2)} / {selectedPeriod} mo
                </div>
                {effectivePlan !== "ENTERPRISE" && (
                  <div className={styles.payButtons}>
                    <Button type="primary" size="small" loading={stripeLoading} onClick={() => handleStripe("ENTERPRISE")}>
                      {t("subscription.payStripe")} (USD)
                    </Button>
                    <Button size="small" loading={yookassaLoading} onClick={() => handleYookassa("ENTERPRISE")}>
                      {t("subscription.payYookassa")} (RUB) — ₽{(config.enterprisePriceRub * selectedPeriod).toFixed(0)}
                    </Button>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </>
      )}

      <Divider />

      <h2 className={styles.historyTitle}>{t("subscription.paymentHistory")}</h2>
      <Table
        rowKey="id"
        loading={historyLoading}
        dataSource={history ?? []}
        size="small"
        scroll={{ x: 700 }}
        pagination={false}
        columns={[
          {
            title: t("subscription.historyPlan"),
            dataIndex: "plan",
            width: 100,
            render: (plan: string) => <Tag color={PLAN_COLOR[plan] ?? "default"}>{plan}</Tag>,
          },
          { title: t("subscription.historyProvider"), dataIndex: "provider", width: 100 },
          {
            title: t("subscription.historyStatus"),
            dataIndex: "status",
            width: 100,
            render: (s: string) => (
              <Tag color={s === "succeeded" ? "green" : s === "pending" ? "orange" : "red"}>{s}</Tag>
            ),
          },
          {
            title: t("subscription.historyAmount"),
            width: 110,
            render: (_: unknown, r: Record<string, unknown>) =>
              r.amountUsd !== null ? `$${r.amountUsd}` : r.amountRub !== null ? `₽${r.amountRub}` : "—",
          },
          {
            title: t("subscription.historyPeriod"),
            dataIndex: "periodMonths",
            width: 80,
            render: (v: number) => `${v} mo`,
          },
          {
            title: t("subscription.historyExpires"),
            dataIndex: "expiresAt",
            width: 130,
            render: (v: string | null) => (v ? new Date(v).toLocaleDateString() : "—"),
          },
          { title: t("subscription.historyDate"), dataIndex: "createdAt", width: 130, render: (v: string) => new Date(v).toLocaleDateString() },
        ]}
      />
    </div>
    </ConfigProvider>
  );
};

export default SubscriptionPage;
