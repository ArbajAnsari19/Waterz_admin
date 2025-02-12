const URL = "http://localhost:8000";
const userBaseURL = URL + "/user";
const signUp = URL + "/auth";
const booking = URL + "/booking";
const customer = URL + "/customer";
const admin = URL + "/admin";
const owner = URL + "/owner";
export const paths = {
  // Auth endpoints
  login: `${signUp}/signin`,
  signupAdmin: `${signUp}/signup/admin`,
  generateOtp: `${signUp}/generate-otp`,
  verifyOtp: `${signUp}/verify-otp`,
  logout: `${userBaseURL}/logout`,
  googleAuth: `${userBaseURL}/google`,
  
  // User endpoints
  getUserProfile: `${userBaseURL}/profile`,
  updateUserProfile: `${userBaseURL}/profile/update`,
  
  // yacht
  getYachtList: `${customer}/listAll`,
  getTopYachts: `${customer}/topYatch`,
  getYachtById: `${customer}/yatch-detail`,

  // query
  userQuery: `${URL}/query`,

  // filter
  locationFilter: `${booking}/idealYatchs`,
  bookYacht: `${booking}/create`,

  // Booking endpoints
    currentRides: `${customer}/current/rides`,
    prevRides: `${customer}/prev/rides`,
    prevRidesId: `${customer}/rides`,

  // owner
  createYacht: `${owner}/create`,

  // Admin endpoints
  getAllYatchs: `${admin}/filtered-yatchs`,
  getAllOwners: `${admin}/getAllOwners`,
  getAllCustomers: `${admin}/filtered-customers`,
  getAllBookings: `${admin}/filtered-bookings`,
  getAllQueries: `${admin}/getAllQueries`,
  getAllPayments: `${admin}/filtered-Earning`,
  getAllSuperAgents: `${admin}/getAllSuperAgents`,
  getAllAgents: `${admin}/getAllAgents`,
  getYatchOwner: `${admin}/yatchOwner`,
  getAllBookingByOwner: `${admin}/owners-Booking`,
  getAnalytics: `${admin}/analytics`,
  getDashboardData: `${admin}/dashboardData`,
};



export default paths;