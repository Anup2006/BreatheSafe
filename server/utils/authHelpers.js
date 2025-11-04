export const getUserIdFromRequest = (req) => {
  // First try from middleware
  if (req.userId) {
    return req.userId;
  }
  
  // Fallback: Extract from token manually
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new Error('No token provided');
    }
    
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    return decoded.userId || decoded.id || decoded._id;
  } catch (error) {
    throw new Error('Unable to extract user ID: ' + error.message);
  }
};

export const validateUserId = (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User ID not found. Please log in again.'
      });
      return null;
    }
    
    return userId;
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
    return null;
  }
};
