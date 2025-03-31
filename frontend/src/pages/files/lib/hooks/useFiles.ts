import { unwrapResult } from "@reduxjs/toolkit";
import { message } from "antd";
import _ from "lodash-es";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../app/store/store";
import {
	useCreateDirMutation,
	useGetFilesQuery,
} from "../../../../entities/file/model/api/fileApi";
import {
	getFilesLimitSelector,
	getFilesOffsetSelector,
	getFilesSelector,
} from "../../../../entities/file/model/selectors/getFiles";
import {
	addNewFile,
	popToPath,
	popToStack,
	setDir,
	setFiles,
	setHasMore,
	setLoading,
	setView,
} from "../../../../entities/file/model/slice/fileSlice";

export const useFiles = () => {
	const dispatch = useAppDispatch();
	const currentDir = useAppSelector((state) => state.files.currentDir);
	const dirStack = useAppSelector((state) => state.files.dirStack);
	const paths = useAppSelector((state) => state.files.paths); // FIXME
	const offset = useAppSelector(getFilesOffsetSelector);
	const files = useAppSelector(getFilesSelector);
	const limit = useAppSelector(getFilesLimitSelector);

	const [modal, setModal] = useState(false);
	const [uploadModal, setUploadModal] = useState(false);
	const [folderName, setFolderName] = useState("");
	const [sort, setSort]: any = useState("");
	const [search, setSearch] = useState("");
	const [searchParams] = useSearchParams();

	const onSearch = useCallback((value: string) => setSearch(value), []);

	useEffect(() => {
		// Add url parameters to the state
		const dirFromUrl = searchParams.get("dir");
		const sortFromUrl = searchParams.get("sort");
		const searchFromUrl = searchParams.get("search");

		if (dirFromUrl) dispatch(setDir(dirFromUrl));
		if (sortFromUrl) setSort(sortFromUrl);
		if (searchFromUrl) setSearch(searchFromUrl);
	}, []);

	const params = { parent: currentDir, sort, search, offset };
	const { data, isLoading, refetch } = useGetFilesQuery(params || null);
	const [addFile, { data: dirData, error: dirError }] = useCreateDirMutation();

	useEffect(() => {
		if (files.length == limit) {
			dispatch(setHasMore(true));
		} else {
			dispatch(setHasMore(true));
		}
	}, [limit, offset, files, isLoading]);

	useEffect(() => {
		refetch();
	}, [sort, search]);

	useEffect(() => {
		dispatch(setLoading(isLoading));
	}, [isLoading]);

	useEffect(() => {
		if (data) {
			dispatch(setFiles(data));
		}
	}, [data, currentDir]);

	useEffect(() => {
		dispatch(setDir(currentDir));
	}, [currentDir]);

	useEffect(() => {
		if (dirData) {
			dispatch(addNewFile(dirData));
			refetch();
		}
		if (dirError) {
			message.error("Create dir error");
		}
	}, [dirData, dirError]);

	const goBack = () => {
		if (dirStack.length > 0) {
			dispatch(popToStack());
			dispatch(popToPath());
		}
	};

	const addNewFolder = async () => {
		try {
			if (folderName.length === 0) {
				return message.info("The file name should not be empty");
			}
			const folderNameValid = folderName.replace(/[^\p{L}\d\s]/gu, "").trim();
			const response: any = await addFile({
				name: folderNameValid,
				type: "dir",
				parent: currentDir,
			});
			unwrapResult(response);
			setModal(false);
			setFolderName("");
		} catch (e: any) {
			message.error(`Request failed: ${e.data.message}`);
		}
	};

	return {
		modal,
		uploadModal,
		folderName,
		sort,
		search,
		setModal,
		setUploadModal,
		setFolderName,
		setSort,
		setSearch,
		onSearch,
		goBack,
		addNewFolder,
		paths,
		data,
		isLoading,
	};
};
