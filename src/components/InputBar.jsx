import React, { useState, useRef, useEffect } from "react";
import Dropdown from "./Dropdown";
import { FaPaperPlane } from "react-icons/fa6";

const InputBar = ({ onSendMessage }) => {
    const [prompt, setPrompt] = useState("");
    const [selectedModel, setSelectedModel] = useState({ 
        name: "gpt-3.5-turbo", 
        type: "openai" 
    });
    const textareaRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (prompt.trim()) {
            onSendMessage(prompt, selectedModel.type, selectedModel.name);
            setPrompt("");
        }
    };

    // Auto-resize textarea based on content
    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = "auto";
        
        // Set the height based on scrollHeight, but cap it
        const maxHeight = 10 * 24; // Approximately 10 rows (24px per row)
        const newHeight = Math.min(textarea.scrollHeight, maxHeight);
        
        // Set the new height
        textarea.style.height = `${newHeight}px`;
        
        // Add scrollbar if content exceeds max height
        textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
    }, [prompt]);

    return (
        <form onSubmit={handleSubmit} className="relative min-h-[100px] border border-stone-50/10 rounded-xl bg-[rgb(23,23,23)]">
            <div className="flex flex-col gap-2">
                <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                        }
                    }}
                    placeholder="Send a message..."
                    className="w-full py-3 px-4 pr-12 bg-[rgb(23,23,23)] min-h-[50px] text-white rounded-xl resize-none focus:outline-none focus:ring-0"
                    rows={1} // Start with 1 row
                />
                
                <div className="flex justify-end items-center min-h-[50px] pr-4">
                    <Dropdown selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
                    <button
                        type="submit"
                        className="text-gray-400 rounded-full p-2 hover:text-white hover:bg-[rgb(53,53,53)] hover:cursor-pointer transition-colors "
                        disabled={!prompt.trim()}
                    >
                        <FaPaperPlane size={16} />
                    </button>
                </div>
            </div>
        </form>
    );
};

export default InputBar;