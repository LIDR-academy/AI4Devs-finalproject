# Gherkin contract — localization-i18n

Feature: App localization (i18n)
  As a multilingual user of AI Study Buddy, I want the app in my language with
  an in-app switch that persists, so I can study comfortably on web, iOS, or Android.

  Background:
    Given the localization provider is mounted at the app root
    And English is the base and fallback locale

  @s1
  Scenario: The provider makes translations available to descendant components
    Given the active locale is Spanish
    And a component requests a key that exists in every bundle
    When the component renders inside the provider
    Then it displays the Spanish translation of that key
    And it does not import i18next directly

  @s2
  Scenario Outline: Each supported locale resolves keys from its own bundle
    Given the active locale is "<locale>"
    When a component requests a key that exists in the "<locale>" bundle
    Then it displays the "<locale>" translation for that key

    Examples:
      | locale |
      | en     |
      | es     |
      | pt     |
      | de     |

  @s3
  Scenario: First launch auto-detects a supported device locale
    Given there is no saved language preference
    And the device locale is Portuguese
    When the app resolves the initial locale on first launch
    Then the UI renders in Portuguese

  @s4
  Scenario: First launch with an unsupported device locale falls back to English
    Given there is no saved language preference
    And the device locale is one that the app does not support
    When the app resolves the initial locale on first launch
    Then the UI renders in English

  @s5
  Scenario: Settings shows the four languages in their own names with the active one indicated
    Given the active locale is German
    When I open the Settings screen
    Then I see a language selector listing English, Español, Português, and Deutsch
    And each language is labeled in its own name
    And Deutsch is indicated as the active selection

  @s6
  Scenario: Selecting a language updates the UI immediately
    Given the active locale is English
    When I select Spanish in the Settings language selector
    Then the UI updates to Spanish immediately without an app restart
    And both app screens and shared components reflect Spanish

  @s7
  Scenario: The selected language persists across an app restart
    Given I have selected Portuguese
    When I close and reopen the app
    Then the app launches in Portuguese

  @s8
  Scenario: A saved preference takes precedence over the device locale
    Given I have previously selected Spanish
    And the device locale is German
    When the app resolves the initial locale on launch
    Then the app launches in Spanish

  @s9
  Scenario: A missing key falls back to the English string
    Given the active locale is German
    And a key exists in English but is missing from the German bundle
    When a component renders that key
    Then it displays the English string
    And it never renders a raw key or crashes

  @s10
  Scenario: Interpolated values are injected into a translated string
    Given the active locale is Spanish
    And a translation string contains an interpolated value
    When a component renders that string with the value supplied
    Then the rendered text contains the value in the correct position for Spanish

  @s11
  Scenario Outline: Pluralization selects the correct plural form by count
    Given the active locale is "<locale>"
    And a translation string has singular and plural forms
    When a component renders it with a count of <count>
    Then it displays the "<form>" form for "<locale>"

    Examples:
      | locale | count | form     |
      | en     | 1     | singular |
      | en     | 5     | plural   |
      | es     | 1     | singular |
      | es     | 5     | plural   |

  @s12
  Scenario: A failed preference read degrades gracefully
    Given reading the saved language preference from storage fails
    And the device locale is Spanish
    When the app resolves the initial locale on launch
    Then the app falls back to device detection and renders in Spanish
    And the app does not crash

  @s13
  Scenario: The language selector is accessible
    Given the Settings language selector is rendered with a language active
    When assistive technology inspects the selector
    Then each option exposes an accessible role and label
    And the active option is announced as selected
    And the active state is conveyed by more than color alone

  @s14
  Scenario: No hardcoded user-facing strings remain
    Given the string-migration is complete
    When any screen in the app or any shared component renders
    Then every visible string comes from a translation key
    And no hardcoded UI copy remains, including navigation titles

  @s15
  Scenario Outline: Localization behaves identically across platforms
    Given the app runs on "<platform>"
    And the active locale is Spanish
    When a localized screen renders
    Then it displays the Spanish translations from the shared config

    Examples:
      | platform |
      | web      |
      | iOS      |
      | Android  |
