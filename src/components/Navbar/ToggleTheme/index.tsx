import { Button } from "@/components/ui/Button";
import { useTheme } from "@/components/ui/theme-provider";
import type { FC } from "react";
import { FaMoon, FaSun } from "react-icons/fa";

const ToggleTheme: FC = () => {
  const { theme, setTheme } = useTheme();
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <FaSun className="h-5 w-5" />
        ) : (
          <FaMoon className="h-5 w-5" />
        )}
      </Button>
    </>
  );
};

export default ToggleTheme;
