const jwt=require("jsonwebtoken");
const  StatusCodes= require("http-status-codes");
const isAuthenticated =async (req, res, next) => {
  
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(StatusCodes.BAD_REQUEST).json({Error: "Please provide bearer token"});
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({Error: "Invalid Token !"});
    }
    try {
      const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.userId = payload.userId;
      req.role = payload.role;
      next();
    } catch (error) {
        console.log(error)
        return res.status(StatusCodes.FORBIDDEN).json({message: " Access Denied !",status : 403});
    }
  };

  module.exports={isAuthenticated}