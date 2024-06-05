// Package permettant de gérer les fichiers entrants dans les request HTTP
const multer = require("multer");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "video/mp4": "mp4",
  "video/quicktime": "mov"
};
const storage = multer.diskStorage({
  // indique à multer d'enregistrer les fichiers dans le dossier images
  destination: (req, file, callback) => {
    callback(null, "media/images");
  },
  filename: (req, file, callback) => {
    // indique à multer d'utiliser le nom d'origine et de remplacer les espaces par des underscores
    const originalName = file.originalname.split(" ").join("_");
    const name = originalName.substring(0, originalName.lastIndexOf('.'));
    // permet de résoudre l'extension de fichier appropriée
    const extension = MIME_TYPES[file.mimetype];
    // on ajoute un timestamp Date.now() comme nom de fichier.
    callback(null, name +  "." + extension);
  },
});

const fileFilter = (req, file, callback) => {
    const isValid = !!MIME_TYPES[file.mimetype];
    let error = isValid ? null : new Error("Invalid mime type");
    callback(error, isValid);
  };
  
  const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 100 * 1024 * 1024 // Limite la taille du fichier à 5 Mo
    }
});

// on exporte multer en lui passant storage et en lui indiquant qu'on génére uniquement les fichiers image
module.exports = upload.single("media");