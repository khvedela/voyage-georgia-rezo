# Project Overview

This is a single-page React application built with TypeScript and Vite. It showcases a travel journey through Georgia, with a focus on storytelling and an interactive map experience.

## Key Technologies

*   **React:** The core UI library.
*   **TypeScript:** For static typing.
*   **Vite:** As the build tool and development server.
*   **React Map GL:** For the interactive map component.
*   **GSAP (GreenSock Animation Platform):** For advanced animations, particularly scroll-based animations.
*   **Framer Motion:** For UI animations and transitions.
*   **ESLint:** For code linting.

## Architecture

The application follows a component-based architecture. The main `App.tsx` component orchestrates the layout and includes several sub-components for different sections of the page, such as:

*   `Hero`: The main hero section.
*   `Section`: A reusable component for content sections.
*   `ParallaxText`: A component for parallax text effects.
*   `ExperienceCard`: A card component to display experiences.
*   `MapJourney`: A key component that displays an interactive map with a narrative of the journey.

## Building and Running

### Development

To run the application in development mode:

```bash
npm install
npm run dev
```

This will start the Vite development server and open the application in your default browser.

### Production Build

To build the application for production:

```bash
npm run build
```

This will create a `dist` directory with the optimized production build.

### Linting

To run the linter:

```bash
npm run lint
```

## Development Conventions

*   **Styling:** The project uses CSS Modules for component-level styling, with some global styles in `index.css` and `App.css`.
*   **State Management:** Component-level state is managed with React hooks (`useState`, `useRef`, `useEffect`).
*   **Constants:** The project uses a `constants.ts` file to store shared data, such as the story locations for the map journey.
*   **Types:** A `types.ts` file is used to define shared TypeScript types.
