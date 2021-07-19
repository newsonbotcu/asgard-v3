module.exports = {
  apps: [
    {
      name: "Guard_1",
      script: 'index.js',
      watch: false,
      exec_mode: "cluster",
      max_memory_restart: "2G",
      cwd: "./INTERNAL/BOTS/Guard_1"
    },
    {
      name: "Guard_2",
      script: 'index.js',
      watch: false,
      exec_mode: "cluster",
      max_memory_restart: "2G",
      cwd: "./INTERNAL/BOTS/Guard_2"
    },
    {
      name: "Guard_3",
      script: 'index.js',
      watch: false,
      exec_mode: "cluster",
      max_memory_restart: "2G",
      cwd: "./INTERNAL/BOTS/Guard_3"
    },
    {
      name: "Guard_4",
      script: 'index.js',
      watch: false,
      exec_mode: "cluster",
      max_memory_restart: "2G",
      cwd: "./INTERNAL/BOTS/Guard_4"
    },
    {
      name: "Guard_5",
      script: 'index.js',
      watch: false,
      exec_mode: "cluster",
      max_memory_restart: "2G",
      cwd: "./INTERNAL/BOTS/Guard_5"
    },
    {
      name: "Registry",
      script: 'index.js',
      watch: false,
      exec_mode: "cluster",
      max_memory_restart: "2G",
      cwd: "./INTERNAL/BOTS/Registry"
    },
    {
      name: "Moderator",
      script: 'index.js',
      watch: false,
      exec_mode: "cluster",
      max_memory_restart: "2G",
      cwd: "./INTERNAL/BOTS/Moderator"
    },
    {
      name: "Welcome",
      script: 'index.js',
      watch: false,
      exec_mode: "cluster",
      max_memory_restart: "2G",
      cwd: "./INTERNAL/BOTS/_Welcome"
    }
  ]
};
