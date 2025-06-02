import { useState, type KeyboardEvent, type FC, type ChangeEvent } from 'react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  label?: string;
}

export const TagInput: FC<TagInputProps> = ({ value = [], onChange, label }) => {
  const [input, setInput] = useState<string>("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim() !== "") {
      e.preventDefault();
      const trimmed = input.trim();
      if (!value.includes(trimmed)) {
        onChange([...value, trimmed]);
        setInput("");
      }
    }
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <div>
      {label && <label>{label}</label>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
        {value.map((tag, i) => (
          <div
            key={i}
            style={{ background: "#000" , color: "#FFF", padding: "4px 8px", borderRadius: "4px", display: "flex", alignItems: "center" }}
          >
            {tag}
            <button onClick={() => removeTag(tag)} style={{ marginLeft: "4px" }}>x</button>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Press Enter to add tag"
        style={{ marginTop: "8px", width: "100%", padding: "4px" }}
      />
    </div>
  );
};