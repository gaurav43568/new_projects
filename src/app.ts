import express from 'express';
import multer, { FileFilterCallback } from 'multer';
import cors from 'cors';
import { processImage, getPreview, downloadImage } from './controllers';  // Ensure correct imports
const path = require('path');
const app = express();
app.use(cors());  // Enable CORS

const fileFilter = (req: express.Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
     console.log("file type is not png or jpg")
  }
};

const upload = multer({ 
  dest: 'uploads/',
  fileFilter: fileFilter
});

// Routes for uploading, previewing, and downloading images
app.post('/upload', upload.single('image'), processImage);
app.post('/preview', upload.single('image'), getPreview);
app.get('/download', downloadImage);  // Route to handle image download

__dirname = path.resolve();
if ('production' === 'production') {
    app.use(express.static('dist'));
        console.log('production');
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
        console.log('production2');
    });
} else {
    app.get('/', (req, res) => {
        res.send('Server is Running! 🚀');
    });
}

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
