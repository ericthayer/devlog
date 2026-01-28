**OBJECTIVE:**
Building production-ready React applications with TypeScript and Google Gemini AI integration.

**REASON:**
Enables rapid prototyping and design collaboration with AI-powered assistance while delivering production-quality, maintainable code for development teams.

**DESCRIPTION:**
Use these instructions when building React applications in TypeScript that integrate with Google Gemini APIs, independent of specific UI frameworks.

**INSTRUCTIONS:**
Create responsive, accessible React applications with TypeScript using strict configuration and Gemini API integration.

**IMPORTANT!** Before you start a task, or make a new change, follow these _rules_:

- DO NOT change the visual design, theme styling, or composition of the UI once a `checkpoint`, and/or a component or pattern has been established. 

- DO NOT revert any "styling" (CSS/Layout) or "scripting" (TS/JSX) change intentionally by me.

- DO NOT make changes outside the scope of the requested feature, i.e., don't modify the main navigation when asked to build a data table.

- ALWAYS break out code into reusable components ready for export via ES module

Include the following specifications:

1. **Accessibility & Performance**: Prioritize as first-class features. Follow [Web Interface Guidelines](.github/instructions/web-interface-guidelines.instructions.md):
   - Semantic HTML (`<button>`, `<a>`, `<label>`, `<form>`)
   - ARIA labels for icon-only buttons and form controls
   - Keyboard navigation and visible focus states
   - Screen reader support with `aria-live` for async updates
   - No paste-blocking or zoom-disabling
   - Images with explicit dimensions

2. **Adaptive Layout & Mobile-First UX**: Use CSS custom properties, Container Queries, and dynamic viewport units (`cqw`, `dvh`) for responsive design. Implement touch-friendly interactions.

3. **TypeScript**: Use strict typing throughout. Define interfaces for component props. Avoid `any`.

4. **Component Structure**:
   - One component per file with PascalCase filename (`.tsx`)
   - Functional components with hooks
   - Explicit prop types via interfaces
   - `defaultProps` for optional props
   - Named exports or single default export

5. **State Management**: 
   - Use `useState` and `useContext` for local/shared state
   - Consider Context API for multi-level prop passing (2-3+ levels)
   - URL state for filters, tabs, pagination, expanded panels (use libraries like `nuqs`)
   - Manage Gemini API response state separately from UI state

6. **Styling**: 
   - Use a consistent CSS-in-JS solution (Emotion, styled-components) or utility-based CSS
   - Create reusable design tokens (colors, typography, spacing)
   - Support light/dark modes for (Tailwind)[https://tailwindcss.com/docs/dark-mode#with-system-theme-support] & (MUI)[https://mui.com/material-ui/customization/dark-mode/#the-solution-css-variables]; persist user preference
   - Avoid `transition: all`; list properties explicitly
   - Honor `prefers-reduced-motion`

7. **Forms & Inputs**:
   - Inputs require `<label>` or `aria-label`
   - Use correct `type` and `inputmode`
   - Include validation inline near fields
   - Disable submit button during Gemini API requests; show loading state
   - Focus first error on submit
   - No paste-blocking; allow autocomplete
   - Show streaming indicator when receiving Gemini responses

8. **Icons**: Use inline SVG or icon libraries (e.g., Lucide). No webfont icons.

9. **Images**: 
   - Explicit `width` and `height` to prevent layout shift
   - Lazy load below-fold images
   - Preload critical above-fold images
   - Handle Gemini-generated images with proper error states

10. **Performance**:
    - Virtualize large lists (>50 items)
    - Avoid layout reads in render (`getBoundingClientRect`, `offsetHeight`)
    - Batch DOM operations
    - Use uncontrolled inputs where possible
    - Memoize expensive computations (`useMemo`, `useCallback`)
    - Debounce Gemini API calls to prevent rate limiting

11. **Gemini API Integration**:
    - Use official Google Generative AI client library (`@google/generative-ai`)
    - Implement proper error handling for API failures with user-friendly messages
    - Show loading states during API requests; support request cancellation
    - Stream responses when available for better perceived performance
    - Implement rate limiting and retry logic with exponential backoff
    - Validate and sanitize API responses before rendering
    - Store API keys securely (never in client code; use environment variables or backend proxy)
    - Display clear attribution/disclosure that content is AI-generated

12. **Navigation & Deep Linking**: 
    - Use `<a>` or router `<Link>` (support Cmd/Ctrl+click)
    - Sync URL with component state
    - Support deep linking for all interactive features
    - Persist AI-generated content state appropriately

13. **Destructive Actions**: Require confirmation modal or undo window. Never immediate.

14. **Chat/Conversation UI** (if applicable):
    - Display clear visual distinction between user and AI messages
    - Show typing/streaming indicators during Gemini response generation
    - Support message editing and regeneration
    - Implement message history with scroll-to-latest functionality
    - Include copy-to-clipboard for AI responses
    - Add feedback mechanism (thumbs up/down) for response quality

15. **Content Generation** (if applicable):
    - Provide context/prompt templates for consistent results
    - Show token usage or cost estimates if applicable
    - Allow users to adjust generation parameters (temperature, length)
    - Display content source/attribution clearly
    - Implement review/edit workflow before publishing generated content

16. **Testing & Documentation**: 
    - Unit tests for core components and utilities
    - Mock Gemini API responses for testing
    - Visual regression tests when possible
    - Storybook or equivalent for documentation
    - Accessibility audits (APAC/WCAG)
    - Test error scenarios and API failures

17. **Web Standards Compliance**: Follow all guidelines in [Web Interface Guidelines](.github/instructions/web-interface-guidelines.instructions.md) for forms, focus, animations, content handling, hydration, and copy.