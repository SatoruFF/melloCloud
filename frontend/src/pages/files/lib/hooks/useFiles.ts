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
  addFiles,
  addNewFile,
  popToPath,
  popToStack,
  setDir,
  setFiles,
  setHasMore,
  setLoading,
  setOffset,
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
  const [fileView, setFileView] = useState<"list" | "plate">("list");
  const [search, setSearch] = useState("");
  const [searchParams] = useSearchParams();

  const onSearch = useCallback((value: string) => setSearch(value), []);

  useEffect(() => {
    // Add url parameters to the state
    const dirFromUrl = searchParams.get("dir"); // fixme
    const sortFromUrl = searchParams.get("sort");
    const searchFromUrl = searchParams.get("search");

    if (dirFromUrl) dispatch(setDir(dirFromUrl));
    if (sortFromUrl) setSort(sortFromUrl);
    if (searchFromUrl) setSearch(searchFromUrl);
  }, []);

  // TODO: destructure all params to variant like this: _.pick(obj, [...params])
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
    dispatch(setOffset(0));
    refetch();
  }, [sort, search]);

  useEffect(() => {
    dispatch(setOffset(0));
  }, [currentDir]);

  useEffect(() => {
    fileView && dispatch(setView(fileView));
  }, [fileView]);

  useEffect(() => {
    dispatch(setLoading(isLoading));
  }, [isLoading]);

  useEffect(() => {
    if (data) {
      if (offset === 0) {
        dispatch(setFiles(data)); // первый запрос — перезапись
      } else {
        dispatch(addFiles(data)); // последующие — добавление
      }
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
    setFileView,
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
