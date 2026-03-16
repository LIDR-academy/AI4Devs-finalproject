import Sidebar from './Sidebar';
import Chat from './Chat';
import Itinerary from './Itinerary';
import { useChatContext } from '../context/ChatContext';

export default function MainPage() {
  const chat = useChatContext();

  return (
    <div className="flex h-screen bg-white text-black">
      <div className="hidden lg:flex">
        <Sidebar />
      </div>
      <div className="flex-grow flex">
        <Chat 
          inputValue={chat.inputValue}
          setInputValue={chat.setInputValue}
          tripTitle={chat.tripTitle}
          tripProperties={chat.tripProperties} 
          tripItinerary={chat.tripItinerary} 
          messages={chat.messages}
          handleSend={chat.handleSend}
          isLoading={chat.isLoading}
        />
        <div className="hidden lg:flex lg:w-1/2">
          <Itinerary 
            tripProperties={chat.tripProperties} 
            tripItinerary={chat.tripItinerary} 
          />
        </div>
      </div>
    </div>
  );
}