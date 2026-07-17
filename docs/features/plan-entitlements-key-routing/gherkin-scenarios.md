# Gherkin — plan-entitlements-key-routing

```gherkin
Feature: Plan entitlements and server-side AI key routing
  As a learner on a free or paid plan
  I want flag-derived access and secure key routing
  So that generation works for my plan without trusting client-side gates

  Background:
    Given seeded plans "free" and "paid" with their plan flags

  @s1
  Scenario: New accounts default to the free plan
    Given a new authenticated user is created
    When the profile creation trigger runs
    Then exactly one profile exists for that user
    And its plan_id is "free"

  @s2
  Scenario: Free learner with a saved key loads content profile
    Given my profile plan_id is "free"
    And I have a saved user AI key
    When my profile loads
    Then key settings are shown from show_key_settings
    And showAds is true from show_ads
    And create and upload controls are shown

  @s3
  Scenario: Free learner without a saved key sees the empty create state
    Given my profile plan_id is "free"
    And I have no saved user AI key
    When my profile loads
    Then key settings are shown from show_key_settings
    And showAds is true from show_ads
    And create and upload controls are hidden
    And I see a contact-support cannot-create message

  @s4
  Scenario: Profile loading hides plan-sensitive controls
    Given my profile request is pending
    When I view upload or settings
    Then create and upload controls are hidden
    And key settings are hidden

  @s5
  Scenario Outline: Profile load failure offers retry
    Given my profile cannot load because of "<cause>"
    When I view upload or settings
    Then I see a profile error state
    And I see a retry action
    And create, upload, and key settings are hidden

    Examples:
      | cause               |
      | a data-access error |
      | a missing profile   |

  @s6
  Scenario: Retrying a failed profile load recovers
    Given my profile is in the error state
    And the next profile request succeeds
    When I retry
    Then the error state clears
    And I see controls derived from my current plan flags and key status

  @s7
  Scenario: Free generation uses the saved user key
    Given my profile plan_id is "free"
    And the free plan has use_platform_key false
    And I have a valid saved user AI key
    When I generate a lesson
    Then the server reads my user key from secure storage
    And the provider call uses that key
    And no key material is returned or logged

  @s8
  Scenario: Free generation without a key is rejected server-side
    Given my profile plan_id is "free"
    And the free plan has use_platform_key false
    And I have no saved user AI key
    When I call generation despite the hidden client controls
    Then generation is rejected with error code "missing_key"
    And the client presents guidance to add a user key

  @s9
  Scenario: Paid learner loads content profile without a user key
    Given my profile plan_id is "paid"
    And I have no saved user AI key
    When my profile loads
    Then key settings are hidden from show_key_settings
    And showAds is false from show_ads
    And create and upload controls are shown from use_platform_key

  @s10
  Scenario: Paid generation uses only the platform key
    Given my profile plan_id is "paid"
    And the paid plan has use_platform_key true
    And I still have a saved user AI key
    And "PLATFORM_GROQ_API_KEY" is configured
    When I generate a lesson
    Then the server does not read my saved user AI key
    And the provider call uses "PLATFORM_GROQ_API_KEY"
    And no key material is returned or logged

  @s18
  Scenario: Paid generation works without a saved user key
    Given my profile plan_id is "paid"
    And the paid plan has use_platform_key true
    And I have no saved user AI key
    And "PLATFORM_GROQ_API_KEY" is configured and usable
    When I generate a lesson
    Then the server does not read secure user-key storage
    And the provider call uses "PLATFORM_GROQ_API_KEY"
    And generation can succeed without user-key setup

  @s11
  Scenario: Paid generation reports an unavailable platform key
    Given my profile plan_id is "paid"
    And the paid plan has use_platform_key true
    And "PLATFORM_GROQ_API_KEY" is missing or empty
    When I generate a lesson
    Then generation is rejected with error code "platform_key_unavailable"
    And the client presents a server-error message
    And the client does not present guidance to add a user key

  @s19
  Scenario: Paid generation reports an unusable configured platform key
    Given my profile plan_id is "paid"
    And the paid plan has use_platform_key true
    And "PLATFORM_GROQ_API_KEY" is configured but invalid or unusable
    When I generate a lesson
    Then generation is rejected with error code "platform_key_unavailable"
    And the client presents a server-error message
    And the client does not present guidance to add a user key
    And the server does not fall back to a saved user key

  @s12
  Scenario Outline: A paid-to-free change applies when profile reloads
    Given my profile plan_id was "paid"
    And my saved user AI key is "<key state>"
    And an administrator changes my profile plan_id to "free"
    When I next load profile
    Then key settings are shown
    And showAds is true
    And create and upload controls are "<control state>"

    Examples:
      | key state | control state |
      | present   | shown         |
      | absent    | hidden        |

  @s13
  Scenario: Existing lessons remain playable after downgrade
    Given an administrator changed my profile plan_id from "paid" to "free"
    And I have a previously generated lesson
    When I open that lesson
    Then the lesson remains openable and playable

  @s14
  Scenario: A dashboard plan change applies to the next generation
    Given my profile was previously loaded for one plan
    And an administrator changes my profile plan_id in the dashboard
    When I next generate a lesson
    Then the server reads the current plan flags
    And routes the key according to use_platform_key without a redeploy

  @s15
  Scenario: A crafted request cannot select the platform key
    Given my current server-side plan has use_platform_key false
    And a crafted client request claims paid access or ignores UI gates
    When the request reaches generation
    Then the server ignores client-supplied plan and entitlement values
    And the server follows the user-key route from use_platform_key

  @s16
  Scenario: Ad flag is exposed without ad behavior
    Given my profile loads successfully
    When the profile object is returned
    Then it includes showAds from the plan show_ads flag
    And no ad UI or ad-network request is started

  @s17
  Scenario: A free-to-paid dashboard change applies when profile reloads
    Given my profile plan_id was "free"
    And an administrator changes my profile plan_id to "paid"
    When I next load profile
    Then key settings are hidden
    And showAds is false
    And create and upload controls are shown without a user key
```
