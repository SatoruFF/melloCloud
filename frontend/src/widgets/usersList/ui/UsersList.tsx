import { Avatar, List } from "antd";
import cn from "classnames";
import type React from "react";
import { useRef, useState } from "react";

import { Search } from "../../../shared";
import styles from "./users-list.module.scss";

const UsersList: React.FC = () => {
	const [search, onSearch] = useState("");
	const [messages, setMessages] = useState([
		{ text: "Can you do it?", sender: "You" },
		{ text: "Yea all right", sender: "John" },
	]);

	return (
		<div className={cn(styles.usersListWrapper)}>
			<Search onSearch={onSearch} className={styles.searchChats} />
			<List
				dataSource={messages}
				renderItem={(msg) => (
					<List.Item>
						<List.Item.Meta
							avatar={<Avatar>{msg.sender[0]}</Avatar>}
							title={msg.sender}
							description={msg.text}
						/>
					</List.Item>
				)}
			/>
		</div>
	);
};

export default UsersList;
