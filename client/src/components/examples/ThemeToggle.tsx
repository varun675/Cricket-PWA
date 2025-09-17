import { ThemeProvider } from 'next-themes';
import ThemeToggle from '../ThemeToggle';

export default function ThemeToggleExample() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="p-4 flex items-center justify-center">
        <ThemeToggle />
      </div>
    </ThemeProvider>
  );
}