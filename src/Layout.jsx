import React from 'react';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { Toaster } from "@/components/ui/sonner";

export default function Layout({ children }) {
  return (
    <ThemeProvider>
      <style>{`
        :root {
          --background: 0 0% 100%;
          --foreground: 240 10% 3.9%;
          --card: 0 0% 100%;
          --card-foreground: 240 10% 3.9%;
          --popover: 0 0% 100%;
          --popover-foreground: 240 10% 3.9%;
          --primary: 262 83% 58%;
          --primary-foreground: 0 0% 100%;
          --secondary: 262 20% 97%;
          --secondary-foreground: 262 83% 58%;
          --muted: 240 4.8% 95.9%;
          --muted-foreground: 240 3.8% 46.1%;
          --accent: 262 20% 97%;
          --accent-foreground: 262 83% 58%;
          --destructive: 0 84.2% 60.2%;
          --destructive-foreground: 0 0% 100%;
          --border: 240 5.9% 90%;
          --input: 240 5.9% 90%;
          --ring: 262 83% 58%;
          --radius: 0.75rem;
          --chart-1: 262 83% 58%;
          --chart-2: 280 65% 60%;
          --chart-3: 220 70% 50%;
          --chart-4: 43 74% 66%;
          --chart-5: 330 81% 60%;
        }

        .dark {
          --background: 240 10% 3.9%;
          --foreground: 0 0% 98%;
          --card: 240 10% 7%;
          --card-foreground: 0 0% 98%;
          --popover: 240 10% 7%;
          --popover-foreground: 0 0% 98%;
          --primary: 214 100% 50%;
          --primary-foreground: 0 0% 100%;
          --secondary: 240 3.7% 15.9%;
          --secondary-foreground: 0 0% 98%;
          --muted: 240 3.7% 15.9%;
          --muted-foreground: 240 5% 64.9%;
          --accent: 240 3.7% 15.9%;
          --accent-foreground: 0 0% 98%;
          --destructive: 0 62.8% 30.6%;
          --destructive-foreground: 0 0% 98%;
          --border: 240 3.7% 15.9%;
          --input: 240 3.7% 15.9%;
          --ring: 214 100% 50%;
          --chart-1: 214 100% 50%;
          --chart-2: 280 65% 60%;
          --chart-3: 173 58% 39%;
          --chart-4: 43 74% 66%;
          --chart-5: 330 81% 60%;
        }

        * {
          transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }

        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }

        body {
          font-feature-settings: "rlig" 1, "calt" 1;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
        }

        .dark .card-hover:hover {
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.3);
        }

        .perspective-1000 {
          perspective: 1000px;
        }

        .transform-style-3d {
          transform-style: preserve-3d;
        }

        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
      <div className="min-h-screen bg-background text-foreground">
        {children}
      </div>
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}