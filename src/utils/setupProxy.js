const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
//   console.log(process.env.REACT_APP_API_URL)
  app.use(
    '/api',
    createProxyMiddleware({
target: `http://174.129.138.174:8080/api`,
      
      changeOrigin: true,
    })
  );
};