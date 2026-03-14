Feature: Compose Meditation Content with Optional AI Assistance

  Background:
    Given I am an authenticated user in the Meditation Builder

# =========================================
# CORE CAPACITIES
# =========================================

  Scenario: Access Meditation Builder and see text field
    When I access the Meditation Builder
    Then I see mandatory text field for meditation content

  Scenario: Enter and preserve manual text
    When I type meditation text in the text field
    Then text is captured and preserved exactly

  Scenario: AI text generation and enhancement
    Given text field has content or keywords
    When I request AI text generation
    Then field updates with AI-generated/improved meditation text

  Scenario: Generate AI image
    Given no image selected
    When I click "Generate AI image"
    Then image field shows AI-generated image

  Scenario: Output type podcast without image
    Given text entered without image
    When I review composition
    Then system shows "podcast (audio-only)"

  Scenario: Output type video with image
    Given text + image (manual or AI)
    When I review composition
    Then system shows "video"

  Scenario: Preview music
    Given music selected
    When I click music preview
    Then audio plays

  Scenario: Preview image
    Given image selected
    When I click image preview
    Then image displays
