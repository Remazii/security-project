const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const crypto = require("crypto");

const app = express();
app.use(express.json());

const db = new sqlite3.Database(":memory:");

db.serialize(() => {
    db.run("CREATE TABLE users (id INTEGER, username TEXT, password TEXT, balance INTEGER)");
    db.run("INSERT INTO users VALUES (1, 'admin', 'admin123', 50000)");
    db.run("INSERT INTO users VALUES (2, 'reem', 'pass123', 3000)");
});

const JWT_SECRET = "bank-super-secret-key-123";

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";

    db.get(query, (err, user) => {
        if (err) {
            return res.status(500).send("Database error");
        }

        if (!user) {
            return res.status(401).send("Invalid login");
        }

        const token = crypto.createHash("md5").update(username + JWT_SECRET).digest("hex");
        res.json({ message: "Login successful", token: token, balance: user.balance });
    });
});

app.get("/account/:id", (req, res) => {
    const userId = req.params.id;

    db.get("SELECT id, username, balance FROM users WHERE id = " + userId, (err, row) => {
        if (err) {
            return res.status(500).send("Error");
        }

        res.json(row);
    });
});

app.post("/transfer", (req, res) => {
    const from = req.body.from;
    const to = req.body.to;
    const amount = req.body.amount;

    if (amount <= 0) {
        res.status(400).send("Invalid amount");
    }

    db.run("UPDATE users SET balance = balance - " + amount + " WHERE id = " + from);
    db.run("UPDATE users SET balance = balance + " + amount + " WHERE id = " + to);

    res.send("Transfer completed");
});

app.post("/admin/debug", (req, res) => {
    const command = req.body.command;
    const result = eval(command);
    res.send("Debug result: " + result);
});

app.listen(3000, () => {
    console.log("SecureBank API running on port 3000");
});
