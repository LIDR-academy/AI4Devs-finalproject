# Gherkin scenarios — navigation-menus

The signed contract. Every `@s` tag is the traceability key the `implementer` and reviewers use;
each maps to ≥ 1 concrete test. Every acceptance criterion maps to ≥ 1 scenario here.

```gherkin
Feature: Desktop and mobile navigation menus
  As a signed-in learner, I want a responsive primary nav with account actions
  so that I can move between Home and New lesson, open Settings, and sign out
  without hunting for links on the screen body.

  Background:
    Given I am a signed-in learner
    And I am inside the protected app shell

  @s1
  Scenario: Desktop top bar shows brand, primary nav, alerts placeholder, and avatar
    Given my web viewport width is at least 768
    When the app chrome renders
    Then I see a top bar with the brand lockup (logo and "AI Study Buddy")
    And I see primary destinations Home and New lesson
    And I see a right cluster with a visual alerts control and an avatar

  @s2
  Scenario: Primary nav destinations open Home and New lesson
    Given the app chrome is visible
    When I choose Home
    Then I navigate to "/"
    When I choose New lesson
    Then I navigate to "/upload"

  @s3
  Scenario: Active primary route uses the pill indicator by default
    Given I am on Home or New lesson
    When the chrome renders with the product default indicator
    Then the matching nav item shows the pill active indicator

  @s4
  Scenario Outline: Indicator API supports pill, underline, and dot
    Given a nav item is marked active
    When the indicator variant is "<variant>"
    Then the active indicator renders as "<variant>"

    Examples:
      | variant   |
      | pill      |
      | underline |
      | dot       |

  @s5
  Scenario: Account menu shows identity, Settings, and Sign out — no Help
    Given I open the account menu from the avatar
    Then I see my session identity (display label, email, and initials avatar)
    And I see Settings
    And I see Sign out styled as an error action
    And I do not see Help and feedback

  @s6
  Scenario: Settings from the account menu opens Settings
    Given the account menu is open
    When I choose Settings
    Then I navigate to "/settings"

  @s7
  Scenario: Sign out from the account menu uses the existing confirm flow
    Given the account menu is open
    When I choose Sign out and confirm in the existing dialog
    Then my session is cleared
    And I land on the login screen

  @s8
  Scenario: Account menu dismisses with accessible semantics
    Given the account menu is open
    When I dismiss it via outside press, Escape on web, or after choosing an action
    Then the menu closes
    And the menu exposes accessible open/close and focus behavior

  @s9
  Scenario: Mobile chrome shows top app bar and bottom tab bar
    Given I am on a web viewport below 768 or on native iOS or Android
    When the app chrome renders
    Then I see a top app bar with compact logo, screen title, and avatar
    And I see a bottom bar with Home and New lesson

  @s10
  Scenario: Mobile avatar opens the same account menu as desktop
    Given I am on the mobile chrome
    When I activate the avatar
    Then the same account menu opens as on desktop
    And it offers Settings and Sign out

  @s11
  Scenario: Bottom bar respects safe-area inset
    Given I am on the mobile chrome
    When the bottom bar renders
    Then it preserves safe-area padding

  @s12
  Scenario: Active route is exposed to assistive technology
    Given I am on Home or New lesson
    When the chrome renders
    Then the matching nav item is marked active for assistive tech

  @s13
  Scenario: Deep routes do not invent a fake primary-tab active item
    Given I am on a lesson, player, or settings screen
    When the primary nav renders
    Then no primary tab pretends to be Settings
    And Settings remains available only from the account menu

  @s14
  Scenario: Avatars and account menu use session identity with initials placeholder
    Given my Supabase session has a user email and optional display name
    When the avatar and account menu render
    Then they show a label derived from name or email
    And they show initials in a placeholder circle
    And no photo upload or picker is offered
    And while session is still loading, no invented identity is shown

  @s15
  Scenario: Desktop alerts control is visual-only
    Given the desktop right cluster is visible
    When I view the alerts control
    Then it may show an icon and badge styling
    And it does not open a feed, mark items read, or call a backend

  @s16
  Scenario: Primary nav and account menu replace ad-hoc entry points
    Given Home previously offered body links to Upload and Settings
    And Settings header alone owned Sign out
    When this navigation ships
    Then primary nav and the account menu own those entry points
    And redundant body links and header-only Sign out are not the primary path

  @s17
  Scenario: Chrome strings come from existing locale keys
    Given the app chrome and account menu are visible
    When user-visible strings render
    Then Home uses "nav.myLessons"
    And New lesson uses "nav.newLesson"
    And Settings uses "nav.settings"
    And Sign out uses "auth.logOut" and existing confirm keys when the dialog is shown
    And the account-menu trigger uses "nav.openAccountMenu" with the identity label
    And no other new product copy keys are required for this chrome

  @s18
  Scenario: Navigation chrome meets interaction and contrast a11y baselines
    Given the app chrome is visible
    When I use nav items and the account trigger
    Then they are real links or buttons with accessible names
    And touch targets meet at least 44pt or 48dp
    And active, inactive, and Sign-out error styling meet WCAG 2.2 AA contrast
    And the account menu supports keyboard open and close where the platform allows

  @s19
  Scenario Outline: Breakpoint selects desktop vs mobile chrome
    Given I am on "<platform>"
    And my viewport condition is "<viewport>"
    When the app chrome renders
    Then I see the "<pattern>" pattern

    Examples:
      | platform | viewport        | pattern |
      | web      | width >= 768    | desktop |
      | web      | width < 768     | mobile  |
      | ios      | any             | mobile  |
      | android  | any             | mobile  |

  @s20
  Scenario: Desktop brand lockup uses the product name
    Given the desktop top bar is visible
    When the brand lockup renders
    Then it includes the wordmark from "brand.name" ("AI Study Buddy")
```
