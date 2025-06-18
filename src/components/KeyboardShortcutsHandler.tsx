import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

// This component just handles keyboard shortcuts
export function KeyboardShortcutsHandler() {
  useKeyboardShortcuts();
  return null; // This component doesn't render anything
}
