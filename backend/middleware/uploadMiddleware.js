const multer = require('multer');
const path = require('path');

// Storage for resumes
const resumeStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/resumes/';
        require('fs').mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Sanitize filename
        const safeFilename = file.originalname.replace(/[^a-zA-Z0-9-_\.]/g, '_');
        cb(null, `resume-${Date.now()}${path.extname(safeFilename)}`);
    }
});

const resumeUpload = multer({
    storage: resumeStorage,
    fileFilter: (req, file, cb) => {
        // Allow pdf, doc, docx
        const filetypes = /pdf|doc|docx/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        const err = new Error('File upload only supports PDF, DOC, and DOCX!');
        err.statusCode = 400;
        cb(err);
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = { resumeUpload };