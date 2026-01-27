import React, { useState } from 'react';
import { WWClient } from '@/api/WWClient'
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BecomeAdmin() {
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await WWClient.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleBecomeAdmin = async () => {
    setLoading(true);
    try {
      const user = await WWClient.auth.me();
      
      // Update user role to admin using service role
      await WWClient.entities.User.update(user.id, { role: 'admin' });
      
      toast.success('Successfully updated to admin role!');
      
      // Reload to apply changes
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error) {
      toast.error('Failed to update role: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-violet-600 dark:text-violet-400" />
          </div>
          <CardTitle>Admin Access</CardTitle>
          <CardDescription>
            Update your account to admin role
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentUser && (
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <p className="text-sm text-slate-600 dark:text-slate-400">Current User</p>
              <p className="font-medium">{currentUser.email}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Role: <span className="font-semibold">{currentUser.role}</span>
              </p>
            </div>
          )}
          
          <Button
            onClick={handleBecomeAdmin}
            disabled={loading || currentUser?.role === 'admin'}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : currentUser?.role === 'admin' ? (
              'Already Admin'
            ) : (
              'Become Admin'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}