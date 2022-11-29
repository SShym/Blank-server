const multer = require('multer');

const upload = multer({
    limits: { 
        fieldSize: 25 * 1024 * 1024 
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpeg|jpg|png)$/)){
            cb(new Error('only update files with jpeg or jpeg or png format .'));
        }
        cb(undefined, true) // Continue with upload
    }
});

module.exports = upload.single('photo');