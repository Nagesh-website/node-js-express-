let express = require("express");
let multer = require("multer");
let fs = require("fs");
let path = require("path");

let app = express();
app.use(express.json());

let connection = require("./database");


let uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

let my_storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);  
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname + '-' + Date.now());
    }
});

let upload = multer({ storage: my_storage });

app.post("/upload", upload.single("file"), (req, res) => {
    let file = req.file;
    if (!file) {
        return res.status(400).send("Please upload a file");
    }

  
    if ((file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/JPEG" ) 
        && file.size <= 10 * 1024 * 1024) {

        let name = req.body.name;
        let filename = file.originalname;
        let filepath = file.path;

        let sql = "INSERT INTO multer (file_name, file_path, name) VALUES (?, ?, ?)";
        connection.query(sql, [filename, filepath, name], (err, result) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).send("Failed to save file to database");  
            }
            return res.status(200).send({ message: "File uploaded & saved successfully"});
        });

    } else {
        return res.status(400).send("Invalid file format. Only JPG and PNG are allowed.");
    }
});

app.listen(3000, (err) => {
    err ? console.log("Server connection failed") : console.log("Server started on port 3000");
});
