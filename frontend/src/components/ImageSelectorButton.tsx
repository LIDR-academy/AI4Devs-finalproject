import React from "react";

interface ImageSelectorButtonProps {
  onImageSelected: (file: File) => void;
}

const ImageSelectorButton: React.FC<ImageSelectorButtonProps> = ({ onImageSelected }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onImageSelected(file);
    }
  };

  return (
    <>
      <button
        type="button"
        className="btn btn--orange"
        onClick={handleButtonClick}
      >
        📁 Select image
      </button>
      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </>
  );
};

export default ImageSelectorButton;
