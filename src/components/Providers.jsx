import React from 'react'
import { AiOutlineOpenAI } from "react-icons/ai";
import { RiAnthropicFill } from "react-icons/ri";
import { DeepSeek, XAI } from '@lobehub/icons';


const providers = [
    {
        name: "OpenAI",
        icon: <AiOutlineOpenAI size={66} />,
        className: "text-[rgb(14,158,123)]",
    },
    {
        name: "Anthropic",
        icon: <RiAnthropicFill size={36} />,
        className: "bg-[rgb(206,158,125)] text-[rgb(38,38,38)] rounded-2xl p-3",
    },
    {
        name: "DeepSeek",
        icon: <DeepSeek size={48} />,
        className: "text-[rgb(82,112,254)]",
    },
    {
        name: "xAI",
        icon: <XAI size={36} />,
        className: "text-white bg-[rgb(8,8,8)] rounded p-3",
    },
];

const Providers = () => {
    return (
        <div className="bg-[rgb(17,17,17)] border border-stone-50/10 p-6 flex flex-col justify-center">
            <div className="text-lg font-semibold text-white mb-4 text-center">
                Supported Providers
            </div>
            <div className="grid grid-cols-4 gap-6 justify-items-center">
                {providers.map((provider, index) => (
                    <div 
                        key={index} 
                        className="group cursor-pointer"
                    >
                        <div className="flex flex-col items-center">
                            <div className="w-18 h-18 flex items-center justify-center bg-[rgb(23,23,23)] 
                                          rounded-xl hover:bg-[rgb(28,28,28)] transition-all duration-200">
                                <div className={provider.className}>
                                    {provider.icon}
                                </div>
                            </div>
                            <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <span className="text-sm text-gray-400">
                                    {provider.name}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  };

export default Providers