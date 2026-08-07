# Feature Documentation - Parent-Specific Interactivity & Privacy Controls

Detailed specifications of custom interactive widgets and privacy controls within the Parent Dashboard.

## 1. Me-Time Logger
- **Purpose:** Encourage parents to dedicate time for their own mental and physical health.
- **Interactivity:** Increment logged minutes directly from the dashboard (buttons for +5m, +15m, +30m).
- **Target:** Daily target of 30 minutes. Circular progress bar updates in real time.

## 2. Water Hydration Grid
- **Purpose:** Ensure busy parents stay physically hydrated.
- **Interactivity:** A row of 8 water glass icons. Clicking a glass toggles its filled state and increases the daily glass count.
- **Visuals:** Filled glasses show a soft blue/teal wave animation.

## 3. Grounding Box (Overwhelmed Mode)
- **Purpose:** Help parents de-escalate acute stress in under 60 seconds.
- **Interactivity:** Toggling the "I'm Feeling Overwhelmed" button overlays a full-screen, high-radius modal with a step-by-step calming breathing animation (5-4-3-2-1 grounding exercises) and sensory checks.

## 4. Family Wellness Connection Tracker
- **Purpose:** Balance solo care with shared family moments.
- **Interactivity:** Track minutes spent in direct, positive contact with children or partner (e.g. reading, playing, talking). Increment using a slider or quick add button.

## 5. Privacy Safeguard: Username & Phone Visibility Toggles
- **Hide/Show Name:** An eye icon next to the greeting name masks the username as `••••••••` to keep it safe from shoulder surfing.
- **Username Chooser & Availability Check:** Users can change their username. It features a mock availability check (e.g. fails on taken words like `elena`) and automatically generates suggestions if unavailable.
- **Phone Toggle:** Switch in the top header hides/shows the user's registered phone number on the dashboard layout.

## 6. Periodic "Not Watched" Security Popup
- **Purpose:** Provide instant safety assurance.
- **Interactivity:** A beautiful modal that automatically mounts if 2 minutes (120,000 ms) have passed since the last viewing. Assures: *"We assure you that you are not being watched."*
