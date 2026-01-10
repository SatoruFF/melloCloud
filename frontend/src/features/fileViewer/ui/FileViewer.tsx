import { FileFilled, PlayCircleOutlined, FileTextOutlined } from "@ant-design/icons";
import { Button, Image, Modal, Spin } from "antd";
import cn from "classnames";
import { Folder, FileText, FileCode, FileArchive, FileSpreadsheet } from "lucide-react";
import React, { useState } from "react";
import ReactPlayer from "react-player";
import { Document, Page, pdfjs } from "react-pdf";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown from "react-markdown";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import styles from "./file-viewer.module.scss";

// PDF worker setup
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface FileViewerProps {
  type: string;
  url?: string;
  fileName?: string;
  className?: string;
  style?: React.CSSProperties;
  iconSize?: number;
}

// TODO: get away from here
const IMAGE_TYPES = ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "ico"];
const VIDEO_TYPES = ["mp4", "webm", "ogv", "avi", "mov", "mkv"];
const AUDIO_TYPES = ["mp3", "wav", "ogg", "m4a", "flac", "aac"];
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
  "html",
  "json",
  "xml",
  "py",
  "java",
  "cpp",
  "c",
  "h",
  "go",
  "rs",
  "php",
  "rb",
  "sh",
];
const MARKDOWN_TYPES = ["md", "markdown"];
const ARCHIVE_TYPES = ["zip", "rar", "7z", "tar", "gz"];
const SPREADSHEET_TYPES = ["xlsx", "xls", "csv"];

const FileViewer: React.FC<FileViewerProps> = ({ type, url, fileName, className, style, iconSize = 50 }) => {
  const [isOpenPlayer, setIsOpenPlayer] = useState(false);
  const [isOpenPDF, setIsOpenPDF] = useState(false);
  const [isOpenCode, setIsOpenCode] = useState(false);
  const [isOpenMarkdown, setIsOpenMarkdown] = useState(false);
  const [isOpenDocument, setIsOpenDocument] = useState(false);
  const [isOpenSpreadsheet, setIsOpenSpreadsheet] = useState(false);

  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [codeContent, setCodeContent] = useState("");
  const [markdownContent, setMarkdownContent] = useState("");
  const [documentContent, setDocumentContent] = useState("");
  const [spreadsheetData, setSpreadsheetData] = useState<any[][]>([]);
  const [loading, setLoading] = useState(false);

  const fileType = type.toLowerCase();

  const isImage = IMAGE_TYPES.includes(fileType);
  const isPlayer = PLAYER_TYPES.includes(fileType);
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
    } catch (error) {
      console.error("Error fetching content:", error);
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
    } catch (error) {
      console.error("Error loading document:", error);
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
    } catch (error) {
      console.error("Error loading spreadsheet:", error);
      setSpreadsheetData([["Failed to load spreadsheet"]]);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeOpen = async () => {
    if (url) {
      const content = await fetchTextContent(url);
      setCodeContent(content);
      setIsOpenCode(true);
    }
  };

  const handleMarkdownOpen = async () => {
    if (url) {
      const content = await fetchTextContent(url);
      setMarkdownContent(content);
      setIsOpenMarkdown(true);
    }
  };

  const handleDocumentOpen = async () => {
    if (url) {
      if (fileType === "txt") {
        const content = await fetchTextContent(url);
        setDocumentContent(`<pre>${content}</pre>`);
      } else {
        await fetchDocumentContent(url);
      }
      setIsOpenDocument(true);
    }
  };

  const handleSpreadsheetOpen = async () => {
    if (url) {
      await fetchSpreadsheetContent(url);
      setIsOpenSpreadsheet(true);
    }
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
      return <PlayCircleOutlined className={cn(styles.playerIcon)} onClick={() => setIsOpenPlayer(true)} />;
    }

    if (isPDF) {
      return <FileText size={iconSize} className={cn(styles.pdfIcon)} onClick={() => setIsOpenPDF(true)} />;
    }

    if (isDocument) {
      return <FileTextOutlined className={cn(styles.documentIcon)} onClick={handleDocumentOpen} />;
    }

    if (isCode) {
      return <FileCode size={iconSize} className={cn(styles.codeIcon)} onClick={handleCodeOpen} />;
    }

    if (isMarkdown) {
      return <FileText size={iconSize} className={cn(styles.markdownIcon)} onClick={handleMarkdownOpen} />;
    }

    if (isSpreadsheet) {
      return <FileSpreadsheet size={iconSize} className={cn(styles.spreadsheetIcon)} onClick={handleSpreadsheetOpen} />;
    }

    if (isArchive) {
      return <FileArchive size={iconSize} className={cn(styles.archiveIcon)} />; // ✅
    }

    return <FileFilled className={cn(styles.file)} />;
  };

  return (
    <div className={cn(styles.allFileViewer, className)} style={style}>
      {determineViewer(fileType, url)}

      {/* Video/Audio Player Modal */}
      <Modal
        title="Media Player"
        className={cn(styles.playerModalFileViewer)}
        open={isOpenPlayer}
        onCancel={() => setIsOpenPlayer(false)}
        footer={[
          <Button key="close" onClick={() => setIsOpenPlayer(false)}>
            Close
          </Button>,
        ]}
        width={900}
      >
        {url && <ReactPlayer className={styles.mainPlayer} controls url={url} width="100%" height="500px" />}
      </Modal>

      {/* PDF Viewer Modal */}
      <Modal
        title="PDF Viewer"
        className={cn(styles.pdfModalFileViewer)}
        open={isOpenPDF}
        onCancel={() => setIsOpenPDF(false)}
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
          <Button key="close" onClick={() => setIsOpenPDF(false)}>
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
        onCancel={() => setIsOpenCode(false)}
        footer={[
          <Button key="close" onClick={() => setIsOpenCode(false)}>
            Close
          </Button>,
        ]}
        width={1000}
      >
        {loading ? (
          <Spin />
        ) : (
          <SyntaxHighlighter
            language={fileType}
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
        onCancel={() => setIsOpenMarkdown(false)}
        footer={[
          <Button key="close" onClick={() => setIsOpenMarkdown(false)}>
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
        onCancel={() => setIsOpenDocument(false)}
        footer={[
          <Button key="close" onClick={() => setIsOpenDocument(false)}>
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
        onCancel={() => setIsOpenSpreadsheet(false)}
        footer={[
          <Button key="close" onClick={() => setIsOpenSpreadsheet(false)}>
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
