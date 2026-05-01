const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

const db = {
    read() {
        try {
            if (!fs.existsSync(DB_FILE)) {
                return { users: {}, states: {} };
            }
            const data = fs.readFileSync(DB_FILE, 'utf8');
            return JSON.parse(data);
        } catch (e) {
            console.error("Database read error:", e);
            return { users: {}, states: {} };
        }
    },

    write(data) {
        try {
            fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        } catch (e) {
            console.error("Database write error:", e);
        }
    },

    getUserState(email) {
        const data = this.read();
        return data.states[email] || null;
    },

    saveUserState(email, state) {
        const data = this.read();
        data.states[email] = state;
        this.write(data);
    },

    verifyUser(email, password) {
        const data = this.read();
        if (data.users[email] === password) {
            return true;
        }
        // If user exists in authorized list but has no password set (first time)
        // This project handles registration by setting the first password used.
        return false;
    },

    registerUser(email, password) {
        const data = this.read();
        data.users[email] = password;
        this.write(data);
    }
};

module.exports = db;
