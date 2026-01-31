import cn from "classnames";
import { memo } from "react";
import diskBack from "../../../shared/assets/disk-back.jpg";
import Filelist from "../../../widgets/fileList/ui/Filelist";
import styles from "./file-space.module.scss";
import { FileToolbar } from "../../../widgets/fileToolbar";

const FileSpace = () => {
  return (
    <div className={cn(styles.diskWrapper)}>
      <img src={diskBack} className={cn(styles.diskBackgroundImg)} loading="lazy" />
      <FileToolbar />
      <Filelist />
    </div>
  );
};

export default memo(FileSpace);
