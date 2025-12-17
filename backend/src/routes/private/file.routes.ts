import { Router } from "express";
import { FileController } from "../../controllers/fileController";

const router: Router = Router();

router.post("", FileController.createDir);
router.get("", FileController.getFiles);
router.post("/upload", FileController.uploadFile);
router.post("/download", FileController.downloadFile);
router.delete("/delete", FileController.deleteFile);
router.post("/avatar", FileController.uploadAvatar);
router.delete("/avatar", FileController.deleteAvatar);

export default router;
