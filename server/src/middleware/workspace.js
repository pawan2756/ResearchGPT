export function workspaceMiddleware(req, _res, next) {
  req.user = { id: 'local-workspace' };
  next();
}
