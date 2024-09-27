// Trip
export interface Trip {
    id: string;
    description: string;
    tripId: string;
    threadId: string;
}

export interface TripInfo {
    tripId: string;
    threadId: string;
}

// Chat
export interface Message {
    role: string;
    content: string;
}

export interface MessageListProps {
    messages: Message[];
}

export interface ChatInputProps {
    inputValue: string;
    setInputValue: (value: string) => void;
    handleSend: () => void;
    isLoading: boolean;
    placeholder: string;
    translator: (key: string) => string;
}

export interface ChatProps {
    inputValue: string;
    setInputValue: (value: string) => void;
    tripTitle: string | null;
    messages: { role: string; content: string }[];
    handleSend: () => void;
    isLoading: boolean;
    tripProperties: { [key: string]: any };
    tripItinerary: string[];
}

interface SessionContextProps {
    sessionId: string;
}

// Itinerary
export interface ItineraryProps {
    tripProperties: { [key: string]: any };
    tripItinerary: string[];
}

export interface ItineraryDetailsProps {
    tripProperties: { [key: string]: any };
    tripItinerary: string[];
    translator: (key: string) => string;
    formatDate: (date: string) => string;
}

export interface LoadingItineraryProps {
    translator: (key: string) => string;
}

// Sidebar components
export interface UpgradeButtonProps {
    translator: (key: string) => string;
}

export interface NewChatButtonProps {
    handleNewChat: () => void;
    translator: (key: string) => string;
}

export interface TripListProps {
    trips: Trip[];
    handleTripClick: (tripId: string) => void;
    translator: (key: string) => string;
}

// Language and locales
export type Language = 'EN' | 'ES';

export interface LanguageContextProps {
    language: Language;
    setLanguage: (language: Language) => void;
    translator: (key: string) => string;
}

export interface ChatContextProps {
    trips: Trip[];
    fetchTrips: () => void;
    clearChatSession: () => void;
    handleSend: (message: string) => void;
    setTripDetails: (tripDetails: any) => void;
}

export interface LanguageToggleButtonProps {
    language: string;
    toggleLanguage: () => void;
}

type LocaleMessage = {
    key: string;
    value: string;
};

type Locale = {
    language: string;
    messages: LocaleMessage[];
};

type LocalesData = {
    locales: Locale[];
};

// Typewriter
interface TypewriterEffectProps {
    text: string;
    speed?: number;
    onType?: () => void;
}