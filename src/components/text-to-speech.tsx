"use client";

import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useState, useEffect } from "react";
import { useAccessibility } from "@/lib/hooks/use-accessibility";

interface TextToSpeechProps {
  text: string;
  className?: string;
  label?: string;
}

export function TextToSpeech({ text, className, label }: TextToSpeechProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { audioEnabled } = useAccessibility();

  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
  }, []);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = () => {
    if (!isSupported || !audioEnabled) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsLoading(false);
    } else {
      setIsLoading(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsLoading(false);
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsLoading(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsLoading(false);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  if (!isSupported || !audioEnabled) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSpeak}
      className={className}
      aria-label={label || (isSpeaking ? "Stop reading" : "Read aloud")}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isSpeaking ? (
        <VolumeX className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
      {label && <span className="ml-2">{label}</span>}
    </Button>
  );
}
