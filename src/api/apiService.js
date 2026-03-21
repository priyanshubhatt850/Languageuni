/**
 * Professional API Service Layer
 * Centralized API calls with error handling and caching
 * 
 * Usage:
 * import { apiService } from '@/api/apiService';
 * 
 * const data = await apiService.dashboard.getAdminDashboard();
 * const students = await apiService.students.getList({ page: 1, limit: 10 });
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject({
      status: error.response?.status,
      message,
      data: error.response?.data
    });
  }
);

/**
 * Admin Dashboard APIs
 */
export const dashboardService = {
  /**
   * Get complete admin dashboard data
   * Aggregates: users, courses, enrollments, instructors, notifications
   */
  getAdminDashboard: () =>
    apiClient.get('/aggregate/admin-dashboard'),

  /**
   * Get admin overview statistics
   */
  getAdminStats: () =>
    apiClient.get('/admin-stats')
};

/**
 * Student Management APIs
 */
export const studentService = {
  /**
   * Get students list with pagination and search
   * @param {Object} options - { page, limit, search }
   */
  getList: (options = {}) =>
    apiClient.get('/aggregate/admin-students', { params: options }),

  /**
   * Get single student with enrollments and progress
   */
  getById: (studentId) =>
    apiClient.get(`/User/${studentId}`),

  /**
   * Get student progress data
   */
  getProgress: (studentId) =>
    apiClient.get(`/aggregate/student-progress/${studentId}`),

  /**
   * Update student profile
   */
  update: (studentId, data) =>
    apiClient.put(`/User/${studentId}`, data),

  /**
   * Get student enrollments
   */
  getEnrollments: (studentId) =>
    apiClient.post('/Enrollment/filter', { user_id: studentId })
};

/**
 * Instructor Management APIs
 */
export const instructorService = {
  /**
   * Get instructors list with pagination and filter
   * @param {Object} options - { page, limit, status }
   */
  getList: (options = {}) =>
    apiClient.get('/aggregate/admin-instructors', { params: options }),

  /**
   * Get single instructor profile with stats
   */
  getById: (instructorId) =>
    apiClient.get(`/InstructorProfile/${instructorId}`),

  /**
   * Get instructor dashboard data
   */
  getDashboard: (instructorId) =>
    apiClient.get(`/aggregate/instructor-dashboard/${instructorId}`),

  /**
   * Update instructor profile
   */
  updateProfile: (instructorId, data) =>
    apiClient.put(`/InstructorProfile/${instructorId}`, data),

  /**
   * Get instructor courses
   */
  getCourses: (instructorId) =>
    apiClient.post('/Course/filter', { instructor_id: instructorId }),

  /**
   * Approve instructor verification
   */
  approve: (instructorId, data) =>
    apiClient.put(`/InstructorProfile/${instructorId}`, { ...data, verification_status: 'approved' }),

  /**
   * Reject instructor verification
   */
  reject: (instructorId, data) =>
    apiClient.put(`/InstructorProfile/${instructorId}`, { ...data, verification_status: 'rejected' })
};

/**
 * Course Management APIs
 */
export const courseService = {
  /**
   * Get all courses with pagination
   */
  getList: (options = {}) =>
    apiClient.get('/Course', { params: options }),

  /**
   * Get course with all related data
   */
  getDetail: (courseId) =>
    apiClient.get(`/aggregate/course-detail/${courseId}`),

  /**
   * Create new course
   */
  create: (data) =>
    apiClient.post('/Course', data),

  /**
   * Update course
   */
  update: (courseId, data) =>
    apiClient.put(`/Course/${courseId}`, data),

  /**
   * Delete course
   */
  delete: (courseId) =>
    apiClient.delete(`/Course/${courseId}`),

  /**
   * Get course levels
   */
  getLevels: (courseId) =>
    apiClient.post('/CourseLevel/filter', { course_id: courseId })
};

/**
 * Language Management APIs
 */
export const languageService = {
  /**
   * Get all languages
   */
  getList: () =>
    apiClient.get('/Language'),

  /**
   * Get language with overview data
   */
  getOverview: (languageId) =>
    apiClient.get(`/aggregate/language-overview/${languageId}`),

  /**
   * Create language
   */
  create: (data) =>
    apiClient.post('/Language', data),

  /**
   * Update language
   */
  update: (languageId, data) =>
    apiClient.put(`/Language/${languageId}`, data),

  /**
   * Delete language
   */
  delete: (languageId) =>
    apiClient.delete(`/Language/${languageId}`)
};

/**
 * Enrollment APIs
 */
export const enrollmentService = {
  /**
   * Get enrollments with optional filters
   */
  getList: (filters = {}) =>
    apiClient.post('/Enrollment/filter', filters),

  /**
   * Get single enrollment
   */
  getById: (enrollmentId) =>
    apiClient.get(`/Enrollment/${enrollmentId}`),

  /**
   * Create enrollment
   */
  create: (data) =>
    apiClient.post('/Enrollment', data),

  /**
   * Update enrollment
   */
  update: (enrollmentId, data) =>
    apiClient.put(`/Enrollment/${enrollmentId}`, data),

  /**
   * Get enrollments by user
   */
  getByUser: (userId) =>
    apiClient.post('/Enrollment/filter', { user_id: userId }),

  /**
   * Get enrollments by course
   */
  getByCourse: (courseId) =>
    apiClient.post('/Enrollment/filter', { course_id: courseId })
};

/**
 * Course Level APIs
 */
export const levelService = {
  /**
   * Get all levels
   */
  getList: () =>
    apiClient.get('/CourseLevel'),

  /**
   * Get levels by language
   */
  getByLanguage: (languageId) =>
    apiClient.post('/CourseLevel/filter', { language_id: languageId }),

  /**
   * Get single level
   */
  getById: (levelId) =>
    apiClient.get(`/CourseLevel/${levelId}`),

  /**
   * Create level
   */
  create: (data) =>
    apiClient.post('/CourseLevel', data),

  /**
   * Update level
   */
  update: (levelId, data) =>
    apiClient.put(`/CourseLevel/${levelId}`, data),

  /**
   * Delete level
   */
  delete: (levelId) =>
    apiClient.delete(`/CourseLevel/${levelId}`)
};

/**
 * Study Material APIs
 */
export const materialService = {
  /**
   * Get materials with filters
   */
  getList: (filters = {}) =>
    apiClient.post('/StudyMaterial/filter', filters),

  /**
   * Get materials by level
   */
  getByLevel: (levelId) =>
    apiClient.post('/StudyMaterial/filter', { level_id: levelId }),

  /**
   * Get single material
   */
  getById: (materialId) =>
    apiClient.get(`/StudyMaterial/${materialId}`),

  /**
   * Create material
   */
  create: (data) =>
    apiClient.post('/StudyMaterial', data),

  /**
   * Update material
   */
  update: (materialId, data) =>
    apiClient.put(`/StudyMaterial/${materialId}`, data),

  /**
   * Delete material
   */
  delete: (materialId) =>
    apiClient.delete(`/StudyMaterial/${materialId}`)
};

/**
 * Notification APIs
 */
export const notificationService = {
  /**
   * Get user notifications
   */
  getList: (userId, limit = 10) =>
    apiClient.post('/Notification/filter', { user_id: userId }, { params: { limit } }),

  /**
   * Mark notification as read
   */
  markAsRead: (notificationId) =>
    apiClient.put(`/Notification/${notificationId}`, { read: true }),

  /**
   * Delete notification
   */
  delete: (notificationId) =>
    apiClient.delete(`/Notification/${notificationId}`)
};

/**
 * Analytics APIs
 */
export const analyticsService = {
  /**
   * Get user analytics
   */
  getUserAnalytics: (userId, period = 'month') =>
    apiClient.get(`/analytics/user/${userId}`, { params: { period } }),

  /**
   * Get course analytics
   */
  getCourseAnalytics: (courseId) =>
    apiClient.get(`/analytics/course/${courseId}`),

  /**
   * Get platform analytics
   */
  getPlatformAnalytics: (period = 'month') =>
    apiClient.get('/analytics/platform', { params: { period } })
};

/**
 * Utility function to create generic CRUD service
 * @param {string} entityName - Name of the entity (e.g., 'Course', 'User')
 * @returns {Object} CRUD operations for the entity
 */
export const createEntityService = (entityName) => ({
  list: (params = {}) =>
    apiClient.get(`/${entityName}`, { params }),

  getById: (id) =>
    apiClient.get(`/${entityName}/${id}`),

  create: (data) =>
    apiClient.post(`/${entityName}`, data),

  update: (id, data) =>
    apiClient.put(`/${entityName}/${id}`, data),

  delete: (id) =>
    apiClient.delete(`/${entityName}/${id}`),

  filter: (filters = {}) =>
    apiClient.post(`/${entityName}/filter`, filters)
});

// Export main API service object
export const apiService = {
  dashboard: dashboardService,
  students: studentService,
  instructors: instructorService,
  courses: courseService,
  languages: languageService,
  enrollments: enrollmentService,
  levels: levelService,
  materials: materialService,
  notifications: notificationService,
  analytics: analyticsService,
  createEntityService
};

export default apiService;
