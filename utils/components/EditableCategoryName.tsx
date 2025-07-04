import React, { useState, useRef, useEffect } from 'react';

interface EditableCategoryNameProps {
  name: string;
  onSave: (newName: string) => void;
  className?: string;
}

const PencilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...props}>
    <path d="M5.433 13.917l1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
  </svg>
);


const EditableCategoryName: React.FC<EditableCategoryNameProps> = ({ name, onSave, className }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (value.trim() && value.trim() !== name) {
      onSave(value.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setValue(name);
      setIsEditing(false);
    }
  };
  
  const handleBlur = () => {
    // Timeout to allow for click on save button if one existed
    setTimeout(handleSave, 100);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={`${className} p-1 -m-1 border border-primary rounded-md focus:ring-1 focus:ring-primary`}
      />
    );
  }

  return (
    <span onClick={() => setIsEditing(true)} className={`${className} p-1 -m-1 cursor-pointer group flex items-center gap-2 hover:bg-slate-200/50 rounded-md`}>
      {name}
      <PencilIcon className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </span>
  );
};

export default EditableCategoryName;