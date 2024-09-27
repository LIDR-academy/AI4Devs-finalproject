import { RocketLaunchIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import {
    getCurrentTripId,
    removeCurrentTripId,
    saveCurrentTripId,
} from '../utils/sessionUtils';
import { useLanguage } from '../context/LanguageContext';
import { useChatContext } from '../context/ChatContext';
import { getTrip } from '../services/tripService';

const LanguageToggleButton = ({ language, toggleLanguage }: LanguageToggleButtonProps) => (
    <button
        onClick={toggleLanguage}
        className="mt-2 bg-violet-500 rounded-full py-1 px-2 flex items-center hover:bg-violet-600 transition-colors text-white text-sm"
    >
        <GlobeAltIcon className="size-4 text-gray-600 mr-1 text-white" />
        {language === 'EN' ? 'Español' : 'English'}
    </button>
);

const TripList = ({ trips, handleTripClick, translator }: TripListProps) => (
    trips.length > 0 ? (
        <div className="flex flex-col space-y-2 pt-4">
            <div className="flex items-center space-x-1 pb-2">
                <RocketLaunchIcon className="size-6 text-gray-600" />
                <span className="font-semibold">{translator('trips')}</span>
            </div>
            <div className="space-y-2">
                {trips.map((trip: Trip) => (
                    <div
                        key={trip.id}
                        className="text-gray-800 pb-2 hover:text-violet-500 cursor-pointer"
                        onClick={() => handleTripClick(trip.id)}
                    >
                        <div>{trip.description}</div>
                    </div>
                ))}
            </div>
        </div>
    ) : (
        <div className="text-gray-600 pt-4">
            {translator('no-itineraries')}
        </div>
    )
);

const NewChatButton = ({ handleNewChat, translator }: NewChatButtonProps) => (
    <button
        onClick={handleNewChat}
        className="bg-violet-500 rounded-full py-2 px-4 mt-4 hover:bg-violet-600 transition-colors text-white"
    >
        {translator('btn-new-chat')}
    </button>
);

const UpgradeButton = ({ translator }: UpgradeButtonProps) => (
    <button onClick={() => {
        window.open('https://i.kym-cdn.com/entries/icons/original/000/005/574/takemymoney.jpg', '_blank');
    }} className="bg-violet-500 rounded-full py-2 px-4 mt-4 hover:bg-violet-600 transition-colors text-white">
        {translator('upgrade-to-pro')}
    </button>
);

export default function Sidebar() {
    const { language, setLanguage, translator }: LanguageContextProps = useLanguage();
    const { trips, clearChatSession, handleSend, setTripDetails }: ChatContextProps = useChatContext();

    const toggleLanguage = () => {
        setLanguage(language === 'EN' ? 'ES' : 'EN');
    };

    const handleTripClick = async (tripId: string) => {
        const currentTripId = getCurrentTripId();

        if (currentTripId && tripId !== currentTripId) {
            removeCurrentTripId();
            clearChatSession();
        }

        saveCurrentTripId(tripId);

        const tripDetails = await getTrip(tripId);
        setTripDetails(tripDetails);
        handleSend(JSON.stringify(tripDetails));
    };

    return (
        <div className="sidebar w-full lg:w-64 h-full p-4 flex flex-col border-r-2 border-gray-100 flex-shrink-0">
            <div className="flex flex-col items-center">
                <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-Z3vqK1WAdvhcavo10sL6QxLv3IdVRd.png"
                    alt="IkiGoo Logo"
                    className="h-48 lg:h-full"
                />
            </div>
            <nav className="space-y-4 flex-grow">
                <div className="flex justify-center pb-4">
                    <LanguageToggleButton language={language} toggleLanguage={toggleLanguage} />
                </div>
                <TripList trips={trips} handleTripClick={handleTripClick} translator={translator} />
            </nav>
            {trips.length === 3 ? (
                <UpgradeButton translator={translator} />
            ) : (
                <NewChatButton handleNewChat={() => {window.location.reload()}} translator={translator} />
            )}
        </div>
    );
}