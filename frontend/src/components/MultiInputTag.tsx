import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface MultiInputTagProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

const MultiInputTag: React.FC<MultiInputTagProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  const [inputValue, setInputValue] = useState<string>("");

  const handleAddTag = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim())) {
      onChange([...value, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      handleAddTag();
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      // Remove last tag if input is empty and backspace is pressed
      const lastTag = value[value.length - 1];
      handleRemoveTag(lastTag);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="flex items-center gap-1 pr-1">
            {tag}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => handleRemoveTag(tag)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-grow"
        />
        <Button onClick={handleAddTag}>Add</Button>
      </div>
    </div>
  );
};

export default MultiInputTag;