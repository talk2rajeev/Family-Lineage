# Family Tree

Interactive family tree app built with Next.js, React Flow, Zustand, and ELK layout.

## Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Short implementation details

### Tech stack

- Next.js App Router for the UI shell
- `@xyflow/react` for rendering and interacting with the graph
- Zustand for tree state and expansion/collapse behavior
- `elkjs` for auto-arranging nodes
- Tailwind CSS for styling

### Data model

- Tree data currently comes from [src/data/sampleData.ts](/Users/rajeev/workspace/Ai/family-tree/src/data/sampleData.ts:1)
- Each person is stored as a `FamilyNode`
- Relationships are stored as `FamilyEdge` with `parent-child` or `spouse` types
- Spouse records still exist in source data, but the UI merges spouse details into the main card instead of rendering a separate spouse node

### Rendering flow

- [src/app/page.tsx](/Users/rajeev/workspace/Ai/family-tree/src/app/page.tsx:1) loads sample data into the store and renders the canvas
- [src/components/FamilyTreeCanvas.tsx](/Users/rajeev/workspace/Ai/family-tree/src/components/FamilyTreeCanvas.tsx:1) hosts React Flow, minimap, controls, context menu, and node click handlers
- [src/components/nodes/FamilyNode.tsx](/Users/rajeev/workspace/Ai/family-tree/src/components/nodes/FamilyNode.tsx:1) renders each person card, including the embedded `Married to` section when a spouse exists

### State and tree behavior

- [src/store/familyStore.ts](/Users/rajeev/workspace/Ai/family-tree/src/store/familyStore.ts:1) is the main state layer
- It computes parent-child depth from the graph
- By default, only 3 levels are shown
- Clicking a node with children toggles that branch open or closed
- Extra vertical spacing is added per depth level so expanded descendants have a visible gap
- Dragged positions and auto-layout positions are stored back into the tree state

### Layout

- The app starts from stored node positions in sample data
- Auto Arrange uses ELK layered layout from [src/lib/layout.ts](/Users/rajeev/workspace/Ai/family-tree/src/lib/layout.ts:1)
- Nodes with embedded spouse details get a slightly larger layout box so cards do not overlap as easily

## Current scope

- Sample family tree only
- Sign-in modal UI exists, but persistence is not fully wired for tree editing yet
- Tree editing actions are still minimal and mostly read/explore focused
