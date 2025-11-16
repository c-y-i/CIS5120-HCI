/**
 * API Configuration
 * FOR DEVELOPMENT, USE LOCALHOST:8000
 * FOR PRODUCTION, USE SERVER IP! 
 * For this class tho I might just use my personal aws server if needed for demo?
 */

// Default: localhost (works for desktop development)
const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE) ||
  process.env.REACT_APP_API_BASE ||
  "http://localhost:8000";

// For mobile device access (on local network)
// Replace 192.168.1.154 with your computer's IP address ofc...
// And comment out the API BASE line above, uncomment the line below.
// const API_BASE = "http://192.168.1.154:8000";

export default API_BASE;

