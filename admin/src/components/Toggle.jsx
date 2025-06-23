/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";

const Toggle = ({
  enabled,
  setEnabled,
  size = "md", // sm, md, lg
  color = "indigo", // indigo, blue, green, red, yellow, purple
  disabled = false,
  labelPosition = "right", // left, right
  showLabel = true,
  label = "",
  id = "",
}) => {
  const [isEnabled, setIsEnabled] = useState(enabled);

  // Sync internal state with parent
  useEffect(() => {
    setIsEnabled(enabled);
  }, [enabled]);

  const handleToggle = () => {
    if (disabled) return;
    const newState = !isEnabled;
    setIsEnabled(newState);
    if (setEnabled) setEnabled(newState);
  };

  // Size classes
  const sizeClasses = {
    sm: {
      container: "h-5 w-9",
      knob: "h-4 w-4",
      translate: "translate-x-4",
    },
    md: {
      container: "h-6 w-11",
      knob: "h-5 w-5",
      translate: "translate-x-5",
    },
    lg: {
      container: "h-7 w-14",
      knob: "h-6 w-6",
      translate: "translate-x-7",
    },
  };

  // Color classes
  const colorClasses = {
    indigo: {
      on: "bg-indigo-600",
      off: "bg-gray-200",
      ring: "ring-indigo-500",
    },
    blue: {
      on: "bg-blue-600",
      off: "bg-gray-200",
      ring: "ring-blue-500",
    },
    green: {
      on: "bg-green-600",
      off: "bg-gray-200",
      ring: "ring-green-500",
    },
    red: {
      on: "bg-red-600",
      off: "bg-gray-200",
      ring: "ring-red-500",
    },
    yellow: {
      on: "bg-yellow-600",
      off: "bg-gray-200",
      ring: "ring-yellow-500",
    },
    purple: {
      on: "bg-purple-600",
      off: "bg-gray-200",
      ring: "ring-purple-500",
    },
  };

  return (
    <div
      className={`flex items-center ${
        labelPosition === "left" ? "flex-row-reverse" : ""
      }`}
    >
      {/* Toggle Switch */}
      <button
        type="button"
        id={id}
        className={`${
          sizeClasses[size].container
        } relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          colorClasses[color].ring
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${
          isEnabled ? colorClasses[color].on : colorClasses[color].off
        }`}
        onClick={handleToggle}
        disabled={disabled}
        aria-pressed={isEnabled}
      >
        <span
          className={`${
            sizeClasses[size].knob
          } pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            isEnabled ? sizeClasses[size].translate : "translate-x-0"
          }`}
        />
      </button>

      {/* Label */}
      {showLabel && label && (
        <label
          htmlFor={id}
          className={`ml-3 block text-sm font-medium text-gray-700 ${
            disabled ? "opacity-50" : ""
          }`}
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default Toggle;