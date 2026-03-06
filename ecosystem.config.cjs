const path = require('path');

module.exports = {
  apps: [
    {
      name: 'strive',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: path.resolve(__dirname),
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // Chrome runs non-headless inside Xvfb (virtual display)
        DISPLAY: ':99',
        CHROME_PATH: '/usr/bin/google-chrome-stable',
      },
      // Restart policy
      max_restarts: 10,
      restart_delay: 5000,
      exp_backoff_restart_delay: 100,
      // Kill Chrome child processes when PM2 restarts the app
      kill_timeout: 5000,
      treekill: true,
      // Auto-restart if memory usage spikes from Chrome accumulation
      max_memory_restart: '1G',
      // Logging
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
