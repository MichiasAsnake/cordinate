"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SearchBarProps {
  className?: string;
}

export function SearchBar({ className = "" }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState(
    pathname === "/workflow" ? searchParams.get("search") || "" : ""
  );
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const handleSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }
      // If we're not on the workflow page, redirect to it with the search term
      if (pathname !== "/workflow") {
        router.push(`/workflow?${params.toString()}`);
      } else {
        router.push(`?${params.toString()}`);
      }
    },
    [router, searchParams, pathname]
  );

  useEffect(() => {
    // Only trigger search if user has interacted with the search bar
    // or if we're already on the workflow page
    if (hasUserInteracted || pathname === "/workflow") {
      handleSearch(debouncedSearch);
    }
  }, [debouncedSearch, handleSearch, hasUserInteracted, pathname]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setHasUserInteracted(true);
  };

  const handleClear = () => {
    setSearchTerm("");
    setHasUserInteracted(true);
  };

  return (
    <div className={`relative ${className}`}>
      <Input
        type="text"
        placeholder="Search orders..."
        value={searchTerm}
        onChange={handleInputChange}
        className="pr-10 focus:bg-accent/50"
      />
      {searchTerm && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
