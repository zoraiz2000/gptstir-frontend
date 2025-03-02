import { useState, useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../components/Login';
import Chat from '../components/Chat';
import Providers from '../components/Providers';
import ChatHistory from '../components/ChatHistory';
import Navbar from '../components/Navbar';
import PrivateRoute from './PrivateRoute';
import chatAPI from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AppRoutes = () => {
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  
  // Touch handling
  const touchStart = useRef(null);
  const sidebar = useRef(null);

  const handleTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (!touchStart.current) return;

    const currentTouch = e.touches[0].clientX;
    const diff = touchStart.current - currentTouch;

    // If swiping left and sidebar is open
    if (diff > 50 && isSidebarOpen) {
      setIsSidebarOpen(false);
      touchStart.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStart.current = null;
  };

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const data = await chatAPI.getConversations();
      setConversations(data);
      if (data.length > 0) {
        setCurrentConversationId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationsUpdate = (newConversations) => {
    setConversations(newConversations);
  };

  const handleSelectConversation = (conversationId) => {
    setCurrentConversationId(conversationId);
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <div className="fixed inset-0 flex overflow-hidden">
              {/* Left Sidebar - Desktop */}
              <div className="hidden xl:flex flex-col w-[400px] flex-shrink-0 bg-[rgb(17,17,17)]">
                <Providers />
                <ChatHistory 
                  onSelectConversation={handleSelectConversation}
                  currentConversationId={currentConversationId}
                  conversations={conversations}
                  onConversationsUpdate={handleConversationsUpdate}
                />
              </div>

              {/* Left Sidebar - Mobile */}
              <div 
                ref={sidebar}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`
                  fixed inset-y-0 left-0 z-40 w-[90%] max-w-[400px] flex-shrink-0 xl:hidden
                  transform transition-transform duration-300 ease-in-out bg-[rgb(17,17,17)]
                  ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
              >
                <div className="flex flex-col h-full">
                  <Providers />
                  <ChatHistory 
                    onSelectConversation={handleSelectConversation}
                    currentConversationId={currentConversationId}
                    conversations={conversations}
                    onConversationsUpdate={handleConversationsUpdate}
                  />
                </div>
              </div>

              {/* Overlay for mobile sidebar */}
              {isSidebarOpen && (
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50 z-30 xl:hidden"
                  onClick={() => setIsSidebarOpen(false)}
                />
              )}

              {/* Main Content */}
              <div className="flex-1 flex flex-col min-w-0 bg-[rgb(17,17,17)]">
                {/* Navbar */}
                <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

                {/* Content Area */}
                <div className="flex-1 flex min-w-0 overflow-hidden">
                  <div className="flex-1 flex justify-center">
                    {/* Chat Section */}
                    <div className="w-full max-w-[848px] min-w-[300px] flex-shrink-0">
                      <Chat 
                        conversationId={currentConversationId}
                        onConversationCreate={setCurrentConversationId}
                        onConversationsUpdate={handleConversationsUpdate}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PrivateRoute>
        } 
      />
    </Routes>
  );
};

export default AppRoutes; 