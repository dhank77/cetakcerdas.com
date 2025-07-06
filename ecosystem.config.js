/* eslint-disable no-undef */
module.exports = {
  apps: [
    {
      name: 'ssr',
      script: './bootstrap/ssr/ssr.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
        PORT: 13714 // atau port kamu gunakan
      }
    }
  ]
};
