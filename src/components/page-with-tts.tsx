"use client";

import { TextToSpeech } from "@/components/text-to-speech";
import { useEffect, useState } from "react";

interface PageWithTTSProps {
  children: React.ReactNode;
  contentSelector?: string;
}

export function PageWithTTS({ children, contentSelector = "main" }: PageWithTTSProps) {
  const [pageText, setPageText] = useState("");

  useEffect(() => {
    const extractText = () => {
      const contentElement = document.querySelector(contentSelector);
      if (contentElement) {
        // Get all text content, remove extra whitespace
        const text = contentElement.textContent?.replace(/\s+/g, ' ').trim() || "";
        setPageText(text);
      }
    };

    // Extract after a short delay to ensure content is rendered
    const timer = setTimeout(extractText, 100);
    return () => clearTimeout(timer);
  }, [contentSelector, children]);

  return (
    <>
      {pageText && (
        <div className="fixed bottom-24 right-6 z-40">
          <TextToSpeech 
            text={pageText} 
            label="Read Page"
            className="shadow-lg rounded-full h-12 px-4"
          />
        </div>
      )}
      {children}
    </>
  );
}
