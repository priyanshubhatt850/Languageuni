import axios from 'axios';

function createClient(config) {
  const {
    serverUrl = import.meta.env.VITE_API_URL,
    appId,
    env = 'dev',
    requiresAuth = false,
  } = config;

  const api = axios.create({
    baseURL: serverUrl
  });

  /* ================= TOKEN ================= */

  const setToken = (token) => {
    if (token) {
      localStorage.setItem('auth-token', token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('refresh-token');
      localStorage.removeItem('authToken');
      delete api.defaults.headers.common.Authorization;
    }
  };

  const existingToken = localStorage.getItem('auth-token');
  if (existingToken) {
    setToken(existingToken);
  }

  /* ================= ENTITIES ================= */

  const entities = {};
  const entityNames = [
    "Badge",
    "ChatCOnversation",
    "ChatMessage",
    "Course",
    "CourseLevel",
    "Enrollment",
    "Exercise",
    "ExerciseAttempt",
    "Flashcard",
    "InstructorProfile",
    "InstructorRating",
    "InstructorWallet",
    "InstructorWalletTransaction",
    "Language",
    "Lesson",
    "Message",
    "Notification",
    "OTPVerification",
    "Quiz",
    "QuizAttempt",
    "Review",
    "StudentCourseLevelProgress",
    "StudentMaterialBookmark",
    "StudyMaterial",
    "TeachingSession",
    "User",
    "UserBadge",
    "UserPoints",
    "Wallet"
  ]
  entityNames.forEach((name) => {
    entities[name] = {
      list: (params = {}) =>
        api.get(`/${name}`, { params }).then(r => r.data),

      get: (id) =>
        api.get(`/${name}/${id}`).then(r => r.data),

      create: (payload) =>
        api.post(`/${name}`, payload).then(r => r.data),

      update: (id, payload) =>
        api.put(`/${name}/${id}`, payload).then(r => r.data),

      delete: (id) =>
        api.delete(`/${name}/${id}`).then(r => r.data),

      filter: (params = {}) =>
        api.post(`/${name}/filter`, params).then(r => r.data),
      getwithparams: (id, params) => api.get(`/${name}/${id}`, { params }).then(r => r.data),
      postwithparams: (id, params) => api.post(`/${name}/${id}`, { ...params }).then(r => r.data),

    };
  });

  /* ================= AUTH ================= */

  const auth = {
    me: async () => {
      const userString = localStorage.getItem('user');
      return userString ? JSON.parse(userString) : null;
    },

    getme: async () => {
      try {
        const res = await api.get('/auth/me');

        if (res.data?.data) {
          const existingUser = JSON.parse(localStorage.getItem('user')) || {};
          const updatedUser = {
            ...existingUser,
            ...res.data.data
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        return {
          success: true,
          data: res.data.data,
          message: res.data.message || 'Profile fetched successfully'
        };
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Fetch failed'
        };
      }
    },

    login: async ({ email, password, loginby = 'password' }) => {
      try {
        const res = await api.post('/auth/login', { email, password, loginby });
        const data = res.data;

        if (data?.token) {
          setToken(data.token);
        }

        if (data?.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }

        return {
          success: true,
          user: data.user || data.data,
          token: data.token,
          message: data.message || 'Login successful'
        };
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Invalid credentials'
        };
      }
    },

    register: async ({ email, name, password, confirmPassword, role }) => {
      if (password !== confirmPassword) {
        return { success: false, message: 'Passwords do not match' };
      }

      try {
        const res = await api.post('/auth/register', {
          email,
          name,
          password,
          confirm_password: confirmPassword,
          role
        });

        const data = res.data;

        if (data?.token) {
          setToken(data.token);
        }

        if (data?.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }

        return {
          success: true,
          user: data.user,
          message: data.message || 'Registration successful'
        };
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Registration failed'
        };
      }
    },
    addAdmin: async ({ email, full_name, password, confirmPassword, role }) => {
      if (password !== confirmPassword) {
        return { success: false, message: 'Passwords do not match' };
      }

      try {
        const res = await api.post('/auth/register', {
          email,
          full_name,
          password,
          confirm_password: confirmPassword,
          role
        });

        const data = res.data;

        // if (data?.token) {
        //   setToken(data.token);
        // }

        // if (data?.user) {
        //   localStorage.setItem('user', JSON.stringify(data.user));
        // }

        return {
          success: true,
          user: data.user,
          message: data.message || 'Registration successful'
        };
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Registration failed'
        };
      }
    },
    updateMe: async (payload) => {
      try {
        const res = await api.put('/auth/me', payload);

        if (res.data) {
          const existingUser = JSON.parse(localStorage.getItem('user')) || {};
          localStorage.setItem(
            'user',
            JSON.stringify({ ...existingUser, ...res.data })
          );
        }

        return {
          success: true,
          data: res.data,
          message: res.data.message || 'Profile updated'
        };
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Update failed'
        };
      }
    },

    logout: async () => {
      localStorage.removeItem('user');
      setToken(null);
      window.location.href = '/';
    },

    isAuthenticated: () => {
      return !!localStorage.getItem('auth-token');
    },

    setToken
  };

  /* ================= FUNCTIONS ================= */

  const functions = {
    invoke: async (name, payload = {}, options = {}) => {
      const res = await api.post(`/functions/${name}`, payload, options);

      if ((name === 'verifyOTP' || name === 'verifyGoogleToken') && res.data?.token) {
        setToken(res.data.token);
        if (res.data?.user) {
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
      }

      return res.data;
    },

  };

  /* ================= INTEGRATIONS ================= */

  const integrations = {
    Core: {
      UploadFile: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const res = await api.post('/integration/upload-file', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        return res.data;
      },

      SendEmail: async ({ to, subject, body }) => {
        const res = await api.post('/integration/send-email', {
          to,
          subject,
          body
        });
        return res.data;
      },

      InvokeLLM: async ({ prompt, response_json_schema }) => {
        const res = await api.post('/integration/invokeLLM', {
          prompt,
          response_json_schema
        });
        return res.data;
      },

      InvokeLLMChat: async ({ prompt }) => {
        const res = await api.post('/integration/invokeLLMChat', { prompt });
        return res.data;
      }
    }
  };

  return {
    entities,
    auth,
    functions,
    integrations,
    setToken,
    getConfig: () => ({ serverUrl, appId, env, requiresAuth })
  };
}

export { createClient };