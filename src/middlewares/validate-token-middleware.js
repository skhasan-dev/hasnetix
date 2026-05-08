import jwt from "jsonwebtoken";

const ensureAuthenticated = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(403).json({ message: "Token is required" });
  }

  const token = authHeader.split(" ")[1]; // Remove "Bearer"

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    
    req.user = decoded; // Set to use in controller
    next();
  } catch (err) {

    console.error("Error verifying access token:", err);
      return res.status(403).json({ message: "Token is not valid or it's expired" });
      
  }
};

export default ensureAuthenticated;