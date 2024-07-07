import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { Button } from "src/components/ui/button";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
} from "src/components/ui/command";
import SearchResults from "src/components/custom/search/SearchResults";

function useCommandDialog() {
  // Shortcut to open the search dialog
  // Default as CTRL+K
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return [open, setOpen];
}

// The search bar component which could be used to search entries or journals by title
function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useCommandDialog();

  // Record the change of the input bar
  const handleInputChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
  };

  return (
    <div className="sidebar-nav">
      <Button
        className="search-button search inline-flex items-center transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground px-4 py-2 relative h-8 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(!open)}
        variant="outline"
        aria-label="search-button"
      >
        <FiSearch className="icon" />
        <span>Search</span>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        aria-label="search-dialog"
      >
        <CommandInput
          defaultValue={searchTerm}
          onChange={handleInputChange}
          className="border-0"
          placeholder="Type to start your search..."
        />
        <CommandList>
          {/* Display the result list */}
          <SearchResults
            // Pass setOpen function to SearchResults
            setOpen={setOpen}
          />
          <CommandEmpty>
            <span>No results found. </span>
          </CommandEmpty>
        </CommandList>
      </CommandDialog>
    </div>
  );
}

export default SearchBar;
