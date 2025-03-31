import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Checkbox, Input, List } from "antd";
import cn from "classnames";
import { useState } from "react";
import styles from "./todo.module.scss";

const Todo = () => {
	const [tasks, setTasks] = useState([]);
	const [taskText, setTaskText] = useState("");

	const addTask = () => {
		if (taskText.trim()) {
			setTasks([...tasks, { text: taskText, completed: false }]);
			setTaskText("");
		}
	};

	const toggleTask = (index) => {
		const newTasks = [...tasks];
		newTasks[index].completed = !newTasks[index].completed;
		setTasks(newTasks);
	};

	const deleteTask = (index) => {
		setTasks(tasks.filter((_, i) => i !== index));
	};

	return (
		<div className={cn(styles.todoWrapper)}>
			<div className={cn(styles.todoHeader)}>
				<Input
					placeholder="Add a task..."
					value={taskText}
					onChange={(e) => setTaskText(e.target.value)}
					onPressEnter={addTask}
				/>
				<Button type="primary" icon={<PlusOutlined />} onClick={addTask} />
			</div>
			<List
				className={cn(styles.todoList)}
				dataSource={tasks}
				renderItem={(item, index) => (
					<List.Item className={cn(styles.todoItem)}>
						<Checkbox
							checked={item.completed}
							onChange={() => toggleTask(index)}
						>
							<span className={cn({ [styles.completed]: item.completed })}>
								{item.text}
							</span>
						</Checkbox>
						<Button
							type="text"
							icon={<DeleteOutlined />}
							onClick={() => deleteTask(index)}
							danger
						/>
					</List.Item>
				)}
			/>
		</div>
	);
};

export default Todo;
