-- Insert a user
INSERT INTO "User" (ID, Name, Email, Password, CreationDate)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'John Doe', 'john@example.com', 'hashed_password', CURRENT_DATE);

-- Insert user preferences
INSERT INTO Preferences (ID, UserID, Budget)
VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 2000);

-- Insert travel types
INSERT INTO TravelType (ID, Type) VALUES 
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Cultural'),
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Adventure');

-- Insert mobility types
INSERT INTO MobilityType (ID, Type) VALUES 
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Car'),
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Public Transport');

-- Insert accommodation types
INSERT INTO AccommodationType (ID, Type) VALUES 
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Hotel'),
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'Apartment');

-- Insert cities
INSERT INTO City (ID, Name) VALUES 
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'Paris'),
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'Rome');

-- Insert user's travel preferences
INSERT INTO TravelPreference (ID, PreferencesID, TravelTypeID)
VALUES ('g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');

-- Insert user's mobility preferences
INSERT INTO MobilityPreference (ID, PreferencesID, MobilityTypeID)
VALUES ('h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15');

-- Insert user's accommodation preferences
INSERT INTO AccommodationPreference (ID, PreferencesID, AccommodationTypeID)
VALUES ('i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17');

-- Insert user's favorite place
INSERT INTO FavoritePlace (ID, PreferencesID, CityID)
VALUES ('j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19');

-- Insert Trip 1: Paris Adventure
INSERT INTO Trip (ID, UserID, Name, StartDate, EndDate, Description)
VALUES ('k0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Paris Adventure', '2023-06-01', '2023-06-07', 'A week-long cultural exploration of Paris');

-- Insert Trip 2: Roman Holiday
INSERT INTO Trip (ID, UserID, Name, StartDate, EndDate, Description)
VALUES ('k1eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Roman Holiday', '2023-09-15', '2023-09-22', 'Discovering the ancient wonders of Rome');

-- Paris Adventure Itinerary
INSERT INTO Itinerary (ID, TripID, Destination, StartDate, EndDate, Description)
VALUES ('l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a27', 'k0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25', 'Paris', '2023-06-01', '2023-06-07', 'Exploring the City of Light');

-- Paris Activities
INSERT INTO Activity (ID, ItineraryID, Name, Description, Sequence, DateTime)
VALUES 
('m0eebc99-9c0b-4ef8-bb6d-6bb9bd380a28', 'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a27', 'Eiffel Tower Visit', 'Ascend the iconic Eiffel Tower', 1, '2023-06-02 10:00:00'),
('m1eebc99-9c0b-4ef8-bb6d-6bb9bd380a29', 'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a27', 'Louvre Museum Tour', 'Explore world-famous artworks', 2, '2023-06-03 14:00:00');

-- Paris Transport
INSERT INTO Transport (ID, ItineraryID, Type, Description, Origin, Destination, Sequence, DepartureDate, ArrivalDate)
VALUES ('n0eebc99-9c0b-4ef8-bb6d-6bb9bd380a30', 'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a27', 'Flight', 'Flight to Paris', 'Home', 'Paris', 1, '2023-06-01 08:00:00', '2023-06-01 10:00:00');

-- Paris Accommodation
INSERT INTO Accommodation (ID, ItineraryID, Name, Address, Sequence, CheckInDate, CheckOutDate)
VALUES ('o0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a27', 'Parisian Hotel', '123 Champs-Élysées, Paris', 1, '2023-06-01 14:00:00', '2023-06-07 11:00:00');

-- Roman Holiday Itinerary
INSERT INTO Itinerary (ID, TripID, Destination, StartDate, EndDate, Description)
VALUES ('l1eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'k1eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', 'Rome', '2023-09-15', '2023-09-22', 'Discovering ancient Rome');

-- Rome Activities
INSERT INTO Activity (ID, ItineraryID, Name, Description, Sequence, DateTime)
VALUES 
('m2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'l1eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'Colosseum Tour', 'Visit the ancient Roman amphitheater', 1, '2023-09-16 09:00:00'),
('m3eebc99-9c0b-4ef8-bb6d-6bb9bd380a34', 'l1eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'Vatican Museums', 'Explore the vast art collections', 2, '2023-09-17 10:00:00');

-- Rome Transport
INSERT INTO Transport (ID, ItineraryID, Type, Description, Origin, Destination, Sequence, DepartureDate, ArrivalDate)
VALUES ('n1eebc99-9c0b-4ef8-bb6d-6bb9bd380a35', 'l1eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'Train', 'Train to Rome', 'Home', 'Rome', 1, '2023-09-15 09:00:00', '2023-09-15 13:00:00');

-- Rome Accommodation
INSERT INTO Accommodation (ID, ItineraryID, Name, Address, Sequence, CheckInDate, CheckOutDate)
VALUES ('o1eebc99-9c0b-4ef8-bb6d-6bb9bd380a36', 'l1eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'Roman Apartment', '456 Via del Corso, Rome', 1, '2023-09-15 15:00:00', '2023-09-22 10:00:00');
