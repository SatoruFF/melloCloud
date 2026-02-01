import { Button, Image, Modal, Spin } from "antd";
import cn from "classnames";
import { Folder, FileText, FileCode, FileArchive, FileSpreadsheet, PlayCircle, File } from "lucide-react";
import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { Document, Page, pdfjs } from "react-pdf";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown from "react-markdown";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import { useLazyGetFileContentQuery } from "../../../entities/file/model/api/fileApi";
import styles from "./file-viewer.module.scss";

// PDF worker setup
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface FileViewerProps {
  type: string;
  url?: string;
  fileName?: string;
  /** ID файла для загрузки контента через API (обходит CORS при превью) */
  fileId?: string | number;
  className?: string;
  style?: React.CSSProperties;
  iconSize?: number;
  /** Триггер: при true открыть превью (по двойному клику по строке файла) */
  openPreview?: boolean;
  /** Вызов после закрытия превью */
  onPreviewClose?: () => void;
}

// TODO: get away from here
const IMAGE_TYPES = ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "ico"];
const VIDEO_TYPES = ["mp4", "webm", "ogv", "avi", "mov", "mkv", "m4v", "3gp"];
const AUDIO_TYPES = ["mp3", "wav", "ogg", "m4a", "flac", "aac", "opus", "weba"];
const PLAYER_TYPES = [...VIDEO_TYPES, ...AUDIO_TYPES, "hls", "dash"];
const PDF_TYPES = ["pdf"];
const DOCUMENT_TYPES = ["doc", "docx", "txt", "rtf"];
const CODE_TYPES = [
  "js",
  "ts",
  "jsx",
  "tsx",
  "css",
  "scss",
  "sass",
  "less",
  "html",
  "htm",
  "json",
  "xml",
  "py",
  "java",
  "cpp",
  "c",
  "h",
  "hpp",
  "go",
  "rs",
  "php",
  "rb",
  "sh",
  "bash",
  "zsh",
  "yaml",
  "yml",
  "toml",
  "swift",
  "kt",
  "kts",
  "sql",
  "vue",
  "svelte",
  "env",
  "log",
  "diff",
];
const MARKDOWN_TYPES = ["md", "markdown"];

/** Расширение файла → язык для Prism (некоторые отличаются) */
const CODE_TO_PRISM_LANG: Record<string, string> = {
  h: "c",
  hpp: "cpp",
  rs: "rust",
  yml: "yaml",
  htm: "html",
  kts: "kotlin",
  vue: "markup",
  svelte: "markup",
  toml: "markup",
  env: "bash",
  log: "markup",
  diff: "diff",
};

const ARCHIVE_TYPES = ["zip", "rar", "7z", "tar", "gz"];
const SPREADSHEET_TYPES = ["xlsx", "xls", "csv"];

/** MIME → расширение для просмотра (бэкенд может отдавать type как "text/plain") */
const MIME_TO_EXT: Record<string, string> = {
  "text/plain": "txt",
  "text/html": "html",
  "text/csv": "csv",
  "text/css": "css",
  "application/pdf": "pdf",
  "application/json": "json",
  "application/javascript": "js",
  "text/javascript": "js",
  // Audio
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/ogg": "ogg",
  "audio/webm": "weba",
  "audio/flac": "flac",
  "audio/aac": "aac",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/opus": "opus",
  // Video
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/ogg": "ogv",
  "video/x-msvideo": "avi",
  "video/quicktime": "mov",
  "video/x-matroska": "mkv",
  "video/m4v": "m4v",
  "video/3gpp": "3gp",
  // Code / text
  "application/xml": "xml",
  "text/x-python": "py",
  "application/x-yaml": "yaml",
  "text/yaml": "yaml",
};

function getViewerType(type: string, fileName?: string): string {
  const t = (type || "").trim().toLowerCase();
  if (!t) {
    const ext = fileName?.split(".").pop()?.toLowerCase();
    return ext || "";
  }
  const mimeBase = t.split(";")[0]?.trim() || t;
  if (MIME_TO_EXT[mimeBase]) return MIME_TO_EXT[mimeBase];
  if (!mimeBase.includes("/")) return mimeBase;
  const ext = fileName?.split(".").pop()?.toLowerCase();
  return ext || t;
}

const FileViewer: React.FC<FileViewerProps> = ({
  type,
  url,
  fileName,
  fileId,
  className,
  style,
  iconSize = 50,
  openPreview = false,
  onPreviewClose,
}) => {
  const [getFileContent] = useLazyGetFileContentQuery();
  const [isOpenPlayer, setIsOpenPlayer] = useState(false);
  const [isOpenPDF, setIsOpenPDF] = useState(false);
  const [isOpenCode, setIsOpenCode] = useState(false);
  const [isOpenMarkdown, setIsOpenMarkdown] = useState(false);
  const [isOpenDocument, setIsOpenDocument] = useState(false);
  const [isOpenSpreadsheet, setIsOpenSpreadsheet] = useState(false);
  const [isOpenImage, setIsOpenImage] = useState(false);

  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [codeContent, setCodeContent] = useState("");
  const [markdownContent, setMarkdownContent] = useState("");
  const [documentContent, setDocumentContent] = useState("");
  const [spreadsheetData, setSpreadsheetData] = useState<any[][]>([]);
  const [loading, setLoading] = useState(false);

  const fileType = getViewerType(type, fileName);

  const isImage = IMAGE_TYPES.includes(fileType);
  const isPlayer = PLAYER_TYPES.includes(fileType);
  const isAudio = AUDIO_TYPES.includes(fileType);
  const isPDF = PDF_TYPES.includes(fileType);
  const isDocument = DOCUMENT_TYPES.includes(fileType);
  const isCode = CODE_TYPES.includes(fileType);
  const isMarkdown = MARKDOWN_TYPES.includes(fileType);
  const isArchive = ARCHIVE_TYPES.includes(fileType);
  const isSpreadsheet = SPREADSHEET_TYPES.includes(fileType);

  const fetchTextContent = async (url: string) => {
    setLoading(true);
    try {
      const response = await fetch(url);
      const text = await response.text();
      return text;
    } catch {
      return "";
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentContent = async (url: string) => {
    setLoading(true);
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setDocumentContent(result.value);
    } catch {
      setDocumentContent("Failed to load document");
    } finally {
      setLoading(false);
    }
  };

  const fetchSpreadsheetContent = async (url: string) => {
    setLoading(true);
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      setSpreadsheetData(data as any[][]);
    } catch {
      setSpreadsheetData([["Failed to load spreadsheet"]]);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeOpen = async () => {
    setLoading(true);
    try {
      if (fileId != null) {
        const blob = await getFileContent(fileId).unwrap();
        const content = await blob.text();
        setCodeContent(content);
        setIsOpenCode(true);
      } else if (url) {
        const content = await fetchTextContent(url);
        setCodeContent(content);
        setIsOpenCode(true);
      }
    } catch {
      setCodeContent("");
      setIsOpenCode(true);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkdownOpen = async () => {
    setLoading(true);
    try {
      if (fileId != null) {
        const blob = await getFileContent(fileId).unwrap();
        const content = await blob.text();
        setMarkdownContent(content);
        setIsOpenMarkdown(true);
      } else if (url) {
        const content = await fetchTextContent(url);
        setMarkdownContent(content);
        setIsOpenMarkdown(true);
      }
    } catch {
      setMarkdownContent("");
      setIsOpenMarkdown(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentOpen = async () => {
    setLoading(true);
    try {
      if (fileId != null) {
        const blob = await getFileContent(fileId).unwrap();
        if (fileType === "txt") {
          const content = await blob.text();
          setDocumentContent(`<pre>${content}</pre>`);
        } else {
          const arrayBuffer = await blob.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          setDocumentContent(result.value);
        }
        setIsOpenDocument(true);
      } else if (url) {
        if (fileType === "txt") {
          const content = await fetchTextContent(url);
          setDocumentContent(`<pre>${content}</pre>`);
        } else {
          await fetchDocumentContent(url);
        }
        setIsOpenDocument(true);
      }
    } catch {
      setDocumentContent("Failed to load document");
      setIsOpenDocument(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSpreadsheetOpen = async () => {
    setLoading(true);
    try {
      if (fileId != null) {
        const blob = await getFileContent(fileId).unwrap();
        const arrayBuffer = await blob.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        setSpreadsheetData(data as any[][]);
        setIsOpenSpreadsheet(true);
      } else if (url) {
        await fetchSpreadsheetContent(url);
        setIsOpenSpreadsheet(true);
      }
    } catch {
      setSpreadsheetData([["Failed to load spreadsheet"]]);
      setIsOpenSpreadsheet(true);
    } finally {
      setLoading(false);
    }
  };

  // Открыть превью по триггеру (двойной клик по строке файла)
  useEffect(() => {
    if (!openPreview) return;
    if (!url && fileId == null) return;
    if (isImage && url) setIsOpenImage(true);
    else if (isPlayer && url) setIsOpenPlayer(true);
    else if (isPDF && url) setIsOpenPDF(true);
    else if (isDocument) handleDocumentOpen();
    else if (isCode) handleCodeOpen();
    else if (isMarkdown) handleMarkdownOpen();
    else if (isSpreadsheet) handleSpreadsheetOpen();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open only when openPreview/url/fileId change
  }, [openPreview, url, fileId]);

  const closePlayer = () => {
    setIsOpenPlayer(false);
    onPreviewClose?.();
  };
  const closePDF = () => {
    setIsOpenPDF(false);
    onPreviewClose?.();
  };
  const closeCode = () => {
    setIsOpenCode(false);
    onPreviewClose?.();
  };
  const closeMarkdown = () => {
    setIsOpenMarkdown(false);
    onPreviewClose?.();
  };
  const closeDocument = () => {
    setIsOpenDocument(false);
    onPreviewClose?.();
  };
  const closeSpreadsheet = () => {
    setIsOpenSpreadsheet(false);
    onPreviewClose?.();
  };
  const closeImage = () => {
    setIsOpenImage(false);
    onPreviewClose?.();
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const determineViewer = (fileType: string, url?: string) => {
    if (fileType === "dir") {
      return <Folder size={iconSize} className={cn(styles.folder)} />;
    }

    if (isImage && url) {
      return (
        <Image
          src={url}
          className={cn(styles.imageFile)}
          alt={fileName || fileType}
          width={iconSize}
          height={iconSize}
          style={{ objectFit: "contain" }}
          preview={true}
        />
      );
    }

    if (isPlayer) {
      return <PlayCircle size={iconSize} className={cn(styles.playerIcon)} />;
    }

    if (isPDF) {
      return <FileText size={iconSize} className={cn(styles.pdfIcon)} />;
    }

    if (isDocument) {
      return <FileText size={iconSize} className={cn(styles.documentIcon)} />;
    }

    if (isCode) {
      return <FileCode size={iconSize} className={cn(styles.codeIcon)} />;
    }

    if (isMarkdown) {
      return <FileText size={iconSize} className={cn(styles.markdownIcon)} />;
    }

    if (isSpreadsheet) {
      return <FileSpreadsheet size={iconSize} className={cn(styles.spreadsheetIcon)} />;
    }

    if (isArchive) {
      return <FileArchive size={iconSize} className={cn(styles.archiveIcon)} />;
    }

    return <File size={iconSize} className={cn(styles.file)} />;
  };

  return (
    <div className={cn(styles.allFileViewer, className)} style={style}>
      {determineViewer(fileType, url)}

      {/* Video/Audio Player Modal */}
      <Modal
        title={isAudio ? "Audio" : "Video"}
        className={cn(styles.playerModalFileViewer)}
        open={isOpenPlayer}
        onCancel={closePlayer}
        footer={[
          <Button key="close" onClick={closePlayer}>
            Close
          </Button>,
        ]}
        width={isAudio ? 500 : 900}
      >
        {url &&
          (isAudio ? (
            <div className={cn(styles.audioPlayerWrapper)}>
              <audio className={cn(styles.audioPlayer)} controls src={url}>
                <track kind="captions" src="" />
                Your browser does not support the audio element.
              </audio>
            </div>
          ) : (
            <ReactPlayer className={styles.mainPlayer} controls url={url} width="100%" height="500px" />
          ))}
      </Modal>

      {/* Image Preview Modal (double-click) */}
      <Modal
        title={fileName || "Image"}
        className={cn(styles.playerModalFileViewer)}
        open={isOpenImage}
        onCancel={closeImage}
        footer={[
          <Button key="close" onClick={closeImage}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {url && (
          <img
            src={url}
            alt={fileName || "Preview"}
            style={{ maxWidth: "100%", height: "auto", display: "block", margin: "0 auto" }}
          />
        )}
      </Modal>

      {/* PDF Viewer Modal */}
      <Modal
        title="PDF Viewer"
        className={cn(styles.pdfModalFileViewer)}
        open={isOpenPDF}
        onCancel={closePDF}
        footer={[
          <Button key="prev" onClick={() => setPageNumber(Math.max(1, pageNumber - 1))} disabled={pageNumber <= 1}>
            Previous
          </Button>,
          <span key="page" style={{ margin: "0 16px" }}>
            Page {pageNumber} of {numPages}
          </span>,
          <Button
            key="next"
            onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
            disabled={pageNumber >= numPages}
          >
            Next
          </Button>,
          <Button key="close" onClick={closePDF}>
            Close
          </Button>,
        ]}
        width={900}
      >
        {url && (
          <div className={cn(styles.pdfContainer)}>
            <Document file={url} onLoadSuccess={onDocumentLoadSuccess} loading={<Spin />}>
              <Page pageNumber={pageNumber} width={850} />
            </Document>
          </div>
        )}
      </Modal>

      {/* Code Viewer Modal */}
      <Modal
        title={`Code Viewer - ${fileName || fileType.toUpperCase()}`}
        className={cn(styles.codeModalFileViewer)}
        open={isOpenCode}
        onCancel={closeCode}
        footer={[
          <Button key="close" onClick={closeCode}>
            Close
          </Button>,
        ]}
        width={1000}
      >
        {loading ? (
          <Spin />
        ) : (
          <SyntaxHighlighter
            language={CODE_TO_PRISM_LANG[fileType] ?? fileType}
            style={vscDarkPlus}
            showLineNumbers
            customStyle={{ maxHeight: "600px" }}
          >
            {codeContent}
          </SyntaxHighlighter>
        )}
      </Modal>

      {/* Markdown Viewer Modal */}
      <Modal
        title={`Markdown - ${fileName || "Document"}`}
        className={cn(styles.markdownModalFileViewer)}
        open={isOpenMarkdown}
        onCancel={closeMarkdown}
        footer={[
          <Button key="close" onClick={closeMarkdown}>
            Close
          </Button>,
        ]}
        width={900}
      >
        {loading ? (
          <Spin />
        ) : (
          <div className={cn(styles.markdownContent)}>
            <ReactMarkdown>{markdownContent}</ReactMarkdown>
          </div>
        )}
      </Modal>

      {/* Document Viewer Modal */}
      <Modal
        title={`Document - ${fileName || fileType.toUpperCase()}`}
        className={cn(styles.documentModalFileViewer)}
        open={isOpenDocument}
        onCancel={closeDocument}
        footer={[
          <Button key="close" onClick={closeDocument}>
            Close
          </Button>,
        ]}
        width={900}
      >
        {loading ? (
          <Spin />
        ) : (
          <div className={cn(styles.documentContent)} dangerouslySetInnerHTML={{ __html: documentContent }} />
        )}
      </Modal>

      {/* Spreadsheet Viewer Modal */}
      <Modal
        title={`Spreadsheet - ${fileName || fileType.toUpperCase()}`}
        className={cn(styles.spreadsheetModalFileViewer)}
        open={isOpenSpreadsheet}
        onCancel={closeSpreadsheet}
        footer={[
          <Button key="close" onClick={closeSpreadsheet}>
            Close
          </Button>,
        ]}
        width={1200}
      >
        {loading ? (
          <Spin />
        ) : (
          <div className={cn(styles.spreadsheetContent)}>
            <table className={cn(styles.spreadsheetTable)}>
              <tbody>
                {spreadsheetData.map((row, rowIndex) => (
                  <tr key={`row-${rowIndex}-${row.join("-")}`}>
                    {row.map((cell, cellIndex) => (
                      <td key={`cell-${rowIndex}-${cellIndex}-${cell}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FileViewer;
