import React from "react";
import { Button } from "src/components/ui/button";
import { useState } from "react";
import {Upload} from "lucide-react";

function ImageUploadButton({ className,onFileSelect }) {

    const hiddenFileInput = React.useRef(null);

    const handleClick = (event) => {
      event.preventDefault();
      hiddenFileInput.current.click();
    }

    const handleFileSelect = (event) => {
      const file = event.target.files[0]; // Assuming single file selection
      onFileSelect(file);
    };

  return (
    <>
      
      <Button variant="ghost" aria-label="upload-image-button" className={className} onClick={handleClick}><Upload className="h-7 w-7"/> </Button>
      
      
      <input
        className="w-full h-full"
        id="file-upload"
        type="file"
        accept="image/*" // Limit selection to image files
        onChange={handleFileSelect}
        style={{"display": "none" }} // Hide the input element visually
        ref={hiddenFileInput}

      />
    </>
    
  );
}

export default ImageUploadButton;
