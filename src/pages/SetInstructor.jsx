import React, { useEffect } from 'react';
import { WWClient } from '@/api/WWClient'
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LoadingPage } from '@/components/common/LoadingSpinner';

export default function SetInstructor() {
  const navigate = useNavigate();

  useEffect(() => {
    const updateUserRole = async () => {
      try {
        await WWClient.auth.updateMe({ role: 'instructor' });
        navigate(createPageUrl('InstructorDashboard'));
      } catch (error) {
        console.error('Error updating user role:', error);
        navigate(createPageUrl('Home'));
      }
    };

    updateUserRole();
  }, [navigate]);

  return <LoadingPage />;
}