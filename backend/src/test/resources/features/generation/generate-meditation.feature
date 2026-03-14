# language: en
Feature: Generate Guided Meditation with Narration
  As an authenticated user
  I want to generate meditation content by sending text and music (with optional image)
  So that I can receive a professional narrated audio or video with synchronized subtitles

  Background:
    Given the user is authenticated

  Scenario: Generate narrated video with synchronized subtitles
    Given sends meditation text "Close your eyes and breathe deeply. Focus on the gentle rhythm of your breath as it flows in and out of your body. Allow yourself to be fully present in this moment, letting go of any thoughts or distractions. Experience the peace and tranquility that comes with each deep, intentional breath. Continue this practice for the next few minutes, staying connected to your inner calm."
    And selects a valid music track "nature-sounds-01.mp3"
    And selects a valid image "peaceful-landscape.jpg"
    When requests to generate the content
    Then the system produces high-quality narration from the text
    And generates comprehensible synchronized subtitles
    And combines narration, music, and static image into a final video
    And the platform registers the meditation as type "VIDEO"
    And the user receives access to the video in an acceptable timeframe

  Scenario: Generate narrated podcast
    Given sends meditation text "Welcome to your mindfulness meditation journey. Today, we will explore the depths of your consciousness and find a place of stillness within. Take a comfortable seat and allow your body to relax completely. Notice the sensations of your body against the chair or floor. Gently bring your attention to your breathing, observing the natural rise and fall of your chest. Inhale peace, exhale tension. Let each breath carry you deeper into a state of relaxation and awareness."
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
