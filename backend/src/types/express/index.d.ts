// types/express/index.d.ts

// Import the 'Request' type from Express to ensure we're extending the correct interface.
import { Request } from 'express';

// Define the structure of your custom properties.
interface AuthUser {
  userId: string;
  role: string;
}

interface MulterFile {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
  destination?: string;
}

// Use declaration merging to add the custom properties to the Express 'Request' interface.
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;      // Use optional if the user may not always be present
      file?: MulterFile;
      files?: MulterFile[];
    }
  }
}