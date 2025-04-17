import jwt from "jsonwebtoken";

export const checkUser = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({
      success: false,
      message: "Error! Token was not provided.",
    });
  }

  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Error! Token was not provided.",
    });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET);
    const id = decodedToken.id;
    const role = decodedToken.role;

    req.body.IdFromToken = id;
    req.body.roleFromToken = role;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired.",
      });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }
};
