import { useState, useEffect, useRef } from 'react';
import InputBar from "./InputBar";
import chatAPI from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { AiOutlineOpenAI } from "react-icons/ai";
import { RiAnthropicFill } from "react-icons/ri";
import { DeepSeek, XAI } from '@lobehub/icons';
import { BsExclamationLg } from "react-icons/bs";

// Provider icon mapping
const providerIcons = {
    'openai': <AiOutlineOpenAI size={16} />,
    'claude': <RiAnthropicFill size={16} />,
    'deepseek': <DeepSeek size={16} />,
    'grok': <XAI size={16} />,
    'unknown': <BsExclamationLg size={16} />
};

// Provider color mapping
const providerColors = {
    'openai': 'text-[rgb(14,158,123)]',
    'claude': 'text-[rgb(206,158,125)]',
    'deepseek': 'text-[rgb(82,112,254)]',
    'grok': 'text-white',
    'unknown': 'text-red-500'
};

// Get provider type from model name if not explicitly provided
const getProviderType = (modelName, modelType) => {
    if (modelType && (modelType === 'openai' || modelType === 'claude' || 
                      modelType === 'deepseek' || modelType === 'grok')) {
        return modelType;
    }
    
    if (!modelName) return 'unknown';
    
    const modelLower = modelName.toLowerCase();
    if (modelLower.includes('gpt')) return 'openai';
    if (modelLower.includes('claude')) return 'claude';
    if (modelLower.includes('deepseek')) return 'deepseek';
    if (modelLower.includes('grok')) return 'grok';
    
    return 'unknown'; // default to unknown for unrecognized models
};

// Format model name for display
const formatModelName = (modelName) => {
    if (!modelName) return 'Unknown Model';
    
    // Convert kebab-case to more readable format
    return modelName
        .split('-')
        .map(word => 
            word === 'gpt' || word === '3' || word === '4' || 
            word === '5' || word === '7' || 
            word === 'opus' || word === 'sonnet' || 
            word === 'latest' || word === 'turbo' ? 
            word : word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(' ')
        .replace(/(\d+)(\s+)(\d+)/g, '$1.$3'); // Convert "3 5" to "3.5"
};

const Chat = ({ conversationId, onConversationCreate, onConversationsUpdate }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const messagesEndRef = useRef(null);

    // Scroll to bottom whenever messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (conversationId) {
            loadConversationHistory();
        } else {
            setMessages([]); // Clear messages for new chat
        }
    }, [conversationId]);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadConversationHistory = async () => {
        try {
            setLoading(true);
            const history = await chatAPI.getConversationHistory(conversationId);
            setMessages(history.map(msg => ({
                id: msg.id,
                text: msg.content,
                isUser: msg.role === 'user',
                modelName: msg.model_name,
                modelType: msg.model_type
            })));
        } catch (error) {
            console.error('Failed to load conversation:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (prompt, modelType, modelName) => {
        if (!prompt.trim()) return;

        try {
            // Add user message immediately to UI
            const userMessage = { id: Date.now(), text: prompt, isUser: true };
            setMessages(prev => [...prev, userMessage]);

            // Send to backend and get response
            const response = await chatAPI.sendMessage(prompt, modelType, modelName, conversationId);
            
            // Always update conversation list after sending a message
            const newConversations = await chatAPI.getConversations();
            onConversationsUpdate(newConversations);
            
            // If this is a new conversation, update the conversation ID
            if (response.conversationId && !conversationId) {
                onConversationCreate(response.conversationId);
            }

            // Add AI response to UI
            const botMessage = { 
                id: Date.now() + 1, 
                text: response.response, 
                isUser: false,
                modelName: modelName,
                modelType: modelType
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: "Failed to send message. Please try again.",
                isUser: false,
                isError: true
            }]);
        }
    };

    // Get user initials
    const getUserInitials = () => {
        if (!user?.name) return 'U';
        return user.name.split(' ').map(n => n[0]).join('');
    };

    return (
        <div className="flex flex-col h-full relative">
            {/* Messages Container - Scrollable */}
            <div className="absolute inset-0 bottom-[100px] overflow-y-auto custom-scrollbar">
                <div className="max-w-3xl mx-auto py-4 px-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-gray-400">Loading...</div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-gray-400">Start a new conversation</div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {messages.map((message) => {
                                const providerType = getProviderType(message.modelName, message.modelType);
                                return (
                                    <div 
                                        key={message.id} 
                                        className={`flex flex-col ${message.isUser ? 'items-end' : 'items-start'}`}
                                    >
                                        {/* Message identifier with icon/initials */}
                                        <div className="flex items-center gap-2 mb-1 px-1">
                                            {message.isUser ? (
                                                <>
                                                    <span className="text-xs text-gray-400">You</span>
                                                    <div className="w-6 h-6 rounded-full bg-[rgb(33,33,33)] flex items-center justify-center text-white text-xs font-medium">
                                                        {getUserInitials()}
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className={`w-6 h-6 rounded-full bg-[rgb(33,33,33)] flex items-center justify-center ${providerColors[providerType]}`}>
                                                        {providerIcons[providerType]}
                                                    </div>
                                                    <span className="text-xs text-gray-400">
                                                        {formatModelName(message.modelName) || 'Unknown Model'}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        
                                        {/* Message content */}
                                        <div 
                                            className={`rounded-xl p-4 max-w-2xl ${
                                                message.isUser 
                                                    ? 'bg-[rgb(33,33,33)]' 
                                                    : message.isError 
                                                        ? 'bg-red-900/20'
                                                        : 'bg-[rgb(43,43,43)]'
                                            }`}
                                        >
                                            <div className="text-white whitespace-pre-wrap">
                                                {message.text}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {/* Invisible element to scroll to */}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>
            </div>

            {/* Input Bar - Fixed at bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-[rgb(17,17,17)] p-4">
                <div className="max-w-3xl mx-auto">
                    <InputBar onSendMessage={handleSendMessage} />
                </div>
            </div>
        </div>
    );
};

export default Chat;