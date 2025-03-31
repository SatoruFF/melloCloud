import { Input } from "antd";
import cn from "classnames";
import _ from "lodash-es";
import styles from "./search.module.scss";

const { Search } = Input;

interface ISearchProps {
	placeholder?: string;
	className?: string;
	onSearch: (value: string) => void;
	enterButton?: React.ReactNode;
}

const CustomSearch: React.FC<ISearchProps> = ({
	placeholder = "find something",
	className = "",
	onSearch,
}) => {
	return (
		<Search
			placeholder={placeholder}
			className={cn(styles.search, className)}
			onSearch={onSearch}
			enterButton
		/>
	);
};

export default CustomSearch;
