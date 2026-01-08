import type React from "react";
import { IoIosSearch } from "react-icons/io";
import { IoIosClose } from "react-icons/io";

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  placeholder?: string;
  width?: string;
  customClassName?: string;
}
export function SearchBar({ searchTerm, setSearchTerm, placeholder, width, customClassName }: SearchBarProps) {
  return (
    <div className={`input-wrapper flex gap-4 items-center bg-highlight py-2 px-3 rounded-4xl w-fit ${customClassName}`} >
      <IoIosSearch size={20} className="text-surface-base" />
      <input
        type="text"
        className="outline-none bg-transparent inline-block w-full max-w-40 text-surface-muted placeholder-surface-muted/50"
        style={{ width }}
        placeholder={`${placeholder ?? "Search"}...`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)} 
      />
      <IoIosClose 
        size={15} 
        className="text-surface-base hover:text-surface-strong cursor-pointer" 
        onClick={() => setSearchTerm('')}
        role="button"
        aria-label="Clean search input"
      />
    </div>
  );
}
