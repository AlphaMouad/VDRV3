module.exports = {
  apps: [
    {
      name: 'vdr-v3',
      script: 'node_modules/next/dist/bin/next',
      args: 'start --port 3000',
      cwd: 'C:\\Users\\hp\\Desktop\\Le Tanjia\\VDR-V3-Updated',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
    },
  ],
}
