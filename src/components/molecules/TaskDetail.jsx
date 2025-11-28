import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Badge from '@/components/atoms/Badge';
import { taskService } from '@/services/api/taskService';
import { cn } from '@/utils/cn';

const TaskDetail = ({ task, isOpen, onClose, onTaskUpdate }) => {
  const [activeTab, setActiveTab] = useState('notes');
  const [taskData, setTaskData] = useState(task);
  const [loading, setLoading] = useState(false);
  
  // Notes state
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  
  // Files state
  const [dragActive, setDragActive] = useState(false);
  
  // Discussions state
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (isOpen && task) {
      loadTaskDetails();
    }
  }, [isOpen, task]);

  const loadTaskDetails = async () => {
    try {
      setLoading(true);
      const updatedTask = await taskService.getById(task.Id);
      setTaskData(updatedTask);
    } catch (error) {
      toast.error('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      const updatedTask = await taskService.addNote(task.Id, newNote.trim());
      setTaskData(updatedTask);
      setNewNote('');
      toast.success('Note added successfully');
      onTaskUpdate?.(updatedTask);
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const handleEditNote = async (noteId, content) => {
    try {
      const updatedTask = await taskService.updateNote(task.Id, noteId, content);
      setTaskData(updatedTask);
      setEditingNote(null);
      toast.success('Note updated successfully');
      onTaskUpdate?.(updatedTask);
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      const updatedTask = await taskService.deleteNote(task.Id, noteId);
      setTaskData(updatedTask);
      toast.success('Note deleted successfully');
      onTaskUpdate?.(updatedTask);
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const handleFileUpload = async (files) => {
    try {
      const fileArray = Array.from(files);
      for (const file of fileArray) {
        const updatedTask = await taskService.addFile(task.Id, {
          name: file.name,
          size: file.size,
          type: file.type
        });
        setTaskData(updatedTask);
      }
      toast.success(`${fileArray.length} file(s) uploaded successfully`);
      onTaskUpdate?.(taskData);
    } catch (error) {
      toast.error('Failed to upload files');
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      const updatedTask = await taskService.deleteFile(task.Id, fileId);
      setTaskData(updatedTask);
      toast.success('File deleted successfully');
      onTaskUpdate?.(updatedTask);
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      const updatedTask = await taskService.addDiscussion(task.Id, newComment.trim());
      setTaskData(updatedTask);
      setNewComment('');
      toast.success('Comment added successfully');
      onTaskUpdate?.(updatedTask);
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type?.includes('image')) return 'Image';
    if (type?.includes('pdf')) return 'FileText';
    if (type?.includes('video')) return 'Video';
    if (type?.includes('audio')) return 'Music';
    if (type?.includes('zip') || type?.includes('rar')) return 'Archive';
    return 'File';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen || !taskData) return null;

  const tabs = [
    { id: 'notes', label: 'Notes', icon: 'FileText', count: taskData.notes?.length || 0 },
    { id: 'files', label: 'Files', icon: 'Paperclip', count: taskData.files?.length || 0 },
    { id: 'discussions', label: 'Discussions', icon: 'MessageCircle', count: taskData.discussions?.length || 0 }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {taskData.title}
                </h2>
                {taskData.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {taskData.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-3">
                  <Badge variant={taskData.priority === 'high' ? 'destructive' : taskData.priority === 'medium' ? 'warning' : 'secondary'}>
                    {taskData.priority}
                  </Badge>
                  {taskData.projectName && (
                    <Badge variant="outline">{taskData.projectName}</Badge>
                  )}
                  {taskData.assigneeName && (
                    <Badge variant="secondary">{taskData.assigneeName}</Badge>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <ApperIcon name="X" size={20} />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors',
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  )}
                >
                  <ApperIcon name={tab.icon} size={16} />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-1 bg-gray-200 dark:bg-gray-600 text-xs px-1.5 py-0.5 rounded">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <ApperIcon name="Loader2" className="animate-spin" size={24} />
              </div>
            ) : (
              <>
                {/* Notes Tab */}
                {activeTab === 'notes' && (
                  <div className="space-y-4">
                    {/* Add Note */}
                    <div className="flex gap-3">
                      <Input
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a note..."
                        className="flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                      />
                      <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                        <ApperIcon name="Plus" size={16} />
                      </Button>
                    </div>

                    {/* Notes List */}
                    <div className="space-y-3">
                      {taskData.notes?.map((note) => (
                        <motion.div
                          key={note.Id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                        >
                          {editingNote === note.Id ? (
                            <div className="space-y-3">
                              <Input
                                defaultValue={note.content}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleEditNote(note.Id, e.target.value);
                                  }
                                }}
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    const input = e.target.closest('.space-y-3').querySelector('input');
                                    handleEditNote(note.Id, input.value);
                                  }}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingNote(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-gray-900 dark:text-gray-100 mb-1">{note.content}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDate(note.createdAt)}
                                </p>
                              </div>
                              <div className="flex gap-1 ml-3">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingNote(note.Id)}
                                >
                                  <ApperIcon name="Edit2" size={14} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteNote(note.Id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <ApperIcon name="Trash2" size={14} />
                                </Button>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )) || (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                          No notes yet. Add your first note above.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Files Tab */}
                {activeTab === 'files' && (
                  <div className="space-y-4">
                    {/* File Upload Area */}
                    <div
                      className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                        dragActive
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                          : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                      )}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <ApperIcon name="Upload" size={32} className="mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        Drag files here or click to browse
                      </p>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 cursor-pointer"
                      >
                        Choose Files
                      </label>
                    </div>

                    {/* Files List */}
                    <div className="space-y-2">
                      {taskData.files?.map((file) => (
                        <motion.div
                          key={file.Id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <ApperIcon name={getFileIcon(file.type)} size={20} className="text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {/* Download logic */}}
                            >
                              <ApperIcon name="Download" size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteFile(file.Id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <ApperIcon name="Trash2" size={14} />
                            </Button>
                          </div>
                        </motion.div>
                      )) || (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                          No files uploaded yet. Drag files above to get started.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Discussions Tab */}
                {activeTab === 'discussions' && (
                  <div className="space-y-4">
                    {/* Add Comment */}
                    <div className="flex gap-3">
                      <Input
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                      />
                      <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                        <ApperIcon name="Send" size={16} />
                      </Button>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4">
                      {taskData.discussions?.map((comment) => (
                        <motion.div
                          key={comment.Id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-3"
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {comment.author?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {comment.author || 'User'}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              {comment.content}
                            </p>
                          </div>
                        </motion.div>
                      )) || (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                          No discussions yet. Start the conversation above.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TaskDetail;