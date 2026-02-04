import { Skeleton } from "antd";
import type React from "react";

type ISkeletonProps = {
  avatar?: boolean;
  title?: boolean | { width?: number | string };
  active?: boolean;
};

const AppSkeleton: React.FC<ISkeletonProps> = (props) => (
  <Skeleton avatar={props.avatar} title={props.title} active={props.active ?? true} />
);

export default AppSkeleton;
