const fs = require('fs');
const path = require('path');

const backupDatabase = () => {
  const date = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '../backups');
  
  // Create backups directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  // Copy the database file with timestamp
  fs.copyFileSync(
    path.join(__dirname, '../database.sqlite'),
    path.join(backupDir, `backup-${date}.sqlite`)
  );

  console.log(`Database backed up to: backups/backup-${date}.sqlite`);
};

// Run backup immediately when script is called
backupDatabase();