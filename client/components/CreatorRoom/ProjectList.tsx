import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaFilter, FaSort, FaPlus } from 'react-icons/fa';
import { AICreativeProject } from '@/shared/database.types';
import { ProjectDetails } from './ProjectDetails';

interface ProjectListProps {
  projects: AICreativeProject[];
  onCreateProject: () => void;
  onUpdateProject: (projectId: string, updates: Partial<AICreativeProject>) => Promise<void>;
  onDeleteProject: (projectId: string) => Promise<void>;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onCreateProject,
  onUpdateProject,
  onDeleteProject
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<AICreativeProject | null>(null);
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed' | 'paused'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'progress' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredProjects = projects
    .filter((project) => {
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesFilter = filter === 'all' || project.status === filter;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return sortOrder === 'asc'
            ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'progress':
          return sortOrder === 'asc'
            ? a.progress - b.progress
            : b.progress - a.progress;
        case 'title':
          return sortOrder === 'asc'
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 pl-10"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Projects</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </select>
          
          <button
            onClick={() => handleSort('date')}
            className={`px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2 ${
              sortBy === 'date' ? 'bg-purple-600' : ''
            }`}
          >
            <FaSort className={sortBy === 'date' ? 'text-white' : 'text-gray-400'} />
            Date
          </button>
          
          <button
            onClick={() => handleSort('progress')}
            className={`px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2 ${
              sortBy === 'progress' ? 'bg-purple-600' : ''
            }`}
          >
            <FaSort className={sortBy === 'progress' ? 'text-white' : 'text-gray-400'} />
            Progress
          </button>
          
          <button
            onClick={() => handleSort('title')}
            className={`px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2 ${
              sortBy === 'title' ? 'bg-purple-600' : ''
            }`}
          >
            <FaSort className={sortBy === 'title' ? 'text-white' : 'text-gray-400'} />
            Title
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer"
            onClick={() => setSelectedProject(project)}
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-2">{project.title}</h3>
              <p className="text-gray-300 text-sm mb-4 line-clamp-2">{project.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-purple-800/50 text-purple-300 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {project.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">
                    +{project.tags.length - 3}
                  </span>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-purple-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <button
        onClick={onCreateProject}
        className="fixed bottom-6 right-6 p-4 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors"
      >
        <FaPlus className="text-xl" />
      </button>

      {selectedProject && (
        <ProjectDetails
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onUpdate={(updates) => onUpdateProject(selectedProject.id, updates)}
          onDelete={() => onDeleteProject(selectedProject.id)}
        />
      )}
    </div>
  );
}; 