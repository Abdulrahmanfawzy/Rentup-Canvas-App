import { useState } from "react";
import { Button } from "./Button";
import { HelpCircle, X } from "lucide-react";

const shortcuts = [
  { key: "Delete/Backspace", description: "Delete selected element" },
  { key: "Escape", description: "Deselect all elements" },
  { key: "Ctrl + C", description: "Copy selected element" },
  { key: "Ctrl + V", description: "Paste element" },
  { key: "Ctrl + Z", description: "Undo" },
  { key: "Ctrl + Shift + Z", description: "Redo" },
  { key: "Ctrl + Y", description: "Redo" },
  { key: "Ctrl + A", description: "Select first element" },
  { key: "Ctrl + E", description: "Export as PNG" },
  { key: "Ctrl + S", description: "Save as JSON" },
  { key: "R", description: "Add Rectangle" },
  { key: "O", description: "Add Circle" },
  { key: "T", description: "Add Text" },
  { key: "F", description: "Add Frame" },
  { key: "Arrow Keys", description: "Move selected element (1px)" },
  { key: "Shift + Arrow Keys", description: "Move selected element (10px)" },
];

export function ShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        title="Keyboard Shortcuts"
      >
        <HelpCircle className="h-5 w-5" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {shortcut.description}
                  </span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Note: Shortcuts are disabled when typing in input fields.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
