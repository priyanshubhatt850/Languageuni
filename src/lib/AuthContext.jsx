import React, { createContext, useState, useContext, useEffect } from 'react';
import { WWClient } from '@/api/WWClient'
import { appParams } from '@/lib/app-params';
import { createAxiosClient } from '@base44/sdk/dist/utils/axios-client';
// import { useNavigate } from 'react-router-dom';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }
  // const navigate = useNavigate()
  useEffect(() => {
    checkUserAuth();
  }, []);

  // const checkAppState = async () => {
  //   try {
  //     setIsLoadingPublicSettings(true);
  //     setAuthError(null);

  //     // First, check app public settings (with token if available)
  //     // This will tell us if auth is required, user not registered, etc.
  //     const appClient = createAxiosClient({
  //       baseURL: `/api/apps/public`,
  //       headers: {
  //         'X-App-Id': appParams.appId
  //       },
  //       token: appParams.token, // Include token if available
  //       interceptResponses: true
  //     });

  //     try {
  //       const publicSettings = await appClient.get(`/prod/public-settings/by-id/${appParams.appId}`);
  //       setAppPublicSettings(publicSettings);

  //       // If we got the app public settings successfully, check if user is authenticated
  //       if (appParams.token) {
  //         await checkUserAuth();
  //       } else {
  //         setIsLoadingAuth(false);
  //         setIsAuthenticated(false);
  //       }
  //       setIsLoadingPublicSettings(false);
  //     } catch (appError) {
  //       console.error('App state check failed:', appError);

  //       // Handle app-level errors
  //       if (appError.status === 403 && appError.data?.extra_data?.reason) {
  //         const reason = appError.data.extra_data.reason;
  //         if (reason === 'auth_required') {
  //           setAuthError({
  //             type: 'auth_required',
  //             message: 'Authentication required'
  //           });
  //         } else if (reason === 'user_not_registered') {
  //           setAuthError({
  //             type: 'user_not_registered',
  //             message: 'User not registered for this app'
  //           });
  //         } else {
  //           setAuthError({
  //             type: reason,
  //             message: appError.message
  //           });
  //         }
  //       } else {
  //         setAuthError({
  //           type: 'unknown',
  //           message: appError.message || 'Failed to load app'
  //         });
  //       }
  //       setIsLoadingPublicSettings(false);
  //       setIsLoadingAuth(false);
  //     }
  //   } catch (error) {
  //     console.error('Unexpected error:', error);
  //     setAuthError({
  //       type: 'unknown',
  //       message: error.message || 'An unexpected error occurred'
  //     });
  //     setIsLoadingPublicSettings(false);
  //     setIsLoadingAuth(false);
  //   }
  // };

  const checkUserAuth = async () => {
    try {
      // Now check if the user is authenticated
      setIsLoadingAuth(true);
      const currentUser = await WWClient.auth.me();
      console.log(currentUser, "this is current User >>>>>>>>")
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        // setIsLoadingAuth(false);
      } else {
        // setIsLoadingAuth(false);
        setIsAuthenticated(false);


      }
    } catch (error) {
      console.error('User auth check failed:', error);
      // setIsLoadingAuth(false);
      setIsAuthenticated(false);

      // If user auth fails, it might be an expired token
      if (error.status === 401 || error.status === 403) {
        setAuthError({
          type: 'auth_required',
          message: 'Authentication required'
        });
      }
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);

    if (shouldRedirect) {
      // Use the SDK's logout method which handles token cleanup and redirect
      // WWClient.auth.logout(window.location.href);
      window.location.href = '/RoleSelection'
    } else {
      // Just remove the token without redirect
      WWClient.auth.logout();
    }
  };

  const navigateToLogin = () => {
    // Use the SDK's redirectToLogin method
    window.location.href = '/RoleSelection'
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkUserAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
