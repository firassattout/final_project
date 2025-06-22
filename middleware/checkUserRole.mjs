import jwt from "jsonwebtoken";

export const checkUserRole = (requiredRole) => {
  return (req, res, next) => {
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
      const userId = decodedToken.id;
      const userRole = decodedToken.role;

      if (requiredRole)
        if (userRole !== requiredRole) {
          return res.status(403).json({
            success: false,
            message: `Access denied! ${requiredRole} role required.`,
          });
        }

      req.user = {};
      req.user.id = userId;
      req.user.role = userRole;

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
};
