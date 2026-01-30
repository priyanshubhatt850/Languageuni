import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { WWClient } from '@/api/WWClient'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Edit, Trash2, BookOpen, Users, Star, Clock, TrendingUp, Zap, FileText } from 'lucide-react';

export default function AdminLanguageLevels() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const languageId = urlParams.get('languageId');

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await WWClient.auth.me();
      setUser(userData);
      setLoading(false);
    };
    loadUser();
  }, []);

  const { data: language } = useQuery({
    queryKey: ['language', languageId],
    queryFn: async () => {
      const langs = await WWClient.entities.Language.filter({ _id: languageId });
      return langs[0];
    },
    enabled: !!languageId
  });

  const { data: levels = [] } = useQuery({
    queryKey: ['language-levels', languageId],
    queryFn: () => WWClient.entities.CourseLevel.filter({ language_id: languageId }, 'display_order'),
    enabled: !!languageId,
    initialData: []
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['admin-notifications', user?.id],
    queryFn: () => WWClient.entities.Notification.filter({ user_id: user?._id }, '-created_date', 10),
    enabled: !!user?.id,
    initialData: []
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => WWClient.entities.CourseLevel.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['language-levels']);
      toast.success('Level deleted');
    }
  });

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  if (loading) return <LoadingPage />;

  if (!languageId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar userRole="admin" currentPage="AdminLanguages" onLogout={handleLogout} />
        <div className="md:pl-[260px]">
          <Header user={user} notifications={[]} />
          <main className="p-8 text-center">
            <p className="text-slate-600 dark:text-slate-300">No language selected. Please select a language first.</p>
            <Link to={createPageUrl('AdminLanguages')}>
              <Button className="mt-4">Go to Languages</Button>
            </Link>
          </main>
        </div>
      </div>
    );
  }

  if (!language) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="admin" currentPage="AdminCourseLevels" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} notifications={notifications} />
        
        <main className="p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl('AdminCourseLevels'))}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{language.flag}</span>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                    {language.name} Levels
                  </h1>
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Manage course levels and study materials
                </p>
              </div>
              <Link to={createPageUrl(`AdminCreateLevel?languageId=${languageId}`)}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Level
                </Button>
              </Link>
            </div>

            {levels.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <BookOpen className="w-16 h-16 text-slate-300 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    No levels yet
                  </h3>
                  <p className="text-slate-500 mb-6">
                    Create your first level for {language.name}
                  </p>
                  <Link to={createPageUrl(`AdminCreateLevel?languageId=${languageId}`)}>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Level
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {levels.map((level, index) => (
                  <motion.div
                    key={level.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-0 shadow-md hover:shadow-2xl hover:shadow-blue-500/20 dark:hover:shadow-blue-500/10 transition-all duration-300 group overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardContent className="p-6 relative">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge className={level.level_type === 'exam' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'} variant="outline">
                                {level.level_type === 'exam' ? 'Exam Prep' : 'Standard'}
                              </Badge>
                              <Badge variant={level.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                                {level.status}
                              </Badge>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {level.level_name}
                            </h3>
                          </div>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                          {level.description || 'No description available'}
                        </p>

                        <div className="grid grid-cols-3 gap-2 mb-5">
                          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors text-center">
                            <div className="flex justify-center mb-1">
                              <Users className="w-4 h-4 text-blue-600" />
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400">Enrolled</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">{level.enrolled_count || 0}</p>
                          </div>
                          {level.rating > 0 && (
                            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 group-hover:bg-amber-50 dark:group-hover:bg-amber-900/20 transition-colors text-center">
                              <div className="flex justify-center mb-1">
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400">Rating</p>
                              <p className="text-lg font-bold text-slate-900 dark:text-white">{level.rating.toFixed(1)}</p>
                            </div>
                          )}
                          {level.duration_hours > 0 && (
                            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 group-hover:bg-cyan-50 dark:group-hover:bg-cyan-900/20 transition-colors text-center">
                              <div className="flex justify-center mb-1">
                                <Clock className="w-4 h-4 text-cyan-600" />
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400">Hours</p>
                              <p className="text-lg font-bold text-slate-900 dark:text-white">{level.duration_hours}</p>
                            </div>
                          )}
                        </div>

                        <div className="mb-5 pt-4 border-t border-slate-200 dark:border-slate-700">
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Price</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">${level.price}</span>
                            {level.discount_price && (
                              <span className="text-sm text-slate-400 line-through">
                                ${level.discount_price}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                           <div className="grid grid-cols-2 gap-2">
                             <Link to={createPageUrl(`AdminFlashcards?levelId=${level.id}`)}>
                               <Button variant="outline" className="w-full h-10 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-xs">
                                 <Zap className="w-3 h-3 mr-1" />
                                 Flashcards
                               </Button>
                             </Link>
                             <Link to={createPageUrl(`AdminExercises?levelId=${level._id}`)}>
                               <Button variant="outline" className="w-full h-10 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-xs">
                                 <FileText className="w-3 h-3 mr-1" />
                                 Exercises
                               </Button>
                             </Link>
                           </div>
                           <Link to={createPageUrl(`AdminLevelMaterials?levelId=${level._id}`)}>
                             <Button variant="outline" className="w-full h-10 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                               <BookOpen className="w-4 h-4 mr-2" />
                               Materials
                             </Button>
                           </Link>
                           <div className="flex gap-2">
                             <Link to={createPageUrl(`AdminCreateLevel?id=${level._id}`)} className="flex-1">
                               <Button variant="outline" className="w-full h-10 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                 <Edit className="w-4 h-4 mr-2" />
                                 Edit
                               </Button>
                             </Link>
                             <Button 
                               variant="outline" 
                               size="icon"
                               className="h-10 w-10 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                               onClick={() => {
                                 if (confirm('Delete this level?')) {
                                   deleteMutation.mutate(level._id);
                                 }
                               }}
                             >
                               <Trash2 className="w-4 h-4" />
                             </Button>
                           </div>
                         </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}