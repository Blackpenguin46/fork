'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bookmark as BookmarkIcon, 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Tag, 
  Clock, 
  Star, 
  MoreVertical,
  Edit,
  Trash2,
  Share2,
  Archive,
  FolderPlus,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/app/providers';
import { BookmarksService } from '@/lib/services/bookmarks';
import type { Bookmark } from '@/lib/types/database';
import { toast } from 'react-hot-toast';

interface BookmarkManagerProps {
  onClose?: () => void;
}

const BookmarkManager: React.FC<BookmarkManagerProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [collections, setCollections] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadBookmarks();
    }
  }, [selectedCollection, selectedTags, user?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      // For now, just load basic data - collections feature not implemented yet
      setCollections([]);
    } catch (error) {
      console.error('Error loading collections:', error);
      toast.error('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarks = async () => {
    try {
      const result = await BookmarksService.getUserBookmarks(user!.id, {
        limit: 100,
        page: 1
      });
      if (result.success && result.data) {
        setBookmarks(result.data.bookmarks);
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      toast.error('Failed to load bookmarks');
    }
  };

  const handleCreateCollection = async (name: string, description: string, color: string) => {
    try {
      // Collection functionality not implemented yet
      setShowCollectionForm(false);
      toast.success('Collection feature coming soon');
    } catch (error) {
      console.error('Error creating collection:', error);
      toast.error('Failed to create collection');
    }
  };

  const handleDeleteBookmark = async (bookmarkId: string) => {
    try {
      if (user?.id) {
        const result = await BookmarksService.removeBookmark(user.id, bookmarkId);
        if (result.success) {
          await loadBookmarks();
          toast.success('Bookmark deleted');
        } else {
          toast.error(result.error || 'Failed to delete bookmark');
        }
      }
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      toast.error('Failed to delete bookmark');
    }
  };

  const handleUpdateBookmark = async (bookmarkId: string, updates: any) => {
    try {
      // Update functionality not implemented yet
      setEditingBookmark(null);
      toast.success('Update feature coming soon');
    } catch (error) {
      console.error('Error updating bookmark:', error);
      toast.error('Failed to update bookmark');
    }
  };

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = searchQuery === '' || 
      bookmark.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const allTags: string[] = [];

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'text-red-400';
      case 2: return 'text-orange-400';
      case 3: return 'text-yellow-400';
      case 4: return 'text-green-400';
      case 5: return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'Urgent';
      case 2: return 'High';
      case 3: return 'Medium';
      case 4: return 'Low';
      case 5: return 'Someday';
      default: return 'Medium';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Bookmarks</h1>
            <p className="text-gray-400">
              {filteredBookmarks.length} bookmarks in {collections.length} collections
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 bg-gray-800 border border-gray-700 rounded-lg hover:border-cyan-500/50 transition-colors"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid3X3 className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setShowCollectionForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
            >
              <FolderPlus className="w-5 h-5" />
              <span>New Collection</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Collections */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Collections</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCollection(null)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedCollection === null 
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                      : 'hover:bg-gray-700/50 text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>All Bookmarks</span>
                    <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                      {bookmarks.length}
                    </span>
                  </div>
                </button>
                
                {collections.map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => setSelectedCollection(collection.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedCollection === collection.id 
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                        : 'hover:bg-gray-700/50 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{collection.name}</span>
                      <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                        {collection.bookmarkCount}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            {allTags.length > 0 && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        if (selectedTags.includes(tag)) {
                          setSelectedTags(selectedTags.filter(t => t !== tag));
                        } else {
                          setSelectedTags([...selectedTags, tag]);
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-xs transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                />
              </div>
              
              <button className="p-2 bg-gray-800 border border-gray-700 rounded-lg hover:border-cyan-500/50 transition-colors">
                <Filter className="w-5 h-5" />
              </button>
            </div>

            {/* Bookmarks Grid/List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
              <AnimatePresence>
                {filteredBookmarks.map((bookmark) => (
                  <motion.div
                    key={bookmark.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-cyan-500/50 transition-colors ${
                      viewMode === 'list' ? 'flex items-center space-x-4' : ''
                    }`}
                  >
                    <div className={viewMode === 'list' ? 'flex-1' : ''}>
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-white font-semibold line-clamp-2">
                          Bookmark {bookmark.id.substring(0, 8)}
                        </h3>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400">
                            <Star className="w-3 h-3 inline mr-1" />
                            Normal
                          </span>
                          
                          <div className="relative group">
                            <button className="p-1 hover:bg-gray-700 rounded">
                              <MoreVertical className="w-4 h-4 text-gray-400" />
                            </button>
                            
                            {/* Dropdown Menu */}
                            <div className="absolute right-0 top-6 bg-gray-800 border border-gray-700 rounded-lg py-2 w-48 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <button
                                onClick={() => setEditingBookmark(bookmark)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm flex items-center space-x-2"
                              >
                                <Edit className="w-4 h-4" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => {/* TODO: implement open */}}
                                className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm flex items-center space-x-2"
                              >
                                <ExternalLink className="w-4 h-4" />
                                <span>Open</span>
                              </button>
                              <button
                                onClick={() => handleDeleteBookmark(bookmark.id)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm text-red-400 flex items-center space-x-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        Resource ID: {bookmark.resource_id}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(bookmark.created_at).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span>Bookmarked</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-3">
                        <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                          bookmark
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredBookmarks.length === 0 && (
              <div className="text-center py-12">
                <BookmarkIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No bookmarks found</h3>
                <p className="text-gray-500">
                  {searchQuery || selectedTags.length > 0 
                    ? 'Try adjusting your search or filters'
                    : 'Start bookmarking content to see it here'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collection Form Modal */}
      {showCollectionForm && (
        <CollectionForm
          onSave={handleCreateCollection}
          onCancel={() => setShowCollectionForm(false)}
        />
      )}

      {/* Edit Bookmark Modal */}
      {editingBookmark && (
        <EditBookmarkModal
          bookmark={editingBookmark}
          collections={collections}
          onSave={handleUpdateBookmark}
          onCancel={() => setEditingBookmark(null)}
        />
      )}
    </div>
  );
};

// Collection Form Component
const CollectionForm: React.FC<{
  onSave: (name: string, description: string, color: string) => void;
  onCancel: () => void;
}> = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('blue');

  const colors = [
    { name: 'blue', class: 'bg-blue-500' },
    { name: 'green', class: 'bg-green-500' },
    { name: 'purple', class: 'bg-purple-500' },
    { name: 'red', class: 'bg-red-500' },
    { name: 'yellow', class: 'bg-yellow-500' },
    { name: 'pink', class: 'bg-pink-500' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Create Collection</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Collection Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
              placeholder="Enter collection name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
              placeholder="Enter description"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Color
            </label>
            <div className="flex space-x-2">
              {colors.map((colorOption) => (
                <button
                  key={colorOption.name}
                  onClick={() => setColor(colorOption.name)}
                  className={`w-8 h-8 rounded-full ${colorOption.class} ${
                    color === colorOption.name ? 'ring-2 ring-white' : ''
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button
            onClick={() => onSave(name, description, color)}
            disabled={!name.trim()}
            className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create Collection
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Edit Bookmark Modal Component
const EditBookmarkModal: React.FC<{
  bookmark: Bookmark;
  collections: any[];
  onSave: (id: string, updates: any) => void;
  onCancel: () => void;
}> = ({ bookmark, collections, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [priority, setPriority] = useState('normal');
  const [collectionId, setCollectionId] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Edit Bookmark</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
              placeholder="Custom title (optional)"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
              placeholder="Add your notes..."
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
              placeholder="tag1, tag2, tag3"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
            >
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="someday">Someday</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Collection
            </label>
            <select
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
            >
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button
            onClick={() => onSave(bookmark.id, {
              title: title || undefined,
              notes: notes || undefined,
              tags: tags.split(',').map(t => t.trim()).filter(t => t),
              priority,
              collectionId
            })}
            className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
          >
            Save Changes
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default BookmarkManager;