const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
//   console.log(process.env.REACT_APP_API_URL)
  app.use(
    '/api',
    createProxyMiddleware({
target: `/api`,
      
      changeOrigin: true,
    })
  );
};