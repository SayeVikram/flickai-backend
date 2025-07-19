const { spawn } = require('child_process');
const path = require('path');

const createEmbedding = async (text) => {
  return new Promise((resolve, reject) => {
    const pythonScriptPath = path.join(__dirname, 'embedding_service.py');
    const pythonPath = path.join(__dirname, 'venv', 'bin', 'python');
    
    const pythonProcess = spawn(pythonPath, [pythonScriptPath, text]);
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}. Error: ${stderr}`));
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        if (result.success) {
          resolve(result.embedding);
        } else {
          reject(new Error(result.error));
        }
      } catch (parseError) {
        reject(new Error(`Failed to parse Python output: ${parseError.message}. Output: ${stdout}`));
      }
    });
    
    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });
  });
};

module.exports = {createEmbedding}
