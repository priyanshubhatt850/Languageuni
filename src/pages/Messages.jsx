import React, { useState, useEffect, useRef } from 'react';
import { WWClient } from '@/api/WWClient'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Search,
  Plus,
  ArrowLeft,
  AlertCircle,
  HelpCircle,
  Paperclip,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

export default function Messages() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatSubject, setNewChatSubject] = useState('');
  const [newChatType, setNewChatType] = useState('query');
  const [newChatCourse, setNewChatCourse] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await WWClient.auth.me();
      setUser(userData);
      setLoading(false);
    };
    loadUser();
  }, []);

  const { data: conversations = [] } = useQuery({
    queryKey: ['chat-conversations', user?._id],
    queryFn: async () => {
      if (user?.role === 'admin') {
        return await WWClient.entities.ChatConversation.list('-last_message_at', 100);
      }
      return await WWClient.entities.ChatConversation.filter({ student_id: user?._id }, '-last_message_at');
    },
    enabled: !!(user?._id || user?.id),
    initialData: []
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['student-enrollments', user?._id],
    queryFn: () => WWClient.entities.Enrollment.filter({ user_id: user?._id || user?.id, status: 'active' }),
    enabled: !!(user?._id || user?.id) && user?.role !== 'admin',
    initialData: []
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users-chat'],
    queryFn: () => WWClient.entities.User.list(),
    initialData: []
  });

  const { data: courseLevels = [] } = useQuery({
    queryKey: ['all-course-levels-chat'],
    queryFn: () => WWClient.entities.CourseLevel.list(),
    initialData: []
  });

  const userMap = React.useMemo(() => {
    const map = {};
    allUsers.forEach(u => {
      const idStr = u._id || u.id;
      if (idStr) map[idStr.toString()] = u;
    });
    return map;
  }, [allUsers]);

  const courseMap = React.useMemo(() => {
    const map = {};
    courseLevels.forEach(c => {
      const idStr = c._id || c.id;
      if (idStr) map[idStr.toString()] = c;
    });
    return map;
  }, [courseLevels]);

  const { data: messages = [] } = useQuery({
    queryKey: ['chat-messages', selectedConversation?._id],
    queryFn: async () => {
      const msgs = await WWClient.entities.ChatMessage.filter(
        { conversation_id: selectedConversation._id || selectedConversation.id },
        'created_date'
      );
      
      // Mark messages as read
      const unreadMessages = msgs.filter(
        m => !m.is_read && m.sender_id !== user?._id
      );
      if (unreadMessages.length > 0) {
        await Promise.all(
          unreadMessages.map(m => WWClient.entities.ChatMessage.update(m._id || m.id, { is_read: true }))
        );
        queryClient.invalidateQueries(['chat-conversations']);
      }
      
      return msgs;
    },
    enabled: !!selectedConversation?._id,
    initialData: []
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['my-notifications', user?._id],
    queryFn: () => WWClient.entities.Notification.filter({ user_id: user?._id }, '-created_date', 10),
    enabled: !!(user?._id || user?.id),
    initialData: []
  });

  const filteredConversations = conversations.filter(conv =>
    conv.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const createConversationMutation = useMutation({
    mutationFn: async (data) => {
      return await WWClient.entities.ChatConversation.create({
        student_id: user._id,
        course_id: data.course_id,
        subject: data.subject,
        type: data.type,
        status: 'open',
        last_message_at: new Date().toISOString(),
        unread_admin_count: 1
      });
    },
    onSuccess: (conversation) => {
      queryClient.invalidateQueries(['chat-conversations']);
      setShowNewChat(false);
      setSelectedConversation(conversation);
      setNewChatSubject('');
      setNewChatCourse('');
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      if (!selectedConversation) return;
      
      const message = await WWClient.entities.ChatMessage.create({
        conversation_id: selectedConversation._id,
        sender_id: user._id,
        message: content
      });
      
      // Update conversation
      const isAdmin = user.role === 'admin';
      await WWClient.entities.ChatConversation.update(selectedConversation._id, {
        last_message_at: new Date().toISOString(),
        unread_admin_count: isAdmin ? selectedConversation.unread_admin_count : selectedConversation.unread_admin_count + 1,
        unread_student_count: isAdmin ? selectedConversation.unread_student_count + 1 : 0
      });
      
      return message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['chat-messages']);
      queryClient.invalidateQueries(['chat-conversations']);
      setNewMessage('');
    }
  });

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };

  const handleCreateConversation = () => {
    if (newChatSubject.trim() && newChatCourse) {
      createConversationMutation.mutate({
        subject: newChatSubject.trim(),
        course_id: newChatCourse,
        type: newChatType
      });
    }
  };

  const handleLogout = () => {
    WWClient.auth.logout();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) return <LoadingPage />;

  const userRole = user?.role || 'student';

  const isAdmin = user?.role === 'admin';

  const typeIcons = {
    query: HelpCircle,
    report: AlertCircle,
    support: MessageSquare,
    general: MessageSquare
  };

  const typeColors = {
    query: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    report: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    support: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    general: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  };

  const statusIcons = {
    open: Clock,
    closed: CheckCircle2,
    resolved: CheckCircle2
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole={userRole} currentPage="Messages" onLogout={handleLogout} />
      
      <div className="md:pl-[260px]">
        <Header user={user} notifications={notifications} />
        
        <main className="p-4 md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {isAdmin ? 'Student Support' : 'Chat with Admin'}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {isAdmin ? 'Manage student conversations' : 'Get help with your courses'}
              </p>
            </div>
            {!isAdmin && (
              <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
                <DialogTrigger asChild>
                  <Button className="bg-violet-600 hover:bg-violet-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Conversation
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Start New Conversation</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Type</label>
                      <Select value={newChatType} onValueChange={setNewChatType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="query">Question</SelectItem>
                          <SelectItem value="report">Report Instructor</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Course</label>
                      <Select value={newChatCourse} onValueChange={setNewChatCourse}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courseLevels.map(course => (
                            <SelectItem key={course._id || course.id} value={course._id || course.id}>
                              {course.level_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Subject</label>
                      <Input
                        placeholder="Brief description..."
                        value={newChatSubject}
                        onChange={(e) => setNewChatSubject(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={handleCreateConversation}
                      disabled={!newChatSubject.trim() || !newChatCourse || createConversationMutation.isPending}
                      className="w-full bg-violet-600 hover:bg-violet-700"
                    >
                      Start Conversation
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <Card className="border-0 shadow-sm bg-white dark:bg-slate-800 h-[calc(100vh-280px)]">
            <div className="flex h-full">
              {/* Conversations List */}
              <div className={cn(
                "w-full md:w-96 border-r border-slate-200 dark:border-slate-700 flex flex-col",
                selectedConversation && "hidden md:flex"
              )}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <ScrollArea className="flex-1">
                  {filteredConversations.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="font-medium mb-1">No conversations yet</p>
                      {!isAdmin && (
                        <p className="text-sm">Start a new conversation with admin</p>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                      {filteredConversations.map((conv) => {
                        const TypeIcon = typeIcons[conv.type];
                        const StatusIcon = statusIcons[conv.status];
                        const unreadCount = isAdmin ? conv.unread_admin_count : conv.unread_student_count;
                        
                        const student = userMap[conv.student_id];
                        const course = courseMap[conv.course_id];
                        const displayName = isAdmin ? (student?.full_name || 'Student') : conv.subject;
                        const subtitle = isAdmin ? conv.subject : (course?.level_name ? `Course: ${course.level_name}` : 'General support');
                        const initials = student?.full_name ? student.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'S';
                        const avatarUrl = student?.avatar_url || student?.profile_image_url;

                        return (
                          <button
                            key={conv._id || conv.id}
                            onClick={() => setSelectedConversation(conv)}
                            className={cn(
                              "w-full p-4 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left border-b border-slate-100 dark:border-slate-800",
                              (selectedConversation?._id === conv._id || selectedConversation?.id === conv.id) && "bg-violet-50/70 dark:bg-violet-950/20"
                            )}
                          >
                            <Avatar className="w-10 h-10 rounded-full border border-slate-200/50 dark:border-slate-700/50 flex-shrink-0">
                              {avatarUrl ? (
                                <AvatarImage src={avatarUrl} alt={student?.full_name} className="object-cover" />
                              ) : null}
                              <AvatarFallback className="bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-xs font-bold">
                                {isAdmin ? initials : <TypeIcon className="w-4 h-4" />}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <p className="font-semibold text-sm text-slate-900 dark:text-white truncate pr-2">
                                  {displayName}
                                </p>
                                {unreadCount > 0 && (
                                  <Badge className="bg-violet-600 hover:bg-violet-600 text-white shrink-0 text-[10px] px-1.5 py-0.5 rounded-full">
                                    {unreadCount}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-2">
                                {subtitle}
                              </p>
                              <div className="flex items-center gap-1.5">
                                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 rounded-md shrink-0 font-medium", typeColors[conv.type])}>
                                  {conv.type}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-md shrink-0 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 font-medium">
                                  <StatusIcon className="w-2.5 h-2.5 mr-1" />
                                  {conv.status}
                                </Badge>
                                <span className="text-[10px] text-slate-400 ml-auto shrink-0 font-medium">
                                  {conv.last_message_at && format(new Date(conv.last_message_at), 'MMM d, h:mm a')}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Message View */}
              <div className={cn(
                "flex-1 flex flex-col",
                !selectedConversation && "hidden md:flex"
              )}>
                {selectedConversation ? (() => {
                  const activeStudent = userMap[selectedConversation.student_id];
                  const activeCourse = courseMap[selectedConversation.course_id];
                  const headerTitle = isAdmin ? (activeStudent?.full_name || 'Student') : selectedConversation.subject;
                  const headerSubtitle = isAdmin ? selectedConversation.subject : (activeCourse?.level_name ? `Course: ${activeCourse.level_name}` : 'General support');
                  const headerAvatarUrl = activeStudent?.avatar_url || activeStudent?.profile_image_url;
                  const headerInitials = activeStudent?.full_name ? activeStudent.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'S';

                  return (
                    <>
                      <div className="p-4 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedConversation(null)}
                            className="md:hidden"
                          >
                            <ArrowLeft className="w-5 h-5" />
                          </Button>
                          
                          <Avatar className="w-10 h-10 rounded-full border border-slate-200/50 dark:border-slate-700/50 flex-shrink-0">
                            {headerAvatarUrl ? (
                              <AvatarImage src={headerAvatarUrl} alt={activeStudent?.full_name} className="object-cover" />
                            ) : null}
                            <AvatarFallback className="bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-xs font-bold">
                              {isAdmin ? headerInitials : <MessageSquare className="w-4 h-4" />}
                            </AvatarFallback>
                          </Avatar>

                          <div>
                            <p className="font-semibold text-sm text-slate-900 dark:text-white">
                              {headerTitle}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {headerSubtitle}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="hidden sm:flex items-center gap-1.5">
                            <Badge variant="outline" className={cn("text-[10px] font-medium px-2 py-0.5 rounded-md", typeColors[selectedConversation.type])}>
                              {selectedConversation.type}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] font-medium px-2 py-0.5 rounded-md text-slate-500 border-slate-200 dark:border-slate-700">
                              {selectedConversation.status}
                            </Badge>
                          </div>
                          
                          {isAdmin && (
                            <Select
                              value={selectedConversation.status}
                              onValueChange={async (status) => {
                                await WWClient.entities.ChatConversation.update(selectedConversation._id || selectedConversation.id, { status });
                                queryClient.invalidateQueries(['chat-conversations']);
                              }}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>

                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        <AnimatePresence>
                          {messages.map((msg, index) => {
                            const isMine = msg.sender_id === user?._id;
                            return (
                              <motion.div
                                key={msg._id || msg.id || index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                  "flex items-end gap-2",
                                  isMine ? "justify-end" : "justify-start"
                                )}
                              >
                                {!isMine && (() => {
                                  const sender = userMap[msg.sender_id];
                                  const senderInitials = sender?.full_name ? sender.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : (isAdmin ? 'S' : 'AD');
                                  const senderAvatar = sender?.avatar_url || sender?.profile_image_url;
                                  return (
                                    <Avatar className="w-8 h-8 rounded-full border border-slate-200/50 dark:border-slate-700/50">
                                      {senderAvatar ? <AvatarImage src={senderAvatar} alt={sender?.full_name} className="object-cover" /> : null}
                                      <AvatarFallback className="bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-[10px] font-bold">
                                        {senderInitials}
                                      </AvatarFallback>
                                    </Avatar>
                                  );
                                })()}
                                <div className={cn(
                                  "max-w-[70%] rounded-2xl px-4 py-3",
                                  isMine 
                                    ? "bg-violet-600 text-white rounded-br-sm shadow-sm"
                                    : "bg-slate-100 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-bl-sm border border-slate-200/30 dark:border-slate-700/30"
                                )}>
                                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.message}</p>
                                  <p className={cn(
                                    "text-[10px] mt-1.5 font-medium",
                                    isMine ? "text-violet-200" : "text-slate-400 dark:text-slate-500"
                                  )}>
                                    {format(new Date(msg.created_date), 'MMM d, h:mm a')}
                                  </p>
                                </div>
                                {isMine && (() => {
                                  const myInitials = user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
                                  const myAvatar = user?.avatar_url || user?.profile_image_url;
                                  return (
                                    <Avatar className="w-8 h-8 rounded-full border border-slate-200/50 dark:border-slate-700/50">
                                      {myAvatar ? <AvatarImage src={myAvatar} alt={user?.full_name} className="object-cover" /> : null}
                                      <AvatarFallback className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                                        {myInitials}
                                      </AvatarFallback>
                                    </Avatar>
                                  );
                                })()}
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          className="min-h-[60px] max-h-[120px] resize-none"
                        />
                        <Button 
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || sendMessageMutation.isPending}
                          className="bg-violet-600 hover:bg-violet-700 self-end"
                          size="icon"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                );
              })() : (
                  <div className="flex-1 flex items-center justify-center">
                    <EmptyState
                      icon={MessageSquare}
                      title="Select a conversation"
                      description="Choose a conversation from the list to start chatting"
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}