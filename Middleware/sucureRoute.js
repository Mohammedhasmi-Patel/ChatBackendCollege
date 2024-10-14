import jwt from "jsonwebtoken";
import User from "../Models/User.model.js";

const secureRoute = async (req, res, next) => {
  try {
    const token = req?.headers?.authorization?.split("Bearer ")?.[1];
    if (!token) {
      return res.status(401).json({ error: "No token, authorization denied" });
    }

    // if we find token then we need to decode first
    const decoded = await jwt.verify(token, process.env.JWT_TOKEN);

    if (!decoded) {
      return res.status(401).json({ error: "invalid token.." });
    }

    // now everything is fine ,so we will just findout our user from the database
    const user = await User.findById(decoded.userId).select("-password"); // current login user
    if (!user) {
      return res.status(401).json({ error: "no user found..." });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(`error come from secureRoute ${error}`);
    res.status(500).json({ error: "internal server error.." });
  }
};

export default secureRoute;
