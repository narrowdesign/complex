# Complex

> A complex is a collection of thoughts, feelings, attitudes, and memories that focus on a single concept. The more elements attached to the complex, the greater its influence on the individual. —Carl Jung

## Overview

**Complex** is a visual knowledge-mapping web application for creating interconnected webs of ideas, people, places, artifacts, and organizations. It provides an infinite canvas where you can spatially arrange and connect concepts to explore relationships between them.

## Features

- **Agent Types**: Create nodes of different types with distinct visual styling:
  - 🟠 **Concept** - Ideas, themes, theories
  - 🔵 **Artifact** - Books, works, creations
  - 🩷 **Person** - People, historical figures
  - ⚪ **Organization** - Companies, institutions, groups
  - 🟢 **Place** - Locations, cities, countries

- **Infinite Canvas**: Pan around a limitless workspace with spacebar + drag

- **Relationships**: Connect agents with labeled relationships (Alt + drag between agents)

- **Multiple Complexes**: Create separate collections for different topics

- **Visual Customization**: Scale and blur agents to represent importance or certainty

- **Offline-First**: Works entirely in the browser with localStorage persistence

- **Backup/Restore**: Export and import your data as JSON files

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Create new agent |
| `Backspace` | Delete selected agents |
| `Escape` | Cancel / remove empty agents |
| `Space + Drag` | Pan canvas |
| `Alt + Drag` | Create relationship between agents |
| `Shift/Cmd + Click` | Multi-select |
| `Arrow Keys` | Nudge selected agents |
| `Shift + Arrow` | Nudge faster (10x) |
| `Alt + Arrow` | Nudge slower (0.25x) |
| `1-5` | Filter by agent type |
| `0` | Show all types |
| `Ctrl + Scroll` | Scale agent |
| `Scroll` | Blur agent |
| `Cmd + Z` | Undo |
| `Cmd + Shift + Z` | Redo |
| `Cmd + V` | Paste copied agents |

## Getting Started

1. Open `index.html` in a modern browser
2. Click and hold anywhere to see the agent type menu
3. Select a type to create your first agent
4. Name your complex when prompted
5. Double-click agents to edit their labels
6. Alt+drag from one agent to another to create relationships

## Philosophy

See `philosophy.html` for the design principles behind Complex:

- Use it without an internet connection
- The individual decides the structure, not the computer
- The value is in the creation, not in the storing, retrieving, or sharing
- The relationships between things holds more information than the things themselves

---

## Suggested Improvements

### High Priority

1. **Mobile/Touch Support**
   - Add touch event handlers for mobile devices
   - Implement pinch-to-zoom for scaling
   - Touch-friendly agent creation menu

2. **Accessibility**
   - Add ARIA labels for screen readers
   - Improve keyboard navigation
   - Add focus indicators
   - High contrast mode option

3. **Data Persistence Improvements**
   - Add IndexedDB support for larger datasets
   - Implement auto-save with debouncing
   - Add data versioning for migrations

4. **Search & Filter**
   - Add text search across all agents
   - Filter by relationship type
   - Quick-jump to agent by name

### Medium Priority

5. **Performance Optimizations**
   - Implement viewport culling (only render visible agents)
   - Use requestAnimationFrame for animations
   - Add virtual scrolling for large datasets
   - Consider using Canvas API or WebGL for large graphs

6. **Export/Import Formats**
   - Export to SVG/PNG for sharing
   - Import from common formats (CSV, Markdown)
   - Export to graph formats (GraphML, DOT)

7. **Collaboration Features**
   - Optional cloud sync (Firebase, Supabase)
   - Share read-only links
   - Real-time collaboration (WebRTC)

8. **UI/UX Enhancements**
   - Mini-map for navigation
   - Zoom controls
   - Undo/redo history panel
   - Agent templates/presets
   - Grouping/clustering of agents
   - Snap-to-grid option

### Low Priority

9. **Code Quality**
   - Migrate to ES6 modules
   - Add TypeScript for type safety
   - Implement proper state management (consider Zustand or similar)
   - Add unit tests
   - Use a build tool (Vite) for development

10. **Extended Features**
    - Agent annotations/notes
    - Image attachments
    - URL linking
    - Timeline view for temporal relationships
    - Different layout algorithms (force-directed, hierarchical)
    - Markdown support in labels

### Bug Fixes Needed

- The `<script>` tags are placed after `</html>` - should be inside `<body>`
- Commented-out lens effect code should be removed or documented
- Empty `chaos()` and `animate()` functions should be implemented or removed
- Some CSS has vendor-specific fonts that may not be available on all systems

---

## File Structure

```
├── index.html           # Main application
├── philosophy.html      # Design philosophy page
├── script.js            # Application logic
├── style.css            # Main styles
├── philosophy.css       # Philosophy page styles
├── complexes.js         # Sample data
├── complexes.json       # JSON data export
├── notes.md             # Development notes
├── data/
│   └── backups/         # Backup files
└── _working/            # Work-in-progress files
```

## Browser Support

Tested on modern browsers (Chrome, Firefox, Safari, Edge). Requires JavaScript enabled and localStorage support.

## License

Personal project - no license specified.
