// src/components/shared/SearchBar.tsx
import React, { useState, KeyboardEvent, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // You'll need to install framer-motion

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  centered?: boolean;
  title?: string;
  initialValue?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "What do you want to learn?",
  centered = false,
  title,
  initialValue = "",
  className,
}) => {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch(query);
    }
  };

  // Add keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown as any);
    return () => window.removeEventListener("keydown", handleKeyDown as any);
  }, []);

  return (
    <div className={`w-full ${centered ? "text-center" : ""}`}>
      {centered && title && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white mb-8">{title}</h1>
        </motion.div>
      )}
      <div className={`relative group ${centered ? "mx-auto" : ""}`}>
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={`w-full pl-4 pr-12 py-2.5 bg-gray-800/80 border border-gray-700/50 
              rounded-xl shadow-lg text-gray-200 placeholder-gray-400 text-base
              focus:outline-none focus:ring-2 focus:ring-primary/20
              transition-all duration-300 ease-in-out
              hover:bg-gray-800/90 hover:border-gray-600/50
              ${isFocused ? "border-primary/50 shadow-lg shadow-primary/10" : ""}
              ${className}`}
          />
        </motion.div>

        {query && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setQuery("")}
            className="absolute inset-y-0 right-0 pr-4 flex items-center 
              text-gray-400 hover:text-gray-200 transition-all duration-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </motion.button>
        )}
      </div>
    </div>
  );
};
