import { Router } from "express";
import multer from "multer";

const upload = multer({ dest: "uploads/"});

import * as apiController from "../controllers/apiController";

const router = Router();

router.post("/upload", upload.single('file'), apiController.upload);

router.post('/product', apiController.update);

export default router;