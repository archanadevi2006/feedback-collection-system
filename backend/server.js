const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = 3000;

// ==============================
// Middleware
// ==============================

app.use(cors());
app.use(express.json());

// ==============================
// Database Connection
// ==============================

const db = new sqlite3.Database("./database.db", (err) => {

    if (err) {

        console.error("❌ Database Connection Error:", err.message);

    } else {

        console.log("✅ Connected to SQLite Database");

    }

});

// ==============================
// Create Feedback Table
// ==============================

db.run(`
CREATE TABLE IF NOT EXISTS feedback (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL,

    email TEXT UNIQUE NOT NULL,

    rating INTEGER NOT NULL,

    comments TEXT NOT NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)
`, (err) => {

    if (err) {

        console.error(err.message);

    } else {

        console.log("✅ Feedback table ready");

    }

});

// ==============================
// Create Admin Table
// ==============================

db.run(`
CREATE TABLE IF NOT EXISTS admin (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    username TEXT UNIQUE NOT NULL,

    password TEXT NOT NULL

)
`, (err) => {

    if (err) {

        console.error(err.message);

    } else {

        console.log("✅ Admin table ready");

        db.run(
            `
            INSERT OR IGNORE INTO admin(username,password)
            VALUES('admin','admin123')
            `,
            (err) => {

                if (err) {

                    console.error(err.message);

                } else {

                    console.log("✅ Default Admin Created");

                }

            }

        );

    }

});

// ===================================================
// GET ALL FEEDBACK
// ===================================================

app.get("/feedback", (req, res) => {

    db.all(

        "SELECT * FROM feedback ORDER BY id DESC",

        [],

        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }

            res.json(rows);

        }

    );

});

// ===================================================
// GET SINGLE FEEDBACK
// ===================================================

app.get("/feedback/:id", (req, res) => {

    db.get(

        "SELECT * FROM feedback WHERE id=?",

        [req.params.id],

        (err, row) => {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }

            res.json(row);

        }

    );

});

// ===================================================
// ADD FEEDBACK
// ===================================================

app.post("/feedback", (req, res) => {

    const {

        name,
        email,
        rating,
        comments

    } = req.body;

    db.run(

        `
        INSERT INTO feedback(name,email,rating,comments)
        VALUES(?,?,?,?)
        `,

        [

            name,
            email,
            rating,
            comments

        ],

        function (err) {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }

            res.json({

                success: true,

                message: "Feedback Added Successfully",

                id: this.lastID

            });

        }

    );

});

// ===================================================
// UPDATE FEEDBACK
// ===================================================

app.put("/feedback/:id", (req, res) => {

    const {

        name,
        email,
        rating,
        comments

    } = req.body;

    db.run(

        `
        UPDATE feedback
        SET
            name=?,
            email=?,
            rating=?,
            comments=?
        WHERE id=?
        `,

        [

            name,
            email,
            rating,
            comments,
            req.params.id

        ],

        function (err) {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }

            res.json({

                success: true,

                message: "Feedback Updated Successfully"

            });

        }

    );

});

// ===================================================
// DELETE FEEDBACK
// ===================================================

app.delete("/feedback/:id", (req, res) => {

    db.run(

        "DELETE FROM feedback WHERE id=?",

        [

            req.params.id

        ],

        function (err) {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }

            res.json({

                success: true,

                message: "Feedback Deleted Successfully"

            });

        }

    );

});

// ===================================================
// ADMIN LOGIN
// ===================================================

app.post("/admin/login", (req, res) => {

    const { username, password } = req.body;

    db.get(
        "SELECT * FROM admin WHERE username=? AND password=?",
        [username, password],
        (err, row) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (!row) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid Username or Password"
                });
            }

            res.json({
                success: true,
                message: "Login Successful",
                admin: {
                    id: row.id,
                    username: row.username
                }
            });

        }
    );

});

// ===================================================
// SEARCH FEEDBACK BY NAME
// URL:
// http://localhost:3000/search?name=Archana
// ===================================================

app.get("/search", (req, res) => {

    const search = req.query.name || "";

    db.all(
        `
        SELECT *
        FROM feedback
        WHERE name LIKE ?
        ORDER BY id DESC
        `,
        [`%${search}%`],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(rows);

        }
    );

});

// ===================================================
// FILTER FEEDBACK BY RATING
// URL:
// http://localhost:3000/filter?rating=5
// ===================================================

app.get("/filter", (req, res) => {

    const rating = req.query.rating;

    if (!rating) {

        return res.status(400).json({
            success: false,
            message: "Rating parameter is required"
        });

    }

    db.all(
        `
        SELECT *
        FROM feedback
        WHERE rating=?
        ORDER BY id DESC
        `,
        [rating],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(rows);

        }
    );

});

// ===================================================
// DASHBOARD STATISTICS
// URL:
// http://localhost:3000/dashboard
// ===================================================

app.get("/dashboard", (req, res) => {

    db.all(
        "SELECT rating FROM feedback",
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            const total = rows.length;

            const average =
                total > 0
                    ? (
                        rows.reduce((sum, item) => sum + Number(item.rating), 0) / total
                    ).toFixed(1)
                    : "0";

            const oneStar = rows.filter(r => r.rating == 1).length;
            const twoStar = rows.filter(r => r.rating == 2).length;
            const threeStar = rows.filter(r => r.rating == 3).length;
            const fourStar = rows.filter(r => r.rating == 4).length;
            const fiveStar = rows.filter(r => r.rating == 5).length;

            res.json({

                total,

                average,

                oneStar,

                twoStar,

                threeStar,

                fourStar,

                fiveStar

            });

        }
    );

});

// ===================================================
// DEFAULT ROUTE
// ===================================================

app.get("/", (req, res) => {

    res.json({

        success: true,

        message: "Feedback Collection System API is Running 🚀"

    });

});

// ===================================================
// START SERVER
// ===================================================

app.listen(PORT, () => {

    console.log("========================================");
    console.log("🚀 Feedback Collection System Server");
    console.log("========================================");
    console.log(`🌐 Server URL : http://localhost:${PORT}`);
    console.log("📂 Database   : SQLite");
    console.log("========================================");

});
