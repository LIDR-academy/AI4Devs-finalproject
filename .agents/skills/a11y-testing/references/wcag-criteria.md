# WCAG Accessibility Conformity Checklists

This reference document contains accessibility criteria for manual verification, focusing on guidelines that cannot be easily or reliably verified using automated tools like axe-core.

## Non-Automatable WCAG Criterions

| Criterion | Level | Description | Manual Verification Steps |
|---|---|---|---|
| **1.2.1 Audio-only / Video-only (Prerecorded)** | A | Alternative media is provided. | Check for text transcripts for audio-only and text/audio descriptions for video-only. |
| **1.2.2 Captions (Prerecorded)** | A | Captions are provided for all prerecorded audio content in synchronized media. | Play videos and ensure captions match speech and significant audio cues. |
| **1.2.3 Audio Description or Media Alternative** | A | Audio description or alternative is provided for prerecorded video. | Verify that a voice track describes visual actions, or a detailed text script is available. |
| **1.4.2 Audio Control** | A | Mechanism to pause/stop or lower volume of audio playing automatically. | Verify that audio that plays for >3 seconds can be paused or muted. |
| **2.4.2 Page Titled** | A | Web pages have titles that describe topic or purpose. | Check `<title>` tag content for context and uniqueness. |
| **2.4.5 Multiple Ways** | AA | More than one way is available to locate a Web page. | Ensure existence of site search, sitemap, or hierarchical navigation menu. |
| **3.1.2 Language of Parts** | AA | The language of each passage or phrase in the content can be programmatically determined. | Inspect code to verify language attributes (`lang=".."`) on local elements if they change from the default. |
| **3.2.4 Consistent Identification** | AA | Components that have the same functionality are identified consistently. | Check icons, labels, and helper texts across different pages. |
| **3.3.4 Error Prevention (Legal, Financial, Data)** | AA | Transactions are reversible, checked, or confirmed before submission. | Check checkout, bank transfer, and deletion forms for confirmation dialogues or rollback mechanisms. |

## Screen Reader & Keyboard Navigation Verification Checklist

1. **Logical Focus Order:** Tab through the page. The focus indicator must follow a logical top-to-bottom, left-to-right path.
2. **Keyboard Traps:** Ensure focus never gets stuck in a modal, dropdown, or interactive widget without a keyboard method to close it (typically the `Escape` key).
3. **Focus Visibility:** Ensure a clearly visible outline indicator (e.g. `outline: 2px solid #005FCC`) is present on every interactive element when focused via keyboard.
4. **Skip Links:** Check for a "Skip to main content" link that appears on first tab and successfully moves focus past main navigation.
