import { useState, useEffect } from 'react';
import { FaEllipsisH } from 'react-icons/fa';
import { IoTrashOutline } from "react-icons/io5";
import { RiEdit2Line } from "react-icons/ri";
import { BsChatLeftText } from "react-icons/bs";
import chatAPI from '../utils/api';

const ChatHistory = ({ onSelectConversation, currentConversationId, conversations, onConversationsUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isRenaming, setIsRenaming] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  // Load conversations on component mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-toggle') && 
          !event.target.closest('.dropdown-menu') && 
          activeDropdown !== null) {
        setActiveDropdown(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  // API functions
  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await chatAPI.getConversations();
      onConversationsUpdate(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const newConversation = await chatAPI.createConversation("New Chat");
      const updatedConversations = await chatAPI.getConversations();
      onConversationsUpdate(updatedConversations);
      onSelectConversation(newConversation.id);
    } catch (error) {
      console.error('Failed to create new chat:', error);
    }
  };

  const handleRename = async (conversationId, title) => {
    if (!title || !title.trim()) return;
    
    try {
      await chatAPI.renameConversation(conversationId, title);
      const updatedConversations = await chatAPI.getConversations();
      onConversationsUpdate(updatedConversations);
      setIsRenaming(null);
      setNewTitle('');
    } catch (error) {
      console.error('Failed to rename conversation:', error);
      setError('Failed to rename conversation');
    }
  };

  const handleDelete = async (conversationId) => {
    try {
      await chatAPI.deleteConversation(conversationId);
      const updatedConversations = await chatAPI.getConversations();
      onConversationsUpdate(updatedConversations);
      
      if (currentConversationId === conversationId) {
        onSelectConversation(null);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      setError('Failed to delete conversation');
    }
  };


  // Conversation item component
  const ConversationItem = ({ conv }) => {
    const isActive = currentConversationId === conv.id;
    const isCurrentlyRenaming = isRenaming === conv.id;
    const hasDropdownOpen = activeDropdown === conv.id;
    
    return (
      <div 
        className="relative px-4 py-1"                  
      >
        <div 
          className={`group px-5 py-2 rounded-lg  
            transition-all duration-200 ${isActive ? 'bg-[rgb(33,33,33)]' : 'hover:bg-[rgb(28,28,28)]'}`}
          onClick={(e) => {
            if (!e.target.closest('.dropdown-toggle') && 
                !e.target.closest('.dropdown-menu') && 
                !isCurrentlyRenaming) {
              onSelectConversation(conv.id);
            }
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1 flex items-center gap-2">
              {isCurrentlyRenaming ? (
                <input
                  type="text"
                  className="flex-1 bg-[rgb(43,43,43)] text-white rounded px-2 py-1 text-sm"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename(conv.id, newTitle);
                    if (e.key === 'Escape') {
                      setIsRenaming(null);
                      setNewTitle('');
                    }
                  }}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="text-sm text-white font-medium truncate cursor-pointer">
                  {conv.title}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  className={`p-1 rounded hover:bg-[rgb(43,43,43)] text-gray-400 dropdown-toggle ${!hasDropdownOpen ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'} transition-opacity duration-200`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(hasDropdownOpen ? null : conv.id);
                  }}
                >
                  <FaEllipsisH size={14} />
                </button>
                
                {hasDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-1 w-48 bg-[rgb(33,33,33)] border border-stone-50/10 rounded-lg shadow-lg z-10 dropdown-menu"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        setIsRenaming(conv.id);
                        setNewTitle(conv.title);
                        setActiveDropdown(null);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-[rgb(43,43,43)] rounded-t-lg"
                    >
                      <RiEdit2Line size={16} />
                      Rename
                    </button>
                    <button
                      onClick={() => {
                        handleDelete(conv.id);
                        setActiveDropdown(null);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-[rgb(43,43,43)] rounded-b-lg"
                    >
                      <IoTrashOutline size={16} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 cursor-pointer">
              <p className="text-xs text-gray-400 truncate">
                {conv.last_message || 'No messages yet'}
              </p>
              <p className="text-xs text-gray-500 mt-1 truncate">
                {conv.last_model_name || 'No model used'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading && conversations.length === 0) {
    return (
      <div className="flex flex-col flex-1 bg-[rgb(23,23,23)] border-r border-stone-50/10">
        <div className="p-4 border-b border-stone-50/10">
          <div className="w-full py-2 px-4 bg-[rgb(33,33,33)] rounded-lg">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col flex-1 bg-[rgb(23,23,23)] border-r border-stone-50/10">
        <div className="p-4 text-red-400">
          {error}
          <button 
            onClick={loadConversations}
            className="mt-2 text-sm text-white hover:text-gray-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="flex flex-col flex-1 bg-[rgb(23,23,23)] border-r border-stone-50/10">
      <div className="p-4">
        <button 
          onClick={handleNewChat}
          className="w-full py-2 px-4 hover:bg-[rgb(33,33,33)] hover:cursor-pointer 
                   text-white rounded-lg flex items-center gap-4 
                   transition-all duration-200"
        >
          <BsChatLeftText size={14} />
          <span>New Conversation</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar hover:cursor-pointer">
        {conversations.length === 0 ? (
          <div className="p-4 text-gray-400 text-center">
            No conversations yet
          </div>
        ) : (
          conversations.map((conv) => (
            <ConversationItem key={conv.id} conv={conv} />
          ))
        )}
      </div>
    </div>
  );
};

export default ChatHistory; 