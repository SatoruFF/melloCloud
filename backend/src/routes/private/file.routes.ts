import { Hono } from "hono";
import { FileController } from "../../controllers/fileController.js";

const router = new Hono();

router.post("/", (c) => FileController.createDir(c));
router.get("/", (c) => FileController.getFiles(c));
router.post("/upload", (c) => FileController.uploadFile(c));
router.post("/download", (c) => FileController.downloadFile(c));
router.delete("/delete", (c) => FileController.deleteFile(c));
router.post("/avatar", (c) => FileController.uploadAvatar(c));
router.delete("/avatar", (c) => FileController.deleteAvatar(c));

export default router;
