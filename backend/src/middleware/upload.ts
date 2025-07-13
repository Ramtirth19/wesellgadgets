// middleware/upload.ts

// --- 1. Import Dependencies ---
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request } from 'express';

// --- 2. Multer Configuration ---

// Configure storage for uploaded files
const storage = multer.diskStorage({
    /**
     * @description Sets the destination directory for uploaded files.
     */
    destination: function (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
        // Files will be saved in the 'uploads/' directory
        // Note: Ensure this directory exists at your project root.
        cb(null, 'uploads/');
    },
    /**
     * @description Defines the filename for the uploaded file.
     */
    filename: function (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
        // Create a unique filename to avoid overwrites
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to only allow specific image types
const imageFileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    // Check if the file's mimetype is one of the allowed image types
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
        // Accept the file
        cb(null, true);
    } else {
        // Reject the file with a specific error message
        cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
    }
};

// Initialize multer with the storage configuration, limits, and file filter
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5 MB file size limit
    },
    fileFilter: imageFileFilter
});

// --- 3. Export the Middleware ---
// This makes the configured multer instance available to other parts of your app.
export default upload;
