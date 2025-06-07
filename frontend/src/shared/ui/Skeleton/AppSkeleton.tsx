import { Skeleton } from "antd";
import type React from "react";

type ISkeletonProps = {
  avatar?: boolean;
};

const AppSkeleton: React.FC = (props: ISkeletonProps) => <Skeleton avatar={props.avatar} active />;

export default AppSkeleton;
