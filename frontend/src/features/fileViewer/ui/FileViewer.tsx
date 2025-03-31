import {
	FileFilled,
	FolderFilled,
	PlayCircleOutlined,
} from "@ant-design/icons";
import { Button, Image, Modal } from "antd";
import cn from "classnames";
import { Folder } from "lucide-react";
import { useState } from "react";
import ReactPlayer from "react-player";
import styles from "./fileViewer.module.scss";

const FileViewer = ({ type, url }) => {
	const [isOpenPlayer, setIsOpenPlayer] = useState(false);

	type = type.toLowerCase();

	const isImage =
		type == "png" || type == "jpg" || type == "jpeg" || type == "gif";
	const isPlayer =
		type == "mp4" ||
		type == "webm" ||
		type == "ogv" ||
		type == "mp3" ||
		type == "hls" ||
		type == "dash";
	// need to destructure, cause in future this a big module
	const determineViewer = (fileType: string, url: string) => {
		if (fileType === "dir") {
			// return <FolderFilled className={cn(styles.folder)} />;
			return <Folder size={50} className={cn(styles.folder)} />;
		} else if (isImage) {
			return <Image src={url} className={cn(styles.imageFile)} />;
		} else if (isPlayer) {
			return (
				<PlayCircleOutlined
					className={cn(styles.playerIcon)}
					onClick={() => setIsOpenPlayer(true)}
				/>
			);
		} else {
			return <FileFilled className={cn(styles.file)} />;
		}
	};
	return (
		<div className={cn(styles.allFileViewer)}>
			{determineViewer(type, url)}
			<Modal
				title="Player"
				className={cn(styles.playerModalFileViewer)}
				open={isOpenPlayer}
				onCancel={() => setIsOpenPlayer(false)}
				footer={[
					<Button key="back" onClick={() => setIsOpenPlayer(false)}>
						cancel
					</Button>,
				]}
			>
				<ReactPlayer className="mainPlayer" controls={true} url={url} />
			</Modal>
		</div>
	);
};

export default FileViewer;
