import { RiUserAddLine } from "react-icons/ri";
import React from "react";

interface AddPlayerButtonProps {
  onClick?: () => void;
}

const AddPlayerButton = React.forwardRef<HTMLButtonElement, AddPlayerButtonProps>(
  ({ onClick }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800 rounded transition-colors"
      >
        <RiUserAddLine />
        <span>Add player</span>
      </button>
    );
  }
);

AddPlayerButton.displayName = "AddPlayerButton";

export default AddPlayerButton;
