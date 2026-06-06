# Product Requirements Document (PRD) - FinScheme

## Product Overview
FinScheme is a web platform designed to simplify how Indian citizens find and understand central and state government schemes. It provides a guided eligibility wizard, an interactive scheme relationship map, and a plain-language jargon humanizer tool to demystify complex policy documents.

## Key Features
1. **Guided Discovery Wizard**: Helps users build a customized shortlist of schemes based on their profile.
2. **Government Jargon Humanizer**: Uses AI models to translate dense bureaucratic text into plain language.
3. **Interactive Relationship Map**: Visualizes the connection between different government scheme categories and programs.
4. **Local Holiday & State Banners**: Surfaces alerts and location-aware recommendations for active schemes.
5. **Scheme Scout Background Worker**: Periodically checks official portals and generates fresh scheme discoveries.

## Current Technical Focus
- Establish a 100% pass rate for the Playwright playable verification suite (`tests/playables.spec.js`).
- Resolve flaky execution and timeouts caused by slow external network dependencies (e.g. Unsplash images, Google Fonts) during headless test runs.
