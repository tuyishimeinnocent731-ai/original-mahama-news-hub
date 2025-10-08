import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';
import { useToast } from '../contexts/ToastContext';
import * as audioUtils from '../utils/audioUtils';
import Modal from './Modal';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { UserIcon } from './icons/UserIcon';
import { CloseIcon } from './icons/CloseIcon';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface LiveAssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'error' | 'closed';
interface TranscriptionTurn {
    speaker: 'user' | 'model';
    text: string;
}

const LiveAssistantModal: React.FC<LiveAssistantModalProps> = ({ isOpen, onClose }) => {
    const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
    const [transcription, setTranscription] = useState<TranscriptionTurn[]>([]);
    const [isListening, setIsListening] = useState(false);

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    
    const currentInputTranscription = useRef('');
    const currentOutputTranscription = useRef('');
    const nextStartTime = useRef(0);
    const sources = useRef(new Set<AudioBufferSourceNode>());

    const { addToast } = useToast();
    const transcriptEndRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcription]);

    const stopConversation = () => {
        setIsListening(false);

        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => {
                session.close();
            });
            sessionPromiseRef.current = null;
        }
        
        scriptProcessorRef.current?.disconnect();
        scriptProcessorRef.current = null;
        
        audioContextRef.current?.close();
        audioContextRef.current = null;
        
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        
        setConnectionState('closed');
    };
    
    const handleClose = () => {
        stopConversation();
        onClose();
    };


    const startConversation = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            addToast('Your browser does not support audio recording.', 'error');
            return;
        }
        
        setConnectionState('connecting');
        setTranscription([]);
        
        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            setIsListening(true);

            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setConnectionState('connected');
                        if (!streamRef.current || !audioContextRef.current) return;
                        
                        const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
                        scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = audioUtils.createPcmBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(audioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.outputTranscription) {
                            currentOutputTranscription.current += message.serverContent.outputTranscription.text;
                        }
                        if (message.serverContent?.inputTranscription) {
                            currentInputTranscription.current += message.serverContent.inputTranscription.text;
                        }

                        if (message.serverContent?.turnComplete) {
                            setTranscription(prev => [
                                ...prev,
                                { speaker: 'user', text: currentInputTranscription.current },
                                { speaker: 'model', text: currentOutputTranscription.current }
                            ]);
                            currentInputTranscription.current = '';
                            currentOutputTranscription.current = '';
                        }
                        
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio && outputAudioContextRef.current) {
                            const ctx = outputAudioContextRef.current;
                            nextStartTime.current = Math.max(nextStartTime.current, ctx.currentTime);
                            const audioBuffer = await audioUtils.decodeAudioData(audioUtils.decode(base64Audio), ctx, 24000, 1);
                            
                            const source = ctx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(ctx.destination);
                            source.addEventListener('ended', () => sources.current.delete(source));
                            source.start(nextStartTime.current);
                            nextStartTime.current += audioBuffer.duration;
                            sources.current.add(source);
                        }

                        if (message.serverContent?.interrupted) {
                            sources.current.forEach(s => s.stop());
                            sources.current.clear();
                            nextStartTime.current = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        addToast('Connection error. Please try again.', 'error');
                        setConnectionState('error');
                    },
                    onclose: (e: CloseEvent) => {
                        setConnectionState('closed');
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    systemInstruction: 'You are a friendly and helpful news assistant.'
                },
            });

        } catch (err) {
            console.error("Failed to get media stream", err);
            addToast('Microphone access was denied. Please enable it in your browser settings.', 'error');
            setConnectionState('error');
            setIsListening(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className="flex flex-col h-[70vh] min-h-[500px]">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <SparklesIcon className="text-accent"/>
                        Live AI Assistant
                    </h3>
                    <button onClick={handleClose}><CloseIcon/></button>
                </div>
                
                <div className="flex-grow p-4 overflow-y-auto bg-secondary/50 space-y-4">
                   {transcription.map((turn, index) => (
                       <div key={index} className={`flex items-start gap-3 ${turn.speaker === 'user' ? 'justify-end' : ''}`}>
                           {turn.speaker === 'model' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><SparklesIcon className="w-5 h-5"/></div>}
                           <div className={`p-3 rounded-lg max-w-xs md:max-w-md ${turn.speaker === 'user' ? 'bg-accent text-accent-foreground' : 'bg-card text-card-foreground shadow-sm'}`}>
                               <p>{turn.text}</p>
                           </div>
                           {turn.speaker === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center"><UserIcon className="w-5 h-5"/></div>}
                       </div>
                   ))}
                   <div ref={transcriptEndRef} />
                </div>
                
                 <div className="p-4 border-t border-border">
                    <div className="flex flex-col items-center gap-3">
                         {isListening ? (
                             <button onClick={stopConversation} className="w-20 h-20 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-lg animate-pulse-border">
                                <MicrophoneIcon />
                             </button>
                         ) : (
                             <button onClick={startConversation} disabled={connectionState === 'connecting'} className="w-20 h-20 bg-accent text-accent-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-accent/90 disabled:bg-muted">
                                <MicrophoneIcon />
                            </button>
                         )}
                         <span className="text-sm text-muted-foreground capitalize">
                             {connectionState === 'connecting' ? 'Connecting...' : connectionState}
                         </span>
                    </div>
                 </div>
            </div>
        </Modal>
    );
};

export default LiveAssistantModal;
