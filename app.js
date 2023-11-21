const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.0.2/studentDB', {
});

app.use(express.static(path.join(__dirname, 'public')));

app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, ''));
app.use('/form', express.static(__dirname + '/index.'));

const studentSchema = new mongoose.Schema({
    name: String,
    code: String,
    photo: String,
});

const Student = mongoose.model('Student', studentSchema);

const storage = multer.diskStorage({
    destination: 'public/uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
    try {
        const students = await Student.find();
        res.render('index', { students });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/add-student', upload.single('photo'), async (req, res) => {
    try {
        const { name, code } = req.body;
        const photoPath = req.file.filename;

        const newStudent = new Student({
            name,
            code,
            photo: photoPath,
        });

        await newStudent.save();
        res.redirect('/');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/students/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        res.render('studentDetails', { student });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
