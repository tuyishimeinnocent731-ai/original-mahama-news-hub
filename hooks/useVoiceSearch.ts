
import { useState, useEffect, useCallback, useRef } from 'react';

// Polyfill for different browser vendors
// FIX: Cast window to `any` to access non-standard, vendor-prefixed properties without TypeScript errors.
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const useVoiceSearch = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState('');
    // FIX: Use `any` for the ref type because `SpeechRecognition` is a value (the constructor), not a type,
    // and its instance type is not defined in standard TypeScript DOM libraries.
    const recognitionRef = useRef<any | null>(null);

    const isSupported = !!SpeechRecognition;

    useEffect(() => {
        if (!isSupported) {
            setError('Voice search is not supported by your browser.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
            const currentTranscript = event.results[0][0].transcript;
            setTranscript(currentTranscript);
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            setError(`Voice recognition error: ${event.error}`);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [isSupported]);

    const startListening = useCallback(() => {
        if (isListening || !recognitionRef.current) {
            return;
        }
        setTranscript('');
        setError('');
        setIsListening(true);
        recognitionRef.current.start();
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (!isListening || !recognitionRef.current) {
            return;
        }
        setIsListening(false);
        recognitionRef.current.stop();
    }, [isListening]);

    return {
        isListening,
        transcript,
        error,
        isSupported,
        startListening,
        stopListening,
    };
};
