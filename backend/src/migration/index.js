const { query } = require('../../shared/db');
const fs = require('fs');
const path = require('path');

/**
 * Lambda handler for database migration.
 * Runs init.sql against the RDS instance.
 */
exports.handler = async (event) => {
  console.log('Starting execution of database migration...');
  
  try {
    const sqlPath = path.join(__dirname, 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL into individual commands (primitive split by ;)
    // Note: This is an idempotent script because of CREATE TABLE IF NOT EXISTS.
    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);
      
    console.log(`Found ${commands.length} SQL commands to execute.`);
    
    for (const command of commands) {
      console.log(`Executing: ${command.substring(0, 50)}...`);
      await query(command + ';');
    }
    
    console.log('Database migration completed successfully!');
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        status: 'success',
        message: 'Database migration completed successfully',
        commandsExecuted: commands.length
      })
    };
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        status: 'error',
        message: 'Migration failed',
        error: error.message 
      })
    };
  }
};
