// middleware/isAuthenticated.js
module.exports = (req, res, next) => {
  if (!req.session.userId) {
    // Ako korisnik nije logovan, preusmeri na login
    return res.redirect("/login");
  }
  next();
};
