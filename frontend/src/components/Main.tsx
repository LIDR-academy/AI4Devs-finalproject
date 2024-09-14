import React, { useState } from 'react';

export default function MainPage() {
  const [activeTab, setActiveTab] = useState('Itinerary');

  return (
    <div className="flex h-screen bg-white text-black">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 p-4 flex flex-col">
        <div className="flex flex-col items-center mb-8">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-Z3vqK1WAdvhcavo10sL6QxLv3IdVRd.png"
            alt="IkiGoo Logo"
            className="mb-2 w-24 h-24"
          />
        </div>
        <nav className="space-y-4 flex-grow">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16h6M21 12c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8z"></path>
              </svg>
              <span className="font-semibold">Chats</span>
            </div>
            <div className="pl-8 space-y-2">
              <div className="text-sm text-gray-600 hover:text-black cursor-pointer">London Solo Adventure</div>
              <div className="text-sm text-gray-600 hover:text-black cursor-pointer">Paris Family Trip</div>
              <div className="text-sm text-gray-600 hover:text-black cursor-pointer">Tokyo Tech Tour</div>
            </div>
          </div>
        </nav>
        <button className="bg-gray-200 rounded-full py-2 px-4 mt-4 hover:bg-gray-300 transition-colors">New chat</button>
      </div>

      {/* Main content */}
      <div className="flex-grow flex">
        {/* Chat section */}
        <div className="w-1/2 border-r border-gray-200 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">London Solo Adventure: 3 Days of Culture</h2>
            <button className="text-gray-600 font-semibold hover:text-black">Sign up to save trip</button>
          </div>
          <div className="flex space-x-2 mb-4">
            <button className="bg-black text-white rounded-full px-4 py-1 hover:bg-gray-800">Chat</button>
          </div>
          <h1 className="text-3xl font-bold mb-4">Where to today?</h1>
          <div className="bg-gray-100 rounded-lg p-3 mb-4">
            trip to london, 3 days, cultural and solo travel
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
            <p className="mb-2">Great, let's plan your cultural trip to London! Here is a suggested itinerary for your 3-day adventure:</p>
            <p className="mb-2">Day 1: Arrival and Exploration</p>
            <p className="mb-2">Welcome to London! Upon your arrival, check into your hotel, The Savoy. After settling in, start your exploration with a visit to the British Museum. In the evening, enjoy a delightful dinner at Rules Restaurant, one of the oldest restaurants in London.</p>
            <p className="mb-2">Day 2: Historical Landmarks</p>
            <p className="mb-2">Begin your day with a visit to Buckingham Palace to witness the Changing of the Guard. Next, head to The Tower of London to explore its rich history and see the Crown Jewels. For lunch, try The Ivy, a classic London dining spot. In the afternoon, take a stroll along the Thames River and visit the Tower Bridge. End your day with a West End show at the Lyceum Theatre.</p>
            <p className="mb-2">Day 3: Art and Culture</p>
            <p className="mb-2">Start your final day with a visit to the Tate Modern. Afterward, walk to St. Paul's Cathedral and climb up to the Whispering Gallery for a stunning view of the city. Enjoy lunch at Sketch, known for its unique decor and afternoon tea. In the afternoon, explore The Victoria and Albert Museum. Conclude your cultural trip with a dinner at Le Gavroche, a Michelin-starred restaurant.</p>
          </div>
        </div>

        {/* Itinerary section */}
        <div className="w-1/2 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold">London Solo Adventure: 3 Days of Culture</h2>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
            <span>London</span>
            <span>3 days</span>
            <span>2 travelers</span>
            <span>Budget</span>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
            <h3 className="font-semibold mb-2">Itinerary</h3>
            <div className="space-y-4">
              {/* Day 1 */}
              <div>
                <h4 className="font-semibold">Day 1</h4>
                <ul className="list-disc list-inside">
                  <li>Arrive in London</li>
                  <li>Check-in at The Savoy</li>
                  <li>Visit British Museum</li>
                  <li>Dinner at Rules Restaurant</li>
                </ul>
              </div>
              {/* Day 2 */}
              <div>
                <h4 className="font-semibold">Day 2</h4>
                <ul className="list-disc list-inside">
                  <li>Visit Buckingham Palace (Changing of the Guard)</li>
                  <li>Explore The Tower of London</li>
                  <li>Lunch at The Ivy</li>
                  <li>Walk along Thames River</li>
                  <li>Visit Tower Bridge</li>
                  <li>Evening: West End show at Lyceum Theatre</li>
                </ul>
              </div>
              {/* Day 3 */}
              <div>
                <h4 className="font-semibold">Day 3</h4>
                <ul className="list-disc list-inside">
                  <li>Visit Tate Modern</li>
                  <li>Explore St. Paul's Cathedral</li>
                  <li>Lunch at Sketch</li>
                  <li>Visit The Victoria and Albert Museum</li>
                  <li>Dinner at Le Gavroche</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}