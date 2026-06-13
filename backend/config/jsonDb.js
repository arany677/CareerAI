const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, '../db_store.json');

const initializeStore = () => {
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify({ users: [], resumes: [], coverletters: [] }, null, 2));
  }
};

const getDb = () => {
  initializeStore();
  try {
    const data = fs.readFileSync(STORE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { users: [], resumes: [], coverletters: [] };
  }
};

const saveDb = (data) => {
  initializeStore();
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
};

module.exports = { getDb, saveDb };
