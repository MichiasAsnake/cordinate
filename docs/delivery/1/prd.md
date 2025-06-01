# PBI-1: Implement Minimum Viable Product (MVP) User Interface

[View in Backlog](../backlog.md#user-content-1)

## Overview

Develop the core user interface components including a search bar, a sidebar with tag-based workflows and recent orders, and a workflow page displaying filtered orders in a table format, based on the provided mockups.

## Problem Statement

Currently, there is no user interface to interact with the order data stored in the database. A UI is needed to allow users to view, search, and filter orders by workflow.

## User Stories

- As a user, I want to see a list of available workflows (tags) in a sidebar so I can easily navigate to orders for a specific workflow.
- As a user, I want to see my recently viewed orders in the sidebar so I can quickly access them again.
- As a user, I want to search for orders by keywords so I can find specific orders quickly.
- As a user, when I select a workflow, I want to see a table of all relevant orders for that workflow.
- As a user, I want to be able to filter the orders displayed in the workflow table by status, due date, and priority.
- As a user, I want to be able to reset all filters on the workflow page.
- As a user, I want a dropdown/selector that allows switching between workflows on the workflow page.

## Technical Approach

(To be filled in with specific implementation details in subsequent tasks)

## UX/UI Considerations

Refer to the provided mockups for the desired layout and appearance of the search bar, sidebar, and workflow page. Pay attention to the table format, filtering options, and visual representation of tags and status.

## Acceptance Criteria

- A user interface is implemented with a search bar, sidebar, and main content area.
- The sidebar displays a list of tags from the database.
- The sidebar displays a list of up to 5 recently viewed orders with status indicator, order number, and main tag.
- Clicking a tag in the sidebar navigates to a workflow page for that tag.
- The workflow page displays a table of orders associated with the selected tag.
- The order table includes columns for Order #, Title, Status, Assigned To, Due Date, and Tags.
- Status and Tags in the table are visually distinct (color-coded/icons).
- Filters for Status, Date, and Priority are present on the workflow page.
- Applying filters updates the displayed orders.
- A "Reset" button clears all active filters.
- A dropdown/selector allows switching between workflows on the workflow page.
- The search bar allows searching orders based on text content (initially filtering the current workflow page).

## Dependencies

Access to the database containing order and tag information.

## Open Questions

- What framework/library should be used for the frontend? (e.g., React, Vue, Angular)
- How will the recent orders be persisted? (e.g., local storage, database)
- How will the search functionality be implemented? (e.g., frontend filtering, backend search)

## Related Tasks

(To be added as tasks are defined)
