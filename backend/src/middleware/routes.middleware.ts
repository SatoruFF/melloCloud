export function routesMiddleWare(req, res, next) {
  // If the path starts with `/api`, remove it from the request URL
  if (req.url.startsWith('/api')) {
    req.url = req.url.slice(4); // Remove `/api`
  }
  next();
}
