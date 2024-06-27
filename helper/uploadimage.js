const path = require('path');
const multer = require('multer');



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../public/event"), function (err, success) {
            if (err) throw err

        });
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name, function (error1, success1) {
            if (error1) throw error1
        })
    }
})

exports.upload = multer({
    storage: storage,
    metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
    },
    fileFilter: function (req, file, cb) {
        const file_type = file.originalname.split('.');
        //req.body.size = parseInt(req.headers['content-length']) / 1048576;
        req.body.location = `${req.params.id}/${req.params.file}/${Date.now().toString()}.${file_type[file_type.length - 1]}`;
        cb(null, `${req.params.id}/${req.params.file}/${Date.now().toString()}.${file_type[file_type.length - 1]}`);
    },
});

exports.image_compress_response = async (req, res, cb) => {
    var data = [], images = [], video = [];
    try {

        for (let index = 0; index < req.files.length; index++) {
            const element = req.files[index];
            if (element.transforms) {
                if (element.mimetype === "image/jpeg" || element.mimetype === "image/gif" || element.mimetype === "image/png" || element.mimetype === "image/svg" || element.mimetype === "image/webp") {
                    images.push({ location: element.transforms[0].path, size: element.transforms[0].size });
                }
                if (element.mimetype === "video/mp4" || element.mimetype === "video/mov" || element.mimetype === "video/wmv" || element.mimetype === "video/avi" || element.mimetype === "video/flv" || element.mimetype === "video/mkv" || element.mimetype === "video/webm") {
                    video.push({ location: element.transforms[0].path, size: element.transforms[0].size });
                }
            } else {
                if (element.mimetype === "image/jpeg" || element.mimetype === "image/gif" || element.mimetype === "image/png" || element.mimetype === "image/svg" || element.mimetype === "image/webp") {
                    images.push({ location: element.path, size: element.size });
                }
                if (element.mimetype === "video/mp4" || element.mimetype === "video/mov" || element.mimetype === "video/wmv" || element.mimetype === "video/avi" || element.mimetype === "video/flv" || element.mimetype === "video/mkv" || element.mimetype === "video/webm") {
                    video.push({ location: element.path, size: element.size });
                }
            }
        }
        data.push({ images: images, video: video });
        req.data = data;
        cb();

    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, `Internal Server Error!`, {}, error));
    }
}





