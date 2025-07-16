import AsyncStorage from '@react-native-async-storage/async-storage';

// Global API Configuration
export const API_CONFIG = {
  // Change this IP address to your server IP
  BASE_URL: 'http://192.168.100.5:5000',
  
  // API Endpoints
  ENDPOINTS: {
    
    // Auth endpoints
    AUTH_PROFILE: '/api/auth/profile',
    CUSTOMER_SIGNUP: '/api/auth/customer/signup',
    CUSTOMER_SIGNIN: '/api/auth/customer/signin',
    PROVIDER_SIGNUP: '/api/auth/provider/signup',
    PROVIDER_SIGNIN: '/api/auth/provider/signin',
    ADMIN_SIGNIN: '/api/auth/admin/signin',
    ADMIN_VERIFY_TOKEN: '/api/auth/admin/verify',
    
    // Customer endpoints
    CUSTOMER_BOOKINGS: '/api/customer/bookings',
    CUSTOMER_BOOKING_DETAIL: '/api/customer/bookings/:bookingId',
    CUSTOMER_BOOKING_CANCEL: '/api/customer/bookings/:bookingId/cancel',
    CUSTOMER_NOTIFICATIONS: '/api/customer/notifications',
    CUSTOMER_NOTIFICATION_READ: '/api/customer/notifications/:notificationId/read',
    CUSTOMER_REVIEWS: '/api/customer/reviews',
    CUSTOMER_STATS: '/api/customer/stats',
    CUSTOMER_SERVICE_SEARCH: '/api/customer/services/search',
    CUSTOMER_SERVICE_DETAIL: '/api/customer/services/:serviceId',
    CUSTOMER_CATEGORIES: '/api/customer/services/categories',
    CUSTOMER_CHATS: '/api/customer/chats',
    CUSTOMER_CHAT_MESSAGES: '/api/customer/chats/:chatId/messages',
    CUSTOMER_CHAT_SEND: '/api/customer/chats/:chatId/messages',
    CUSTOMER_PROFILE: '/api/customer/profile',
    CUSTOMER_SUPPORT: '/api/customer/support',
    
    // Provider endpoints
    PROVIDER_DASHBOARD: '/api/provider/dashboard',
    PROVIDER_SERVICES: '/api/provider/services',
    PROVIDER_SERVICE_CREATE: '/api/provider/services',
    PROVIDER_SERVICE_UPDATE: '/api/provider/services/:serviceId',
    PROVIDER_SERVICE_DELETE: '/api/provider/services/:serviceId',
    PROVIDER_BOOKINGS: '/api/provider/bookings',
    PROVIDER_BOOKING_DETAIL: '/api/provider/bookings/:bookingId',
    PROVIDER_BOOKING_ACCEPT: '/api/provider/bookings/:bookingId/accept',
    PROVIDER_BOOKING_REJECT: '/api/provider/bookings/:bookingId/reject',
    PROVIDER_BOOKING_COMPLETE: '/api/provider/bookings/:bookingId/complete',
    PROVIDER_CHATS: '/api/provider/chats',
    PROVIDER_CHAT_MESSAGES: '/api/provider/chats/:chatId/messages',
    PROVIDER_CHAT_SEND: '/api/provider/chats/:chatId/messages',
    PROVIDER_REVIEWS: '/api/provider/reviews',
    PROVIDER_PROFILE: '/api/provider/profile',
    PROVIDER_AVAILABILITY: '/api/provider/availability',
    PROVIDER_COMPLAINTS: '/api/provider/complaints',
    
    // Admin endpoints
    ADMIN_DASHBOARD: '/api/admin/dashboard',
    ADMIN_PROFILE: '/api/admin/profile',
    ADMIN_USERS: '/api/admin/users',
    ADMIN_USERS_DELETE: '/api/admin/users/:id',
    ADMIN_USERS_STATUS: '/api/admin/users/:userId/status',
    ADMIN_PROVIDERS_PENDING: '/api/admin/providers/pending',
    ADMIN_PROVIDERS_APPROVE: '/api/admin/providers/:providerId/approve',
    ADMIN_PROVIDERS_REJECT: '/api/admin/providers/:providerId/reject',
    ADMIN_PROVIDERS_DOCUMENTS: '/api/admin/providers/:providerId/documents',
    ADMIN_ANALYTICS_BOOKINGS: '/api/admin/analytics/bookings',
    ADMIN_COMPLAINTS: '/api/admin/complaints',
    ADMIN_COMPLAINTS_DETAILS: '/api/admin/complaints/:complaintId',
    ADMIN_COMPLAINTS_ASSIGN: '/api/admin/complaints/:complaintId/assign',
    ADMIN_COMPLAINTS_RESOLVE: '/api/admin/complaints/:complaintId/resolve',
    ADMIN_COMPLAINTS_STATUS: '/api/admin/complaints/:complaintId/status',
    ADMIN_PROVIDERS_RATINGS: '/api/admin/providers/ratings',
    ADMIN_PROVIDERS_REVIEWS: '/api/admin/providers/:providerId/reviews',
    ADMIN_REPORTS: '/api/admin/reports',
    ADMIN_REPORTS_EXPORT: '/api/admin/reports/:reportId/export',
    ADMIN_CONTENT: '/api/admin/content',
    ADMIN_CONTENT_PUBLISH: '/api/admin/content/:contentId/publish',
    ADMIN_MAINTENANCE: '/api/admin/maintenance',
    ADMIN_MAINTENANCE_START: '/api/admin/maintenance/:maintenanceId/start',
    ADMIN_MAINTENANCE_COMPLETE: '/api/admin/maintenance/:maintenanceId/complete',
    
    // Terms & Conditions endpoints
    TERMS_ACTIVE: '/api/terms/active',
    TERMS_ADMIN_ALL: '/api/terms/admin/all',
    TERMS_ADMIN_USER_TYPE: '/api/terms/admin/user-type/:userType',
    TERMS_ADMIN_BY_ID: '/api/terms/admin/:id',
    TERMS_ADMIN_CREATE: '/api/terms/admin',
    TERMS_ADMIN_UPDATE: '/api/terms/admin/:id',
    TERMS_ADMIN_DELETE: '/api/terms/admin/:id',
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to replace URL parameters and append query params
export const getApiUrlWithParams = (endpoint, params) => {
  let url = endpoint;
  // Replace any :param in the path
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key]);
  });
  // Append query params
  const queryKeys = Object.keys(params).filter(key => !url.includes(params[key]));
  if (queryKeys.length > 0) {
    const queryString = queryKeys
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    url += (url.includes('?') ? '&' : '?') + queryString;
  }
  return `${API_CONFIG.BASE_URL}${url}`;
};

// Helper function to make API calls with improved error handling
export const apiCall = async (endpoint, options = {}) => {
  try {
    const token = await getAuthToken();
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      timeout: 10000, // 10 second timeout
    };

    console.log('Making API call to:', endpoint);
    console.log('Options:', { ...defaultOptions, ...options, body: options.body ? '***' : undefined });

    const response = await fetch(endpoint, {
      ...defaultOptions,
      ...options
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const textData = await response.text();
      console.log('Non-JSON response:', textData);
      data = { message: textData };
    }

    console.log('Response data:', data);

    if (!response.ok) {
      return {
        success: false,
        message: data.message || data.error || `API call failed: ${response.status}`,
        status: response.status,
        data: data
      };
    }

    return {
      success: true,
      ...data
    };
  } catch (error) {
    console.error('API call error:', error);
    
    // Handle specific error types
    if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
      return {
        success: false,
        message: 'Network error. Please check your internet connection and try again.',
        error: error.message
      };
    }
    
    if (error.name === 'AbortError') {
      return {
        success: false,
        message: 'Request timed out. Please try again.',
        error: error.message
      };
    }
    
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
      error: error.message
    };
  }
};

// Helper function to get auth token from AsyncStorage
export const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Helper function to check if server is reachable
export const checkServerHealth = async () => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
      method: 'GET',
      timeout: 5000
    });
    return response.ok;
  } catch (error) {
    console.error('Server health check failed:', error);
    return false;
  }
};

// Export the base URL for direct use
export const API_BASE_URL = API_CONFIG.BASE_URL;

// Default export
export default API_CONFIG; 