import type React from "react";
import { IoIosSearch } from "react-icons/io";

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  placeholder?: string;
}
export function SearchBar({ searchTerm, setSearchTerm, placeholder }: SearchBarProps) {
  return (
    <div className="input-wrapper flex gap-4 items-center bg-highlight p-2 rounded-4xl w-fit">
      <IoIosSearch size={20} className="text-surface-base" />
      <input
        type="text"
        className="outline-none bg-transparent inline-block w-full max-w-40 text-surface-muted placeholder-surface-muted/50"
        placeholder={`${placeholder ?? "Search"}...`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)} />
    </div>
  );
}
