# Project Structure

This React project follows a clean component-based architecture with proper separation of concerns.

## Directory Structure

```
src/
├── components/           # Reusable UI components
│   ├── Hero/
│   │   ├── Hero.tsx
│   │   └── Hero.css
│   ├── Section/
│   │   └── Section.tsx
│   ├── ParallaxText/
│   │   └── ParallaxText.tsx
│   ├── ExperienceCard/
│   │   ├── ExperienceCard.tsx
│   │   └── ExperienceCard.css
│   └── MapJourney/
│       ├── MapJourney.tsx (moved to components/MapJourney/MapJourney.tsx)
│       └── MapJourney.css
├── shared/              # Shared utilities and constants
│   ├── types.ts        # TypeScript interfaces and types
│   └── constants.ts    # Application constants
├── assets/             # Static assets
├── App.tsx             # Main application component
├── App.css             # Global application styles
├── main.tsx            # Application entry point
└── index.css           # Global CSS reset and base styles
```

## Component Overview

### Components

- **Hero**: Landing hero section with animated title and scroll indicator
- **Section**: Reusable animated section wrapper with scroll-triggered animations
- **ParallaxText**: Wrapper component for parallax scrolling effects
- **ExperienceCard**: Display card for Georgian experiences (mountains, wine, etc.)
- **MapJourney**: Interactive split-screen map journey with story locations

### Shared

- **types.ts**: TypeScript interfaces (Experience, StoryLocation)
- **constants.ts**: Application data (EXPERIENCES, STORY_LOCATIONS)

## Usage

Import components as needed:

```tsx
import Hero from "./components/Hero/Hero";
import MapJourney from "./components/MapJourney/MapJourney";
import { EXPERIENCES } from "./shared/constants";
```

## Benefits of This Structure

1. **Modularity**: Each component is self-contained with its own styles
2. **Reusability**: Components can be easily reused across the app
3. **Maintainability**: Easy to locate and update specific components
4. **Type Safety**: Centralized types ensure consistency
5. **Scalability**: Easy to add new components following the same pattern
