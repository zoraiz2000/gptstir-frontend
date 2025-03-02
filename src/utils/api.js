import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response logging for debugging
api.interceptors.response.use(
  response => {
    console.log(`API Response [${response.config.method.toUpperCase()} ${response.config.url}]:`, response.status);
    return response;
  },
  error => {
    console.error(`API Error [${error.config?.method?.toUpperCase()} ${error.config?.url}]:`, 
      error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

const chatAPI = {
  async createConversation(title) {
    try {
      console.log(`Creating conversation with title: "${title}"`);
      const res = await api.post('/chat/conversation', { title });
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async sendMessage(prompt, modelType, modelName, conversationId = null) {
    try {
      const res = await api.post('/chat', { 
        prompt, 
        modelType, 
        modelName,
        conversationId
      });
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getConversationHistory(conversationId) {
    try {
      const res = await api.get(`/chat/conversation/${conversationId}`);
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getConversations() {
    try {
      const res = await api.get('/chat/conversations');
      return res.data;
    } catch (error) {
      if (error.response?.status === 401) {
        return [];  // Return empty array for unauthorized requests
      }
      return handleApiError(error);
    }
  },

  async renameConversation(conversationId, newTitle) {
    try {
      console.log(`API call: Renaming conversation ${conversationId} to "${newTitle}"`);
      const res = await api.put(`/chat/conversation/${conversationId}`, {
        title: newTitle
      });
      console.log('Rename response:', res.data);
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async deleteConversation(conversationId) {
    try {
      console.log(`API call: Deleting conversation ${conversationId}`);
      const res = await api.delete(`/chat/conversation/${conversationId}`);
      console.log('Delete response:', res.data);
      return res.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
};

const handleApiError = (error) => {
  if (error.response?.status === 401) {
    // Only redirect if we're not already on the login page
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    return null;
  }
  
  // Instead of throwing, return null and log the error
  console.error('API Error:', error.response?.data?.error || error.message);
  return null;
};

export default chatAPI;