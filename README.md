# NeoBuddy Application

This application is built with React + TypeScript + Vite.

## Session Header Refresh Feature

### Overview
This feature implements a periodically refreshing header in the Session component of the NeoBuddy application. The header refreshes every 10 seconds to update session information and display new ads without disrupting other functionalities.

### Implementation Details

#### SessionHeader Component
A new `SessionHeader` component has been created that:
- Refreshes every 10 seconds using `setInterval`
- Updates session timer information from localStorage
- Dynamically fetches and displays ad content
- Maintains a clean, non-disruptive refresh cycle

#### Key Features
1. **Periodic Refresh**: The header automatically refreshes every 10 seconds.
2. **Non-Disruptive Behavior**: The refresh only affects the header section, leaving the rest of the application unaffected.
3. **Dynamic Content**: The header fetches and displays updated session data and new ads during each refresh cycle.

### Usage
The `SessionHeader` component is used in the `Session` component:

```tsx
<SessionHeader 
  sessionData={sessionData} 
  adContent={{ id: '1', content: 'Try our new AI features!' }} 
/>
```

### Props
- `sessionData`: Object containing session information (id, rewards_left, username, etc.)
- `adContent`: Optional object containing ad information (id, content, url)

### Testing
To test the periodic refresh functionality:
1. Navigate to the session page
2. Observe the header section (particularly the session timer and ad content)
3. Wait for 10 seconds to see the automatic refresh
4. Verify that the rest of the application remains unaffected

### Performance Considerations
- The component uses React's `useEffect` for cleanup to prevent memory leaks
- Only necessary parts of the header are re-rendered during refresh
- The refresh interval is set to a reasonable 10 seconds to balance freshness with performance

## Original Vite Template Information

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
