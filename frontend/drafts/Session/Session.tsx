// import SessionsManager from './path/to/SessionsManager';

// // В routes:
// {
//   path: '/settings/sessions',
//   element: <SessionsManager />,
// }

// import React from 'react';
// import { Card, Button, List, Typography, Space, Tag, Modal, message } from 'antd';
// import {
//   DesktopOutlined,
//   MobileOutlined,
//   TabletOutlined,
//   DeleteOutlined,
//   ExclamationCircleOutlined,
//   ClockCircleOutlined,
//   EnvironmentOutlined,
// } from '@ant-design/icons';
// import { userApi } from '../../../entities/user/model/api/user';
// import { format } from 'date-fns';
// import styles from './SessionsManager.module.scss';

// const { Title, Text } = Typography;
// const { confirm } = Modal;

// interface Session {
//   id: string;
//   userAgent: string;
//   ip: string;
//   createdAt: string;
//   lastActivity: string;
// }

// const SessionsManager: React.FC = () => {
//   const { data: sessions, isLoading, refetch } = userApi.useGetSessionsQuery();
//   const [deleteSession] = userApi.useDeleteSessionMutation();
//   const [logoutAll] = userApi.useLogoutAllMutation();

//   const getDeviceIcon = (userAgent: string) => {
//     const ua = userAgent.toLowerCase();
//     if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
//       return <MobileOutlined />;
//     }
//     if (ua.includes('tablet') || ua.includes('ipad')) {
//       return <TabletOutlined />;
//     }
//     return <DesktopOutlined />;
//   };

//   const getDeviceType = (userAgent: string) => {
//     const ua = userAgent.toLowerCase();
//     if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
//       return 'Mobile';
//     }
//     if (ua.includes('tablet') || ua.includes('ipad')) {
//       return 'Tablet';
//     }
//     return 'Desktop';
//   };

//   const getBrowserName = (userAgent: string) => {
//     if (userAgent.includes('Chrome')) return 'Chrome';
//     if (userAgent.includes('Firefox')) return 'Firefox';
//     if (userAgent.includes('Safari')) return 'Safari';
//     if (userAgent.includes('Edge')) return 'Edge';
//     if (userAgent.includes('Opera')) return 'Opera';
//     return 'Unknown Browser';
//   };

//   const handleDeleteSession = (sessionId: string) => {
//     confirm({
//       title: 'Are you sure you want to end this session?',
//       icon: <ExclamationCircleOutlined />,
//       content: 'You will be logged out from this device.',
//       okText: 'Yes',
//       okType: 'danger',
//       cancelText: 'No',
//       onOk: async () => {
//         try {
//           await deleteSession(sessionId).unwrap();
//           message.success('Session ended successfully');
//           refetch();
//         } catch (error) {
//           message.error('Failed to end session');
//         }
//       },
//     });
//   };

//   const handleLogoutAll = () => {
//     confirm({
//       title: 'Logout from all devices?',
//       icon: <ExclamationCircleOutlined />,
//       content: 'You will be logged out from all devices and will need to log in again.',
//       okText: 'Logout from all',
//       okType: 'danger',
//       cancelText: 'Cancel',
//       onOk: async () => {
//         try {
//           await logoutAll().unwrap();
//           message.success('Logged out from all devices');
//           // Redirect to login
//           window.location.href = '/login';
//         } catch (error) {
//           message.error('Failed to logout from all devices');
//         }
//       },
//     });
//   };

//   const formatDate = (dateString: string) => {
//     try {
//       return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
//     } catch {
//       return dateString;
//     }
//   };

//   return (
//     <div className={styles.sessionsManager}>
//       <Card
//         title={
//           <Space>
//             <DesktopOutlined />
//             <Title level={4} style={{ margin: 0 }}>
//               Active Sessions
//             </Title>
//           </Space>
//         }
//         extra={
//           <Button danger onClick={handleLogoutAll} disabled={!sessions || sessions.length === 0}>
//             Logout from all devices
//           </Button>
//         }
//         loading={isLoading}
//       >
//         <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
//           Manage your active sessions. You can see where you're logged in and end sessions on devices you no longer use.
//         </Text>

//         <List
//           itemLayout="horizontal"
//           dataSource={sessions}
//           locale={{ emptyText: 'No active sessions' }}
//           renderItem={(session: Session, index: number) => (
//             <List.Item
//               key={session.id}
//               className={styles.sessionItem}
//               actions={[
//                 <Button
//                   type="text"
//                   danger
//                   icon={<DeleteOutlined />}
//                   onClick={() => handleDeleteSession(session.id)}
//                   disabled={sessions?.length === 1}
//                 >
//                   End session
//                 </Button>,
//               ]}
//             >
//               <List.Item.Meta
//                 avatar={<div className={styles.deviceIcon}>{getDeviceIcon(session.userAgent)}</div>}
//                 title={
//                   <Space>
//                     <Text strong>{getDeviceType(session.userAgent)}</Text>
//                     {index === 0 && <Tag color="green">Current</Tag>}
//                   </Space>
//                 }
//                 description={
//                   <Space direction="vertical" size={4}>
//                     <Text type="secondary">
//                       <strong>Browser:</strong> {getBrowserName(session.userAgent)}
//                     </Text>
//                     <Space size="large">
//                       <Text type="secondary">
//                         <EnvironmentOutlined /> IP: {session.ip}
//                       </Text>
//                       <Text type="secondary">
//                         <ClockCircleOutlined /> Last activity: {formatDate(session.lastActivity)}
//                       </Text>
//                     </Space>
//                     <Text type="secondary" style={{ fontSize: 12 }}>
//                       Created: {formatDate(session.createdAt)}
//                     </Text>
//                   </Space>
//                 }
//               />
//             </List.Item>
//           )}
//         />

//         {sessions && sessions.length > 0 && (
//           <div className={styles.sessionFooter}>
//             <Text type="secondary" style={{ fontSize: 12 }}>
//               You have {sessions.length} active session{sessions.length > 1 ? 's' : ''}. Maximum 5 sessions allowed.
//             </Text>
//           </div>
//         )}
//       </Card>
//     </div>
//   );
// };

// export default SessionsManager;
