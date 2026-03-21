/**
 * Custom React Hooks for Data Fetching
 * Encapsulates API calls and data management with React Query
 * 
 * Usage:
 * const { data, isLoading } = useAdminDashboard();
 * const { data, isLoading } = useStudents({ page: 1, limit: 10 });
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/api/apiService';
import { toast } from 'sonner';

/**
 * Admin Dashboard Hook
 * Fetches complete dashboard data with aggregates
 */
export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => apiService.dashboard.getAdminDashboard(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000  // 10 minutes
  });
};

/**
 * Students List Hook
 * Fetches students with pagination and search
 * @param {Object} options - { page, limit, search }
 */
export const useStudents = (options = {}) => {
  return useQuery({
    queryKey: ['students', options],
    queryFn: () => apiService.students.getList(options),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true // Keep previous data while fetching new page
  });
};

/**
 * Student Detail Hook
 * @param {string} studentId
 */
export const useStudent = (studentId) => {
  return useQuery({
    queryKey: ['student', studentId],
    queryFn: () => apiService.students.getById(studentId),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000
  });
};

/**
 * Student Progress Hook
 * @param {string} studentId
 */
export const useStudentProgress = (studentId) => {
  return useQuery({
    queryKey: ['student-progress', studentId],
    queryFn: () => apiService.students.getProgress(studentId),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000
  });
};

/**
 * Update Student Hook
 */
export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, data }) =>
      apiService.students.update(studentId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update student');
    }
  });
};

/**
 * Instructors List Hook
 * @param {Object} options - { page, limit, status }
 */
export const useInstructors = (options = {}) => {
  return useQuery({
    queryKey: ['instructors', options],
    queryFn: () => apiService.instructors.getList(options),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true
  });
};

/**
 * Instructor Detail Hook
 */
export const useInstructor = (instructorId) => {
  return useQuery({
    queryKey: ['instructor', instructorId],
    queryFn: () => apiService.instructors.getById(instructorId),
    enabled: !!instructorId,
    staleTime: 5 * 60 * 1000
  });
};

/**
 * Instructor Dashboard Hook
 */
export const useInstructorDashboard = (instructorId) => {
  return useQuery({
    queryKey: ['instructor-dashboard', instructorId],
    queryFn: () => apiService.instructors.getDashboard(instructorId),
    enabled: !!instructorId,
    staleTime: 5 * 60 * 1000
  });
};

/**
 * Update Instructor Hook
 */
export const useUpdateInstructor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ instructorId, data }) =>
      apiService.instructors.updateProfile(instructorId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['instructor', variables.instructorId] });
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      toast.success('Instructor updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update instructor');
    }
  });
};

/**
 * Approve Instructor Hook
 */
export const useApproveInstructor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ instructorId, data }) =>
      apiService.instructors.approve(instructorId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      toast.success('Instructor approved');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to approve instructor');
    }
  });
};

/**
 * Courses List Hook
 */
export const useCourses = (options = {}) => {
  return useQuery({
    queryKey: ['courses', options],
    queryFn: () => apiService.courses.getList(options),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true
  });
};

/**
 * Course Detail Hook
 */
export const useCourseDetail = (courseId) => {
  return useQuery({
    queryKey: ['course-detail', courseId],
    queryFn: () => apiService.courses.getDetail(courseId),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000
  });
};

/**
 * Create Course Hook
 */
export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => apiService.courses.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create course');
    }
  });
};

/**
 * Update Course Hook
 */
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, data }) =>
      apiService.courses.update(courseId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course-detail', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update course');
    }
  });
};

/**
 * Delete Course Hook
 */
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId) => apiService.courses.delete(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete course');
    }
  });
};

/**
 * Languages List Hook
 */
export const useLanguages = () => {
  return useQuery({
    queryKey: ['languages'],
    queryFn: () => apiService.languages.getList(),
    staleTime: 10 * 60 * 1000 // Cache longer as languages rarely change
  });
};

/**
 * Language Overview Hook
 */
export const useLanguageOverview = (languageId) => {
  return useQuery({
    queryKey: ['language-overview', languageId],
    queryFn: () => apiService.languages.getOverview(languageId),
    enabled: !!languageId,
    staleTime: 5 * 60 * 1000
  });
};

/**
 * Create Language Hook
 */
export const useCreateLanguage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => apiService.languages.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      toast.success('Language created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create language');
    }
  });
};

/**
 * Update Language Hook
 */
export const useUpdateLanguage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ languageId, data }) =>
      apiService.languages.update(languageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      toast.success('Language updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update language');
    }
  });
};

/**
 * Delete Language Hook
 */
export const useDeleteLanguage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (languageId) => apiService.languages.delete(languageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      toast.success('Language deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete language');
    }
  });
};

/**
 * Course Levels Hook
 */
export const useCourseLevels = (languageId) => {
  return useQuery({
    queryKey: ['course-levels', languageId],
    queryFn: () => apiService.levels.getByLanguage(languageId),
    enabled: !!languageId,
    staleTime: 5 * 60 * 1000
  });
};

/**
 * Level Detail Hook
 */
export const useLevelDetail = (levelId) => {
  return useQuery({
    queryKey: ['level-detail', levelId],
    queryFn: () => apiService.levels.getById(levelId),
    enabled: !!levelId,
    staleTime: 5 * 60 * 1000
  });
};

/**
 * Create Level Hook
 */
export const useCreateLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => apiService.levels.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['course-levels'] });
      toast.success('Level created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create level');
    }
  });
};

/**
 * Update Level Hook
 */
export const useUpdateLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ levelId, data }) =>
      apiService.levels.update(levelId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['level-detail', variables.levelId] });
      queryClient.invalidateQueries({ queryKey: ['course-levels'] });
      toast.success('Level updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update level');
    }
  });
};

/**
 * Delete Level Hook
 */
export const useDeleteLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (levelId) => apiService.levels.delete(levelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-levels'] });
      toast.success('Level deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete level');
    }
  });
};

/**
 * Study Materials Hook
 */
export const useStudyMaterials = (levelId) => {
  return useQuery({
    queryKey: ['study-materials', levelId],
    queryFn: () => apiService.materials.getByLevel(levelId),
    enabled: !!levelId,
    staleTime: 5 * 60 * 1000
  });
};

/**
 * Create Study Material Hook
 */
export const useCreateMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => apiService.materials.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-materials'] });
      toast.success('Material created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create material');
    }
  });
};

/**
 * Update Study Material Hook
 */
export const useUpdateMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ materialId, data }) =>
      apiService.materials.update(materialId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-materials'] });
      toast.success('Material updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update material');
    }
  });
};

/**
 * Delete Study Material Hook
 */
export const useDeleteMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (materialId) => apiService.materials.delete(materialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-materials'] });
      toast.success('Material deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete material');
    }
  });
};

/**
 * Notifications Hook
 */
export const useNotifications = (userId, limit = 10) => {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => apiService.notifications.getList(userId, limit),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000 // 2 minutes
  });
};

/**
 * Mark Notification as Read Hook
 */
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId) =>
      apiService.notifications.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
};

/**
 * Generic hook factory for creating custom hooks
 * @param {string} queryKey - Query key for caching
 * @param {Function} queryFn - Function to fetch data
 * @param {Object} options - React Query options
 */
export const useCustomData = (queryKey, queryFn, options = {}) => {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000,
    ...options
  });
};
