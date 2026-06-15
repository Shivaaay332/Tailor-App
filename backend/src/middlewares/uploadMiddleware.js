const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Check karna ki 'uploads' folder hai ya nahi, agar nahi toh automatically bana dena
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Photo kahan aur kis naam se save hogi uska logic
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ye photos ko backend/uploads folder me daalega
  },
  filename: function (req, file, cb) {
    // Har photo ka unique naam banayega (Jaise: 171837492.jpg)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 3. Sirf images allow karna
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Sirf images (photo) allow hain!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Maximum 5MB ki photo
});

module.exports = upload;