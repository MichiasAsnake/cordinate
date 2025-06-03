# PBI-3: Daily Checklist Feature for Dashboard

[View in Backlog](../backlog.md#user-content-3)

## Overview

This PBI implements a Notion-style daily checklist feature on the dashboard that allows users to create personalized task lists from available orders, track progress throughout the day, and add personal notes to each item.

## Problem Statement

Users currently have no way to create a personalized daily task list from their available orders. They need a focused view of their daily priorities that they can check off as work progresses, with the ability to add contextual notes and maintain progress throughout their workday.

## User Stories

1. **As a user**, I want to browse orders using tag navigation so I can find relevant work for my daily checklist.
2. **As a user**, I want to select specific orders from the workflow table and add them to my personal checklist.
3. **As a user**, I want to see my checklist prominently on the dashboard with essential order information.
4. **As a user**, I want to check off completed items and see them visually crossed out but still visible.
5. **As a user**, I want to add personal notes to each checklist item for context and reminders.
6. **As a user**, I want to uncheck items if I need to mark them as incomplete again.
7. **As a user**, I want my checklist to persist throughout my browser session.
8. **As a user**, I want to remove items from my checklist when they're no longer needed.

## Technical Approach

### Data Storage

- Use browser localStorage for checklist persistence across sessions
- Store checklist data as JSON with order information, completion status, and user notes
- Include timestamp metadata for potential future features (daily reset, history)

### UI/UX Design

- Add checklist as a prominent card/section on the dashboard
- Integrate "Add to Checklist" buttons in the workflow table
- Use checkbox components with smooth animations for checking/unchecking
- Implement strikethrough effect for completed items
- Add inline editable notes with autosave functionality
- Include progress indicator (e.g., "3 of 7 completed")

### Data Flow

1. User navigates to workflow page using tag filters
2. User clicks "Add to Checklist" button on desired orders
3. Orders are added to localStorage and dashboard checklist updates
4. User can interact with checklist items (check/uncheck, edit notes, remove)
5. All changes persist to localStorage immediately

## UX/UI Considerations

### Visual Design

- Follow existing design system (colors, typography, spacing)
- Use consistent card styling with other dashboard components
- Implement smooth animations for state changes
- Clear visual hierarchy between completed/incomplete items
- Accessible color contrast for strikethrough text

### Interaction Design

- Single-click to check/uncheck items
- Inline editing for notes with clear save/cancel states
- Hover states for interactive elements
- Keyboard navigation support
- Clear visual feedback for all actions

### Layout Integration

- Position checklist prominently on dashboard (top-right or dedicated section)
- Responsive design for different screen sizes
- Collapse/expand functionality if checklist becomes long
- Clear empty state when no items in checklist

## Acceptance Criteria

1. **Checklist Management**

   - Users can add orders to their checklist from the workflow table
   - Users can remove orders from their checklist
   - Checklist data persists across browser sessions using localStorage

2. **Item Interaction**

   - Users can check/uncheck items with immediate visual feedback
   - Completed items show strikethrough effect but remain visible
   - Users can add, edit, and save notes for each checklist item
   - Notes autosave after user stops typing (debounced)

3. **Visual Design**

   - Checklist integrates seamlessly with existing dashboard design
   - Progress indicator shows completed vs total items
   - Clear visual distinction between completed and incomplete items
   - Responsive layout works on different screen sizes

4. **User Experience**
   - "Add to Checklist" buttons are easily accessible in workflow table
   - Clear feedback when items are added/removed from checklist
   - Empty state provides guidance for first-time users
   - All interactions follow existing app patterns and are intuitive

## Dependencies

- Existing workflow table and tag filtering system
- Dashboard component structure
- Design system components (buttons, cards, checkboxes)
- Local storage utility functions

## Open Questions

1. Should checklist automatically reset daily, or persist indefinitely?
2. Should we add drag-and-drop reordering of checklist items?
3. Should completed items eventually hide after a certain time?
4. Do we need checklist templates or categories?
5. Should we track completion timestamps for analytics?

## Related Tasks

[View Tasks](./tasks.md)
