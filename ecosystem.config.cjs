module.exports = {
  apps: [
    {
      name: 'strive',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/home/ec2-user/strive',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // Chrome runs non-headless inside Xvfb (virtual display)
        DISPLAY: ':99',
        CHROME_PATH: '/usr/bin/google-chrome-stable',
        // Auth
        AUTH_SECRET: 'djGdt1sH426Sbdg+76PZFGsg/lohXTHWU3O5fQZZmKo=',
        AUTH_DISCORD_ID: '',
        AUTH_DISCORD_SECRET: '',
        AUTH_TRUST_HOST: 'TRUE',
        // Database
        DATABASE_URL:
          'mongodb+srv://jefiene77_db_user:uU2Ip0wTno02ZkIK@cluster0.xrfoffg.mongodb.net/strive?appName=Cluster0',
        // Strava
        AUTH_STRAVA_ID: '174733',
        AUTH_STRAVA_SECRET: 'f08e0541c5b62af7bd7649d30334a7a042aabcd0',
        // Cloudinary
        CLOUDINARY_CLOUD_NAME: 'hemi',
        CLOUDINARY_API_KEY: '164766327971929',
        CLOUDINARY_API_SECRET: 'PMuNiIAjiPh5LQazYTt76er3PBY',
        // App
        NEXTAUTH_URL: 'http://localhost:3000',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
        // BrightData proxy
        BRIGHTDATA_USERNAME: 'brd-customer-hl_d063dc7f-zone-strive_proxy',
        BRIGHTDATA_PASSWORD: 'my4kddj383ax',
      },
      // Restart policy
      max_restarts: 10,
      restart_delay: 5000,
      exp_backoff_restart_delay: 100,
      // Logging
      error_file: '/home/ubuntu/strive/logs/pm2-error.log',
      out_file: '/home/ubuntu/strive/logs/pm2-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
