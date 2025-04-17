export const validateAdData = (req, res, next) => {
  const { title, content, imageUrl, targetUrl } = req.body;

  if (!title || !content || !imageUrl || !targetUrl) {
    return res.status(400).json({
      error: "Missing required fields: title, content, imageUrl, targetUrl",
    });
  }

  if (
    typeof title !== "string" ||
    typeof content !== "string" ||
    typeof imageUrl !== "string" ||
    typeof targetUrl !== "string"
  ) {
    return res.status(400).json({
      error: "All fields must be strings",
    });
  }

  next();
};
