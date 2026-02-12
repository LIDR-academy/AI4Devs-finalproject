# language: en
Feature: Generate Guided Meditation with Narration
  As an authenticated user
  I want to generate meditation content by sending text and music (with optional image)
  So that I can receive a professional narrated audio or video with synchronized subtitles

  Background:
    Given the user is authenticated

  Scenario: Generate narrated video with synchronized subtitles
    Given sends meditation text "Close your eyes and breathe deeply"
    And selects a valid music track "nature-sounds-01.mp3"
    And selects a valid image "peaceful-landscape.jpg"
    When requests to generate the content
    Then the system produces high-quality narration from the text
    And generates comprehensible synchronized subtitles
    And combines narration, music, and static image into a final video
    And the platform registers the meditation as type "VIDEO"
    And the user receives access to the video in an acceptable timeframe

  Scenario: Generate narrated podcast
    Given sends meditation text "Welcome to your mindfulness meditation journey"
    And selects a valid music track "calm-piano-02.mp3"
    And does not select an image
    When requests to generate the content
    Then the system produces high-quality narration from the text
    And combines the narration with music in a final audio output
    And generates synchronized subtitles for future use
    And the platform registers the meditation as type "AUDIO"
    And the user receives access to the audio in an acceptable timeframe

  Scenario: Processing time exceeded
    Given sends meditation text with excessive length that would exceed processing time limits
    And selects a valid music track "meditation-music-03.mp3"
    When requests to generate the content
    Then the system rejects the request with a time exceeded message
    And recommends sending shorter text
