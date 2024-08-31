require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const multer = require('multer');
const bcrypt = require('bcrypt');
const db = require('./db')

const app = express();
const port = process.env.PORT;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'img/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.set('view engine', 'ejs');
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use('/img', express.static('img'));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'landing_page',
    resave: false,
    saveUninitialized: true
}));


app.get("/", async (req, res) => {
    try {
        let isLoggedIn = false
        if (req.session.roleStatus === 'admin') {
            isLoggedIn = true;
        }
        if (isLoggedIn) {
            const accountData = (await db.query('SELECT * FROM admin')).rows;
            if (req.session) {
                req.session.accountData = accountData;
            }

            const aboutData = (await db.query('SELECT * FROM about')).rows;
            const about_TotalProjects = (await db.query('SELECT COUNT(*) FROM projects')).rows[0].count;
            const qualificationData = (await db.query('SELECT * FROM qualification')).rows;
            const projectsData = (await db.query('SELECT * FROM projects')).rows;

            req.session.aboutData = aboutData;
            req.session.about_TotalProjects = about_TotalProjects;
            req.session.qualificationData = qualificationData;
            req.session.projectsData = projectsData;

            return res.render(path.join(__dirname, "index"), { aboutData, about_TotalProjects, qualificationData, projectsData, isLoggedIn });

        } else {
            const aboutData = (await db.query('SELECT * FROM about')).rows;
            const about_TotalProjects = (await db.query('SELECT COUNT(*) FROM projects')).rows[0].count;
            const qualificationData = (await db.query('SELECT * FROM qualification')).rows;
            const projectsData = (await db.query('SELECT * FROM projects')).rows;

            req.session.aboutData = aboutData;
            req.session.about_TotalProjects = about_TotalProjects;
            req.session.qualificationData = qualificationData;
            req.session.projectsData = projectsData;

            return res.render(path.join(__dirname, "index"), { aboutData, about_TotalProjects, qualificationData, projectsData, isLoggedIn });
        }
    } catch (error) {
        console.error("Error executing queries", error);
        res.redirect("/");
    }
});
app.get("/home", (req, res) => {
    res.redirect("/");
});


app.get("/login", (req, res) => {
    res.render(path.join(__dirname, "login"), {});
});
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const adminCommand = 'SELECT * FROM admin WHERE username = $1';
    const adminParams = [username];

    try {
        const adminResults = await db.query(adminCommand, adminParams);

        if (adminResults.rowCount > 0) {
            const admin = adminResults.rows[0];
            const isValid = await bcrypt.compare(password, admin.password);
            console.log("Validation: ", isValid);
            console.log("Password entered: ", password);
            console.log("Real Password: ", admin.password);
            if (!isValid) {
                console.log("Invalid login information");
                return res.redirect("/login");
            }

            console.log("Logged in!");
            req.session.roleStatus = admin.role;
            return res.redirect("/admin");

        } else {
            return res.redirect("/login");
        }
    } catch (error) {
        console.error("Error executing query", error);
        return res.redirect("/login");
    }
});


app.get("/admin", async (req, res) => {
    const aboutData = (await db.query('SELECT * FROM about')).rows;
    const about_TotalProjects = (await db.query('SELECT COUNT(*) FROM projects')).rows[0].count;
    const qualificationData = (await db.query('SELECT * FROM qualification')).rows;
    const projectsData = (await db.query('SELECT * FROM projects')).rows;

    req.session.aboutData = aboutData;
    req.session.about_TotalProjects = about_TotalProjects;
    req.session.qualificationData = qualificationData;
    console.log(qualificationData)
    req.session.projectsData = projectsData;

    res.render(path.join(__dirname, "admin"), { aboutData, about_TotalProjects, qualificationData, projectsData });
});
app.post("/admin", upload.any(), async (req, res) => {
    const { newAboutDescription, newQualTitle, newLocation, newTimeSpan, qualCategory, deleteQualificationID, newFocus, newTitle, newDescription, newLink, deleteProjectID } = req.body;
    let aboutImagePath = null;
    let projectImagePath = null;

    if (req.files) {
        req.files.forEach(file => {
            if (file.fieldname === 'aboutImage') {
                aboutImagePath = `/img/${file.filename}`
            }
            if (file.fieldname === 'projectImage') {
                projectImagePath = `/img/${file.filename}`
            }
        })
    }

    try {
        if (newAboutDescription) {
            console.log('desc', newAboutDescription);
            const aboutDescriptionQuery = 'UPDATE about SET description = $1 WHERE id = 1';
            await db.query(aboutDescriptionQuery, [newAboutDescription]);
            console.log('Successfully updated about description');
        }

        if (aboutImagePath) {
            console.log('about image path:', aboutImagePath);
            const aboutImageQuery = 'UPDATE about SET image_path = $1 WHERE id = 1';
            await db.query(aboutImageQuery, [aboutImagePath]);
            console.log('Successfully updated about image');
        }

        if (newQualTitle && newLocation && newTimeSpan && qualCategory) {
            const insertQualificationQuery = 'INSERT INTO qualification (title, location, time_span, category) VALUES ($1, $2, $3, $4) RETURNING *';
            await db.query(insertQualificationQuery, [newQualTitle, newLocation, newTimeSpan, qualCategory]);
            console.log('Successfully added qualification!');
        }

        if (deleteQualificationID) {
            const deleteQualificationQuery = 'DELETE FROM qualification WHERE id = $1';
            await db.query(deleteQualificationQuery, [deleteQualificationID]);
            console.log('Successfully deleted qualification!');
        }

        if (newFocus && newTitle && newDescription && newLink && projectImagePath) {
            console.log(projectImagePath);
            const insertProjectQuery = 'INSERT INTO projects (focus, title, description, link, image_path) VALUES ($1, $2, $3, $4, $5) RETURNING *';
            await db.query(insertProjectQuery, [newFocus, newTitle, newDescription, newLink, projectImagePath]);
            console.log('Successfully added project!');
        }

        if (deleteProjectID) {
            const deleteProjectQuery = 'DELETE FROM projects WHERE id = $1';
            await db.query(deleteProjectQuery, [deleteProjectID]);
            console.log("Project deleted successfully");
        }

        const aboutData = (await db.query('SELECT * FROM about')).rows;
        const about_TotalProjects = (await db.query('SELECT COUNT(*) FROM projects')).rows[0].count;
        const qualificationData = (await db.query('SELECT * FROM qualification')).rows;
        const projectsData = (await db.query('SELECT * FROM projects')).rows;

        req.session.aboutData = aboutData;
        req.session.about_TotalProjects = about_TotalProjects;
        req.session.qualificationData = qualificationData;
        req.session.projectsData = projectsData;

        res.render(path.join(__dirname, "admin"), { aboutData, about_TotalProjects, qualificationData, projectsData });
    } catch (error) {
        console.error("Error executing queries", error);
        res.redirect("/admin");
    }
});


app.get("/logout", (req, res) => {
    req.session.roleStatus = "";
    res.redirect("/");
})


app.listen(port, (req, res) => {
    console.log(`Listening on http://localhost:${port}`);
});
