import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { CalendarIcon, UserIcon, LogOutIcon, PlusIcon, MessageSquareIcon, Menu, Mountain } from 'lucide-react'
import Link from 'next/link'

// Simulated AI responses
const aiResponses = [
  "Great! Let's plan your trip. Where would you like to go?",
  "Excellent choice! How long are you planning to stay?",
  "Got it. What's your budget for this trip?",
  "Thanks for the information. Here are three itinerary suggestions for you:",
]

const itineraries = [
  {
    title: "Budget-Friendly City Explorer",
    description: "A 5-day trip focused on free attractions and affordable dining.",
    price: "$800",
    highlights: ["City walking tour", "Visit to public museums", "Picnic in central park"],
  },
  {
    title: "Luxury Getaway",
    description: "A 7-day trip with high-end accommodations and exclusive experiences.",
    price: "$3000",
    highlights: ["5-star hotel stay", "Private guided tours", "Michelin-star restaurant reservations"],
  },
  {
    title: "Adventure Seeker's Dream",
    description: "An 8-day trip packed with outdoor activities and local experiences.",
    price: "$1500",
    highlights: ["Hiking in national parks", "White-water rafting", "Local cooking class"],
  },
]

// Simulated conversation list
const conversations = [
  { id: 1, title: "Summer vacation in Europe" },
  { id: 2, title: "Weekend getaway to the mountains" },
  { id: 3, title: "Family trip to Disneyland" },
  { id: 4, title: "Backpacking through Southeast Asia" },
]

export default function TripPlanner() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [showItineraries, setShowItineraries] = useState(false)

  const handleSendMessage = () => {
    if (input.trim() === '') return

    const newMessages = [...messages, { text: input, sender: 'user' }]
    setMessages(newMessages)
    setInput('')

    // Simulate AI response
    setTimeout(() => {
      if (currentQuestion < aiResponses.length - 1) {
        setMessages([...newMessages, { text: aiResponses[currentQuestion], sender: 'ai' }])
        setCurrentQuestion(currentQuestion + 1)
      } else {
        setShowItineraries(true)
      }
    }, 1000)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  useEffect(() => {
    // Initial AI message
    setMessages([{ text: aiResponses[0], sender: 'ai' }])
  }, [])

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Conversations */}
      <div className="w-64 border-r hidden md:block">
        <div className="p-4">
          <Button className="w-full" variant="outline">
            <PlusIcon className="w-4 h-4 mr-2" />
            New Trip
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-5rem)]">
          {conversations.map((conversation) => (
            <Button
              key={conversation.id}
              variant="ghost"
              className="w-full justify-start px-4 py-2 text-left"
            >
              <MessageSquareIcon className="w-4 h-4 mr-2" />
              {conversation.title}
            </Button>
          ))}
        </ScrollArea>
      </div>

      {/* Middle Column - Chat Interface */}
      <div className="flex-1 flex flex-col">
        <header className="flex items-center h-16 px-4 border-b shrink-0 md:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="grid gap-2 py-6">
                {conversations.map((conversation) => (
                  <Button
                    key={conversation.id}
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    <MessageSquareIcon className="w-4 h-4 mr-2" />
                    {conversation.title}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex items-center ml-auto space-x-4">
            <Button variant="ghost" size="icon">
              <CalendarIcon className="h-6 w-6" />
              <span className="sr-only">Calendar</span>
            </Button>
            <Button variant="ghost" size="icon">
              <UserIcon className="h-6 w-6" />
              <span className="sr-only">User profile</span>
            </Button>
            <Button variant="ghost" size="icon">
              <LogOutIcon className="h-6 w-6" />
              <span className="sr-only">Log out</span>
            </Button>
          </div>
        </header>
        <ScrollArea className="flex-grow p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`rounded-lg p-2 max-w-sm ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
          {showItineraries && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Suggested Itineraries</h2>
              {itineraries.map((itinerary, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{itinerary.title}</CardTitle>
                    <CardDescription>{itinerary.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-bold">Price: {itinerary.price}</p>
                    <ul className="list-disc list-inside">
                      {itinerary.highlights.map((highlight, i) => (
                        <li key={i}>{highlight}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button onClick={handleSendMessage}>Send</Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Options (hidden on mobile) */}
      <div className="w-64 border-l hidden lg:block">
        <ScrollArea className="h-screen">
          <div className="p-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Calendar
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <UserIcon className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-100">
              <LogOutIcon className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}