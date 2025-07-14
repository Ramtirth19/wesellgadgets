import { Request, Response } from "express";
import File from "../models/File";
import fs from "fs";
import path from "path";
import sharp from "sharp";

const uploadController = {
  // Upload single file
  async uploadSingle(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const file = new File({
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        uploadedBy: req.user?.userId,
        category: "general",
      });

      await file.save();

      return res.status(201).json({
        message: "File uploaded successfully",
        file: {
          id: file._id,
          filename: file.filename,
          originalName: file.originalName,
          mimetype: file.mimetype,
          size: file.size,
          url: `/uploads/${file.filename}`,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  // Upload multiple files
  async uploadMultiple(req: Request, res: Response) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const uploadedFiles: any[] = [];

      for (const file of (req.files as any)) {
        const newFile = new File({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          uploadedBy: req.user?.userId,
          category: "general",
        });

        await newFile.save();

        uploadedFiles.push({
          id: newFile._id,
          filename: newFile.filename,
          originalName: newFile.originalName,
          mimetype: newFile.mimetype,
          size: newFile.size,
          url: `/uploads/${newFile.filename}`,
        });
      }

      return res.status(201).json({
        message: "Files uploaded successfully",
        files: uploadedFiles,
      });
    } catch (error: any) {
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  // Upload and process image
  async uploadImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      if (!req.file.mimetype.startsWith("image/")) {
        return res.status(400).json({ message: "File must be an image" });
      }

      const { width, height, quality } = req.query;
      let processedPath = req.file.path;
      let processedFilename = req.file.filename;

      if (width || height || quality) {
        processedFilename = `processed_${req.file.filename}`;
        processedPath = path.join(req.file.destination || "", processedFilename);

        let sharpImage = sharp(req.file.path);

        if (width || height) {
          sharpImage = sharpImage.resize(
            width ? parseInt(width as string) : undefined,
            height ? parseInt(height as string) : undefined,
            { withoutEnlargement: true }
          );
        }

        if (quality) {
          sharpImage = sharpImage.jpeg({ quality: parseInt(quality as string) });
        }

        await sharpImage.toFile(processedPath);

        fs.unlinkSync(req.file.path);
      }

      const file = new File({
        filename: processedFilename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: fs.statSync(processedPath).size,
        path: processedPath,
        uploadedBy: req.user?.userId,
        category: "image",
      });

      await file.save();

      return res.status(201).json({
        message: "Image uploaded successfully",
        file: {
          id: file._id,
          filename: file.filename,
          originalName: file.originalName,
          mimetype: file.mimetype,
          size: file.size,
          url: `/uploads/${file.filename}`,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  // Upload avatar
  async uploadAvatar(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No avatar uploaded" });
      }

      if (!req.file.mimetype.startsWith("image/")) {
        return res.status(400).json({ message: "Avatar must be an image" });
      }

      const avatarFilename = `avatar_${req.user?.userId}_${Date.now()}.jpg`;
      const avatarPath = path.join(req.file.destination || "", avatarFilename);

      await sharp(req.file.path).resize(200, 200).jpeg({ quality: 90 }).toFile(avatarPath);

      fs.unlinkSync(req.file.path);

      const file = new File({
        filename: avatarFilename,
        originalName: req.file.originalname,
        mimetype: "image/jpeg",
        size: fs.statSync(avatarPath).size,
        path: avatarPath,
        uploadedBy: req.user?.userId,
        category: "avatar",
      });

      await file.save();

      return res.status(201).json({
        message: "Avatar uploaded successfully",
        file: {
          id: file._id,
          filename: file.filename,
          originalName: file.originalName,
          mimetype: file.mimetype,
          size: file.size,
          url: `/uploads/${file.filename}`,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  // Upload document
  async uploadDocument(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No document uploaded" });
      }

      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
      ];

      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ message: "Document type not allowed" });
      }

      const file = new File({
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        uploadedBy: req.user?.userId,
        category: "document",
      });

      await file.save();

      return res.status(201).json({
        message: "Document uploaded successfully",
        file: {
          id: file._id,
          filename: file.filename,
          originalName: file.originalName,
          mimetype: file.mimetype,
          size: file.size,
          url: `/uploads/${file.filename}`,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  // Get all files for user
  async getFiles(req: Request, res: Response) {
    try {
      const { page = "1", limit = "10", category, search } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const query: any = { uploadedBy: req.user?.userId };

      if (category) {
        query.category = category;
      }

      if (search) {
        query.originalName = { $regex: search, $options: "i" };
      }

      const files = await File.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum);

      const total = await File.countDocuments(query);

      const filesWithUrls = files.map((file: any) => ({
        id: file._id,
        filename: file.filename,
        originalName: file.originalName,
        mimetype: file.mimetype,
        size: file.size,
        category: file.category,
        url: `/uploads/${file.filename}`,
        createdAt: file.createdAt,
      }));

      res.json({
        files: filesWithUrls,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  // Get file by ID
  async getFileById(req: Request, res: Response) {
    try {
      const file = await File.findOne({
        _id: req.params.id,
        uploadedBy: req.user?.userId,
      });

      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      return res.json({
        id: file._id,
        filename: file.filename,
        originalName: file.originalName,
        mimetype: file.mimetype,
        size: file.size,
        category: file.category,
        url: `/uploads/${file.filename}`,
        createdAt: file.createdAt,
      });
    } catch (error: any) {
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  // Delete file
  async deleteFile(req: Request, res: Response) {
    try {
      const file = await File.findOne({
        _id: req.params.id,
        uploadedBy: req.user?.userId,
      });

      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        return console.error(
          `Failed to delete physical file or it was already removed: ${file.path}`,
          err
        );
      }

      await File.findByIdAndDelete(req.params.id);

      return res.status(200).json({ message: "File deleted successfully" });
    } catch (error: any) {
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  },
};

export default uploadController;
