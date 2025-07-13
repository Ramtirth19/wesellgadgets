import express from 'express';
import uploadController from '../controllers/upload';
import { auth } from '../middleware/auth';
import upload from '../middleware/upload';

const router = express.Router();

// All upload routes require authentication
router.use(auth);

// Single file upload
router.post('/single', upload.single('file'), uploadController.uploadSingle);

// Multiple file upload
router.post('/multiple', upload.array('files', 10), uploadController.uploadMultiple);

// Image upload with resizing
router.post('/image', upload.single('image'), uploadController.uploadImage);

// Avatar upload
router.post('/avatar', upload.single('avatar'), uploadController.uploadAvatar);

// Document upload
router.post('/document', upload.single('document'), uploadController.uploadDocument);

// Get uploaded files
router.get('/files', uploadController.getFiles);
router.get('/files/:id', uploadController.getFileById);

// Delete file
router.delete('/files/:id', uploadController.deleteFile);

export default router;