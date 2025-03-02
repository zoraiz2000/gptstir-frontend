import { useState, useEffect, useRef } from "react";
import { FaChevronDown } from "react-icons/fa6";

export default function Dropdown({ selectedModel, setSelectedModel }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const dropdownRef = useRef(null);

  // Model definitions with their types
  const modelCategories = {
    "OpenAI": [
      { name: "gpt-3.5-turbo", type: "openai" },
      { name: "gpt-4", type: "openai" },
      { name: "gpt-4-turbo", type: "openai" }
    ],
    "Claude": [
      { name: "claude-3-opus-latest", type: "claude" },
      { name: "claude-3-5-sonnet-latest", type: "claude" },
      { name: "claude-3-7-sonnet-latest", type: "claude" }
    ],
    "DeepSeek": [
      { name: "deepseek-chat", type: "deepseek" }
    ],
    "xAI": [
      { name: "grok-2-1212", type: "grok" }
    ]
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  
  const toggleCategory = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const selectModel = (model) => {
    setSelectedModel(model);
    setDropdownOpen(false); // Close dropdown after selection
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
        setExpandedCategory(null); // Optional: collapse categories too
      }
    };

    // Add event listener when dropdown is open
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup listener when component unmounts or dropdown closes
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <div className="relative text-sm" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center gap-2 mr-2 px-3 py-1 bg-[rgb(23,23,23)] text-[rgb(200,200,200)] rounded-full 
        hover:bg-[rgb(53,53,53)] hover:cursor-pointer transition-all duration-300"
        onClick={toggleDropdown}
      >
        {selectedModel.name || "Select Model"}
        <FaChevronDown
          className={`text-[rgb(150,150,150)] transition-transform duration-300 ${dropdownOpen ? "rotate-180" : "rotate-0"}`}
          size={12}
        />
      </button>
      {dropdownOpen && (
        <div className="absolute right-0 bottom-[48px] mt-2 w-56 bg-[rgb(23,23,23)] border border-stone-50/15 rounded-2xl shadow-lg z-10">
          <ul className="p-2">
            {Object.keys(modelCategories).map((category) => (
              <li key={category} className="p-1 cursor-pointer">
                <div
                  className="flex justify-between p-2 rounded-lg items-center 
                  text-[rgb(200,200,200)] hover:bg-[rgb(53,53,53)] transition-all duration-300"
                  onClick={() => toggleCategory(category)}
                >
                  <span>{category}</span>
                  <span>
                    <FaChevronDown
                      className={`text-[rgb(150,150,150)] transition-transform duration-300 ${expandedCategory === category ? "rotate-180" : "rotate-0"}`}
                      size={12}
                    />
                  </span>
                </div>

                {expandedCategory === category && (
                  <ul className="ml-4 mt-2 p-2 border-l rounded-r-lg border-stone-50/35 bg-[rgb(33,33,33)] text-xs transition-all duration-300">
                    {modelCategories[category].map((model) => (
                      <li
                        key={model.name}
                        className="p-2 cursor-pointer rounded-lg hover:bg-[rgb(53,53,53)]"
                        onClick={() => selectModel(model)}
                      >
                        {model.name}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
