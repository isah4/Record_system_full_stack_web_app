const { exec } = require('child_process');
const os = require('os');

/**
 * Checks if a port is in use and optionally kills the process using it
 * @param {number} port - The port to check
 * @param {boolean} killProcess - Whether to kill the process using the port
 * @returns {Promise<boolean>} - True if port is available or was freed, false otherwise
 */
function checkAndFreePort(port, killProcess = false) {
  return new Promise((resolve) => {
    const isWindows = os.platform() === 'win32';
    
    // Command to find process using the port
    const command = isWindows
      ? `netstat -ano | findstr :${port}`
      : `lsof -i :${port}`;
    
    exec(command, (error, stdout) => {
      if (error || !stdout) {
        // No process using this port
        console.log(`Port ${port} is available`);
        return resolve(true);
      }
      
      console.log(`Port ${port} is in use`);
      
      if (!killProcess) {
        return resolve(false);
      }
      
      try {
        if (isWindows) {
          // Extract PID from Windows netstat output
          const lines = stdout.split('\n');
          for (const line of lines) {
            if (line.includes(`LISTENING`)) {
              const pid = line.trim().split(/\s+/).pop();
              if (pid) {
                console.log(`Attempting to kill process with PID: ${pid}`);
                exec(`taskkill /F /PID ${pid}`, (killError) => {
                  if (killError) {
                    console.error(`Failed to kill process: ${killError.message}`);
                    resolve(false);
                  } else {
                    console.log(`Successfully killed process using port ${port}`);
                    resolve(true);
                  }
                });
                return;
              }
            }
          }
        } else {
          // Extract PID from Unix lsof output
          const pid = stdout.trim().split('\n')[0].split(/\s+/)[1];
          if (pid) {
            console.log(`Attempting to kill process with PID: ${pid}`);
            exec(`kill -9 ${pid}`, (killError) => {
              if (killError) {
                console.error(`Failed to kill process: ${killError.message}`);
                resolve(false);
              } else {
                console.log(`Successfully killed process using port ${port}`);
                resolve(true);
              }
            });
            return;
          }
        }
        
        // If we get here, we couldn't find a PID to kill
        console.error('Could not identify process to kill');
        resolve(false);
      } catch (e) {
        console.error(`Error while trying to kill process: ${e.message}`);
        resolve(false);
      }
    });
  });
}

module.exports = { checkAndFreePort };