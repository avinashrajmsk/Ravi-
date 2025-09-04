module.exports = {
  apps: [
    {
      name: 'satyam-gold',
      script: 'npx',
      args: 'wrangler pages dev public --d1=satyam-gold-production --local --port 3000 --ip 0.0.0.0',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      restart_delay: 1000,
      max_restarts: 10
    }
  ]
}