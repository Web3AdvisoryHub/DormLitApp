import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaEdit, FaTrash, FaPlay, FaPause, FaStepForward } from 'react-icons/fa';
import { AICreativeProject } from '@/shared/database.types';

interface ProjectDetailsProps {
  project: AICreativeProject;
  onClose: () => void;
  onUpdate: (updates: Partial<AICreativeProject>) => void;
  onDelete: () => void;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  project,
  onClose,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(project.title);
  const [editedDescription, setEditedDescription] = useState(project.description);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdate = async () => {
    try {
      await onUpdate({
        title: editedTitle,
        description: editedDescription
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setIsDeleting(true);
      try {
        await onDelete();
        onClose();
      } catch (error) {
        console.error('Failed to delete project:', error);
        setIsDeleting(false);
      }
    }
  };

  const renderProgressBar = () => {
    const progress = Math.min(Math.max(project.progress, 0), 100);
    return (
      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-purple-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
    >
      <motion.div
        className="w-full max-w-2xl bg-black/80 rounded-lg shadow-lg p-6"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">
            {isEditing ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="bg-gray-700 text-white px-2 py-1 rounded"
              />
            ) : (
              project.title
            )}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-gray-400 hover:text-white"
            >
              <FaEdit />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Description</h3>
            {isEditing ? (
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
              />
            ) : (
              <p className="text-gray-300">{project.description}</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Progress</h3>
            {renderProgressBar()}
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-400">
                {project.progress}% Complete
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => onUpdate({ status: 'in_progress' })}
                  className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <FaPlay />
                </button>
                <button
                  onClick={() => onUpdate({ status: 'paused' })}
                  className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <FaPause />
                </button>
                <button
                  onClick={() => onUpdate({ progress: Math.min(project.progress + 10, 100) })}
                  className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <FaStepForward />
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-purple-800/50 text-purple-300 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Emotional Inspiration</h3>
            <p className="text-gray-300">{project.emotional_inspiration}</p>
          </div>

          <div className="flex justify-end gap-2">
            {isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Save Changes
                </button>
              </>
            )}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Deleting...
                </>
              ) : (
                <>
                  <FaTrash />
                  Delete Project
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}; 