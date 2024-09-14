CREATE DATABASE ikigoo;

-- Create User table
CREATE TABLE "User" (
    ID UUID PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    CreationDate DATE NOT NULL,
    LastLogin DATE
);

-- Create Preferences table
CREATE TABLE Preferences (
    ID UUID PRIMARY KEY,
    UserID UUID NOT NULL REFERENCES "User"(ID),
    Budget INTEGER NOT NULL
);

-- Create TravelType table
CREATE TABLE TravelType (
    ID UUID PRIMARY KEY,
    Type VARCHAR(50) NOT NULL
);

-- Create MobilityType table
CREATE TABLE MobilityType (
    ID UUID PRIMARY KEY,
    Type VARCHAR(50) NOT NULL
);

-- Create AccommodationType table
CREATE TABLE AccommodationType (
    ID UUID PRIMARY KEY,
    Type VARCHAR(50) NOT NULL
);

-- Create City table
CREATE TABLE City (
    ID UUID PRIMARY KEY,
    Name VARCHAR(255) NOT NULL
);

-- Create TravelPreference table
CREATE TABLE TravelPreference (
    ID UUID PRIMARY KEY,
    PreferencesID UUID NOT NULL REFERENCES Preferences(ID),
    TravelTypeID UUID NOT NULL REFERENCES TravelType(ID)
);

-- Create MobilityPreference table
CREATE TABLE MobilityPreference (
    ID UUID PRIMARY KEY,
    PreferencesID UUID NOT NULL REFERENCES Preferences(ID),
    MobilityTypeID UUID NOT NULL REFERENCES MobilityType(ID)
);

-- Create AccommodationPreference table
CREATE TABLE AccommodationPreference (
    ID UUID PRIMARY KEY,
    PreferencesID UUID NOT NULL REFERENCES Preferences(ID),
    AccommodationTypeID UUID NOT NULL REFERENCES AccommodationType(ID)
);

-- Create FavoritePlace table
CREATE TABLE FavoritePlace (
    ID UUID PRIMARY KEY,
    PreferencesID UUID NOT NULL REFERENCES Preferences(ID),
    CityID UUID NOT NULL REFERENCES City(ID)
);

-- Create VisitedPlace table
CREATE TABLE VisitedPlace (
    ID UUID PRIMARY KEY,
    PreferencesID UUID NOT NULL REFERENCES Preferences(ID),
    CityID UUID NOT NULL REFERENCES City(ID)
);

-- Create Trip table
CREATE TABLE Trip (
    ID UUID PRIMARY KEY,
    UserID UUID NOT NULL REFERENCES "User"(ID),
    Name VARCHAR(255) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE,
    Description TEXT
);

-- Create Itinerary table
CREATE TABLE Itinerary (
    ID UUID PRIMARY KEY,
    TripID UUID NOT NULL REFERENCES Trip(ID),
    Destination VARCHAR(255) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE,
    Description TEXT
);

-- Create Activity table
CREATE TABLE Activity (
    ID UUID PRIMARY KEY,
    ItineraryID UUID NOT NULL REFERENCES Itinerary(ID),
    Name VARCHAR(255) NOT NULL,
    Description TEXT,
    Sequence INTEGER NOT NULL,
    DateTime TIMESTAMP NOT NULL
);

-- Create Transport table
CREATE TABLE Transport (
    ID UUID PRIMARY KEY,
    ItineraryID UUID NOT NULL REFERENCES Itinerary(ID),
    Type VARCHAR(50) NOT NULL,
    Description TEXT,
    Origin VARCHAR(255) NOT NULL,
    Destination VARCHAR(255) NOT NULL,
    Sequence INTEGER NOT NULL,
    DepartureDate TIMESTAMP NOT NULL,
    ArrivalDate TIMESTAMP NOT NULL
);

-- Create Accommodation table
CREATE TABLE Accommodation (
    ID UUID PRIMARY KEY,
    ItineraryID UUID NOT NULL REFERENCES Itinerary(ID),
    Name VARCHAR(255) NOT NULL,
    Address TEXT,
    Sequence INTEGER NOT NULL,
    CheckInDate TIMESTAMP NOT NULL,
    CheckOutDate TIMESTAMP NOT NULL
);