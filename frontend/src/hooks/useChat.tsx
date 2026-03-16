import { useReducer, useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import isEqual from 'lodash.isequal';
import {
  saveCurrentTripId,
  getCurrentTripId
} from '../utils/sessionUtils';
import { validateAndFormatDate } from '../utils/dateUtils';
import { useLanguage } from '../context/LanguageContext';
import { sendMessage } from '../services/chatService';
import { saveTrip as saveTripDB, saveTripActivities } from '../services/tripService';

const USER_ROLE = 'user';
const ASSISTANT_ROLE = 'assistant';

const initialState = {
  inputValue: '',
  currentThreadId: null as string | null,
  tripTitle: null as string | null,
  tripProperties: {} as { [key: string]: any },
  tripItinerary: [] as string[],
  isLoading: false,
};

type State = typeof initialState;

type Action =
  | { type: 'SET_INPUT_VALUE'; payload: string }
  | { type: 'SET_CURRENT_THREAD_ID'; payload: string | null }
  | { type: 'SET_TRIP_TITLE'; payload: string | null }
  | { type: 'SET_TRIP_PROPERTIES'; payload: { [key: string]: any } }
  | { type: 'SET_TRIP_ITINERARY'; payload: string[] }
  | { type: 'SET_IS_LOADING'; payload: boolean }
  | { type: 'CLEAR_CHAT_SESSION' };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_INPUT_VALUE':
      return { ...state, inputValue: action.payload };
    case 'SET_CURRENT_THREAD_ID':
      return { ...state, currentThreadId: action.payload };
    case 'SET_TRIP_TITLE':
      return { ...state, tripTitle: action.payload };
    case 'SET_TRIP_PROPERTIES':
      return { ...state, tripProperties: action.payload };
    case 'SET_TRIP_ITINERARY':
      return { ...state, tripItinerary: action.payload };
    case 'SET_IS_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

export function useChat(fetchTrips: () => void) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setInputValue = (inputValue: string) => dispatch({ type: 'SET_INPUT_VALUE', payload: inputValue });
  const setCurrentThreadId = (currentThreadId: string | null) => dispatch({ type: 'SET_CURRENT_THREAD_ID', payload: currentThreadId });
  const setTripTitle = (tripTitle: string | null) => dispatch({ type: 'SET_TRIP_TITLE', payload: tripTitle });
  const setTripProperties = (tripProperties: { [key: string]: any }) => dispatch({ type: 'SET_TRIP_PROPERTIES', payload: tripProperties });
  const setTripItinerary = (tripItinerary: string[]) => dispatch({ type: 'SET_TRIP_ITINERARY', payload: tripItinerary });
  const setIsLoading = (isLoading: boolean) => dispatch({ type: 'SET_IS_LOADING', payload: isLoading });

  const [messages, setMessages] = useState<Message[]>([]);

  const prevTripTitle = useRef<string | null>(null);
  const prevTripProperties = useRef<{ [key: string]: any }>({});
  const prevTripItinerary = useRef<string[]>([]);
  const { translator } = useLanguage();

  const handleSend = async (forcedPrompt: string = '') => {
    if (
      state.inputValue.trim() === '' &&
      (!forcedPrompt ||
      typeof forcedPrompt !== 'string')
    ) return;

    const prompt: string = state.inputValue ? state.inputValue : forcedPrompt;
    
    const userMessage: Message = { role: USER_ROLE, content: prompt };

    if (state.inputValue) {
      setMessages((prevMessages) => [...prevMessages, userMessage]);
    } else {
      setMessages((prevMessages) => [...prevMessages, { role: USER_ROLE, content: translator('recovering-conversation') }]);
    }

    setInputValue('');
    setIsLoading(true);

    try {
      const { response } = await sendMessage(prompt, state.currentThreadId);
      const { assistantMessage, updatedTripProperties } = processAssistantResponse(response);

      setTripTitle(response.title);
      setTripItinerary(response.itinerary);

      if (!state.currentThreadId && response.threadId) {
        setCurrentThreadId(response.threadId);
      }

      if (response.tripId) {
        saveCurrentTripId(response.tripId);
      }

      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      setTripProperties(updatedTripProperties);
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processAssistantResponse = (response: any) => {
    const assistantMessage: Message = { role: ASSISTANT_ROLE, content: response.message };
    const updatedTripProperties = { ...response.properties };

    if (updatedTripProperties.startDate) {
      const formattedStartDate = validateAndFormatDate(updatedTripProperties.startDate);
      if (formattedStartDate && dayjs(formattedStartDate, 'YYYY-MM-DD', true).isValid()) {
        updatedTripProperties.startDate = formattedStartDate;
      } else {
        console.warn('Invalid startDate format:', updatedTripProperties.startDate);
        delete updatedTripProperties.startDate;
      }
    }

    if (updatedTripProperties.endDate) {
      const formattedEndDate = validateAndFormatDate(updatedTripProperties.endDate);
      if (formattedEndDate && dayjs(formattedEndDate, 'YYYY-MM-DD', true).isValid()) {
        updatedTripProperties.endDate = formattedEndDate;
      } else {
        console.warn('Invalid endDate format:', updatedTripProperties.endDate);
        delete updatedTripProperties.endDate;
      }
    }

    return {
      assistantMessage,
      updatedTripProperties
    }
  };

  const setTripDetails = (tripDetails: any) => {
    setTripTitle(tripDetails.description);
    setTripProperties({
      destination: tripDetails.destination,
      startDate: tripDetails.startDate,
      endDate: tripDetails.endDate,
      accompaniment: tripDetails.accompaniment,
      activityType: tripDetails.activityType,
      budgetMax: tripDetails.budgetMax,
    });

    const sortedActivities = tripDetails.activities
      .sort((a: any, b: any) => parseInt(a.sequence) - parseInt(b.sequence))
      .map((activity: any) => activity.description);

    setTripItinerary(sortedActivities);
  };

  const clearChatSession = () => {
    setMessages([]);
  };

  useEffect(() => {
    const saveTrip = async () => {
      const tripTitleChanged = state.tripTitle !== prevTripTitle.current;
      const tripPropertiesChanged = !isEqual(state.tripProperties, prevTripProperties.current);
      const tripItineraryChanged = !isEqual(state.tripItinerary, prevTripItinerary.current);

      if (tripTitleChanged || tripPropertiesChanged || tripItineraryChanged) {
        if (state.tripTitle) {
          await saveTripData();
          await saveTripItinerary();
        }

        prevTripTitle.current = state.tripTitle;
        if (state.tripProperties) {
          prevTripProperties.current = { ...state.tripProperties };
        }
        if (state.tripItinerary && state.tripItinerary.length > 0) {
          prevTripItinerary.current = [...state.tripItinerary];
        }
      }
    };

    const saveTripData = async () => {
      const tripId = getCurrentTripId();
      try {
        const tripData = {
          id: tripId || undefined,
          destination: state.tripProperties.destination,
          startDate: state.tripProperties.startDate,
          endDate: state.tripProperties.endDate,
          description: state.tripTitle,
          accompaniment: state.tripProperties.accompaniment,
          activityType: state.tripProperties.activityType,
          budgetMax: state.tripProperties.budgetMax,
        };

        const filteredTripData = Object.fromEntries(
          Object.entries(tripData).filter(([_, value]) => value !== undefined && value !== '')
        );

        const response = await saveTripDB(filteredTripData);

        if (!tripId) {
          saveCurrentTripId(response.id);
        }

        fetchTrips();
      } catch (error) {
        console.error('Error al guardar el itinerario:', error);
      }
    };

    const saveTripItinerary = async () => {
      if (Array.isArray(state.tripItinerary)) {
        try {
          const tripId = getCurrentTripId();
          if (tripId) {
            await saveTripActivities(tripId, state.tripItinerary);
          }
        } catch (error) {
          console.error('Error al guardar el itinerario:', error);
        }
      }
    };

    saveTrip();
  }, [state.tripTitle, state.tripProperties, state.tripItinerary, fetchTrips]);

  return {
    messages,
    inputValue: state.inputValue,
    tripTitle: state.tripTitle,
    tripProperties: state.tripProperties,
    tripItinerary: state.tripItinerary,
    isLoading: state.isLoading,
    setInputValue,
    handleSend,
    setCurrentThreadId,
    setTripDetails,
    clearChatSession,
  };
}