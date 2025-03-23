import React from 'react';
import { Skeleton } from 'antd';

interface ISkeletonProps {}

const AppSkeleton: React.FC = (props: ISkeletonProps) => <Skeleton active />;

export default AppSkeleton;
