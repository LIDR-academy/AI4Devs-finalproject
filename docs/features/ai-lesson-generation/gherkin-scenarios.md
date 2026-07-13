Feature: AI lesson generation with composition choice
  As a learner, I want to choose what my lesson contains and have the AI generate it
  from my uploaded PDF, so I get a structured deck of instructional and/or activity
  slides while my key never leaves the server.

  # ---------------------------------------------------------------------------
  # Composition choice (R2.1)
  # ---------------------------------------------------------------------------

  @s1
  Scenario: Composition defaults to "both" and offers all three choices
    Given I have uploaded a PDF that was successfully extracted
    When the generation options are shown
    Then the composition picker offers "instructional only", "activity only", and "both"
    And "both" is selected by default

  @s2
  Scenario: Learner selects a non-default composition
    Given the composition picker with "both" selected
    When I choose "instructional only" or "activity only"
    Then that composition becomes the selected choice for the next generation

  @s16
  Scenario: Generate is unavailable until a PDF has been extracted
    Given no PDF has been successfully extracted yet
    Then the composition picker is visible
    But the Generate action is unavailable
    And it becomes available once extraction succeeds

  # ---------------------------------------------------------------------------
  # Generation happy path + composition enforcement (R2)
  # ---------------------------------------------------------------------------

  @s3
  Scenario: "Both" composition generates an ordered mix of typed slides
    Given an extracted PDF and the composition "both"
    When I trigger generation
    Then generation returns an ordered deck of slides
    And each slide is typed as either "instructional" or "activity"
    And the deck contains a mix of both kinds

  @s4
  Scenario: "Instructional only" composition produces no activity slides
    Given an extracted PDF and the composition "instructional only"
    When I trigger generation
    Then the returned deck contains only instructional slides
    And no activity slides

  @s5
  Scenario: "Activity only" composition produces no instructional slides
    Given an extracted PDF and the composition "activity only"
    When I trigger generation
    Then the returned deck contains only activity slides
    And no instructional slides

  @s6
  Scenario: The chosen composition is passed to the server and enforced in the prompt
    Given a chosen composition
    When generation is triggered
    Then the composition is sent to the generation Edge Function
    And the generation prompt enforces it so the returned deck honors the chosen composition

  @s13
  Scenario Outline: Generated activity slides are valid R3 types with answers and explanations
    Given a composition that includes activities ("activity only" or "both")
    When activity slides are generated
    Then each activity slide is of type "<activityType>"
    And it carries the correct answer(s) required by that type
    And it includes an explanation where that type supports one

    Examples:
      | activityType       |
      | multiple-choice    |
      | fill-in-the-blank  |
      | flashcard          |
      | open-ended         |
      | matching           |

  # ---------------------------------------------------------------------------
  # Server-side key handling (R2 / R6)
  # ---------------------------------------------------------------------------

  @s7
  Scenario: The provider call is made server-side and the key never reaches the client
    Given a learner with a stored AI key
    When generation runs
    Then the AI provider (Groq) is called from inside the Edge Function via the Vercel AI SDK
    And the stored key is read server-side
    And the raw key is never returned to, transmitted to, or held by the client during generation

  @s8
  Scenario: The stored key is never written to logs
    Given generation runs, whether it succeeds or fails
    Then the raw key value never appears in any server log

  # ---------------------------------------------------------------------------
  # Image placement + degradation (R2, feeding R4)
  # ---------------------------------------------------------------------------

  @s9
  Scenario: Image placement uses R1 metadata when present
    Given an extracted image that carries page/position metadata (and optionally a description)
    When generation runs
    Then that metadata decides which slide the image is attached to

  @s10
  Scenario: Image placement falls back to a vision model for a raw image
    Given an extracted image with no anchoring text or description to place it
    When generation runs
    Then a vision-capable model decides the image's placement

  @s11
  Scenario: A slide carries a reference to its persisted image, or is text-only
    Given generation attaches a relevant image to a slide
    Then that slide carries a reference to the persisted (R1) image rather than the image bytes
    And a slide with no relevant image is text-only

  @s12
  Scenario: A missing or broken image reference degrades to text-only
    Given a slide whose image reference is missing or cannot be resolved
    When the slide is generated or later rendered
    Then it degrades to text-only
    And neither the slide nor the generation request fails

  # ---------------------------------------------------------------------------
  # Progress + result + failure (UI states)
  # ---------------------------------------------------------------------------

  @s14
  Scenario: A multi-step progress state is shown while generation runs
    Given I trigger generation
    When generation is in flight
    Then I see discrete, labeled progress steps for reading content, generating slides, and attaching images
    And each step advances as the pipeline progresses, rather than a bare spinner or a percentage bar

  @s17
  Scenario: A completed deck is presented so it can be opened in the player
    Given generation succeeds
    When the deck is returned
    Then a ready state summarizes the generated deck
    And offers to open the lesson in the player

  @s15
  Scenario Outline: Generation failure shows a readable error with its recovery affordance and persists no partial deck
    Given generation will fail with a "<failure>"
    When I trigger generation
    Then I see a readable error message rather than a crash
    And the error offers the "<recovery>" recovery affordance
    And no partial or corrupt deck is produced or persisted
    And the extracted source from R1 is left intact

    Examples:
      | failure                   | recovery       |
      | no key stored server-side | go to Settings |
      | rejected/invalid key      | go to Settings |
      | provider rate limit       | retry          |
      | timeout                   | retry          |
      | malformed AI response     | retry          |
      | document not ready        | re-upload      |
      | network/transport error   | retry          |

  # ---------------------------------------------------------------------------
  # Cross-cutting
  # ---------------------------------------------------------------------------

  @s18
  Scenario: All generation copy is localized
    Given a supported app locale
    When I view the composition picker, the progress steps, the ready state, and any error
    Then all labels, step names, and messages render from the active locale bundle with no hardcoded strings

  @s19
  Scenario: The generation UI is accessible
    Given the generation UI
    Then the composition picker exposes radiogroup/radio roles and its selection state
    And the multi-step progress is announced to assistive technology
    And an error is announced to assistive technology

  @s20
  Scenario: The app's AI provider is Groq end-to-end
    Given the AI key-management and generation features
    Then the supported provider resolves to Groq rather than OpenAI
    And the key-manager guidance links to Groq's console
    And no user-facing copy references OpenAI
