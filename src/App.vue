<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f8f9fa;
}

#app {
  min-height: 100vh;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
}

.btn-primary:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

.text-primary {
  color: #007bff !important;
}

.bg-primary {
  background-color: #007bff !important;
}

.sidebar {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.sidebar-link {
  color: rgba(255, 255, 255, 0.8);
  padding: 0.75rem 1.25rem;
  display: block;
  text-decoration: none;
  border-radius: 0.375rem;
  margin-bottom: 0.25rem;
  transition: all 0.3s ease;
}

.sidebar-link:hover,
.sidebar-link.active {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  text-decoration: none;
}

.stat-card {
  border-radius: 0.5rem;
  border: none;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.chart-container {
  position: relative;
  height: 300px;
}
</style>