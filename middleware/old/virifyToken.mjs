import jwt from "jsonwebtoken";

export function virifyToken(req, res, next) {
  const token = req.headers.token;

  if (token) {
    try {
      const dec = jwt.verify(token, process.env.SECRTKEY);
      console.log(dec);
      req.user = dec;
      next();
    } catch (error) {
      res.json({ message: "no token", error });
    }
  } else {
    res.json({ message: "no token" });
  }
}
