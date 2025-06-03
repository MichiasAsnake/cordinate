# PBI-4: Order Details Interface

[View in Backlog](../backlog.md#user-content-4)

## Overview

Implementation of a comprehensive order details interface that serves as the command center for job management and team collaboration. This interface will replace scattered communication and provide a centralized location for all job-related information and team interaction.

## Problem Statement

Currently, job information is fragmented across multiple systems and communication happens via email or other external tools. Team members need a unified interface where they can:

- View all job details in one place
- Collaborate in context with internal comments
- Access files and images related to the job
- Track the job's progress through the workflow

The existing system provides basic job listing functionality, but lacks detailed view capabilities and team collaboration features.

## User Stories

### Primary User Story

As a user, I want to view comprehensive job details in a modern interface so I can access all job information and collaborate with my team effectively. I want to see job metadata, customer contact information, order items, and process tags in a structured left column. I want to use an internal communication thread in the right column where I can add comments, mention teammates, attach files, and pin important messages.

### Supporting User Stories

- As a designer, I want to quickly access job files and customer requirements so I can understand what needs to be created
- As a production worker, I want to see process tags and order quantities so I can prepare the correct materials
- As a customer service representative, I want to view customer contact information and order details so I can answer inquiries
- As a team lead, I want to communicate with team members about specific jobs so coordination happens in context
- As a quality controller, I want to pin important notes and attach reference images so critical information is highlighted

## Technical Approach

### Architecture

- **Frontend**: React components with TypeScript
- **Backend**: Next.js API routes with PostgreSQL database
- **Real-time**: WebSocket or Server-Sent Events for live updates
- **File Storage**: Integration with existing blob storage for images and file attachments

### Two-Column Layout

- **Left Column (40-45% width)**: Order metadata display
- **Right Column (55-60% width)**: Communication thread

### Data Sources

- **Existing Data**: Job information from current scraping system
- **Enhanced Data**: Customer contact details, order line items from job details pages
- **New Data**: Comments, file attachments, mentions, pins

### Performance Requirements

- Initial page load: <2 seconds
- Comment posting: <1 second
- File upload: Progress indication with success/error handling
- Real-time updates: <500ms latency

## UX/UI Considerations

### Visual Design

- **Card-based Layout**: Information grouped in visual cards
- **Status Indicators**: Color-coded badges for job status and process tags
- **Typography Hierarchy**: Clear distinction between primary and secondary information
- **Iconography**: Consistent icons for actions and content types

### Responsive Design

- **Desktop First**: Optimized for 1280px+ screens (primary use case)
- **Tablet Adaptation**: Adjusted column ratios and navigation
- **Mobile Strategy**: Stacked columns with collapsible sections

### Accessibility

- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full functionality without mouse
- **Color Contrast**: WCAG AA compliance
- **Focus Management**: Logical tab order

### User Experience

- **Loading States**: Skeleton loaders and progress indicators
- **Error Handling**: Clear error messages with recovery options
- **Optimistic Updates**: Immediate UI feedback for user actions
- **Auto-save**: Draft comments and form data preservation

## Acceptance Criteria

### Left Column - Order Metadata

- [ ] Display job number prominently with copy-to-clipboard functionality
- [ ] Show job title/description with proper text wrapping
- [ ] Display status badge with color coding matching existing system
- [ ] Show due date with visual urgency indicators
- [ ] Display customer information (name, email, phone) with click-to-contact functionality
- [ ] List order line items in table format with asset tags, quantities, and costs
- [ ] Show process tags with same visual styling as existing system
- [ ] Display file attachments and images in grid layout with preview functionality

### Right Column - Communication Thread

- [ ] Display existing job descriptions from scraper as initial comments
- [ ] Provide comment composer with rich text formatting
- [ ] Implement @mention functionality with autocomplete
- [ ] Support file attachment to comments with drag-and-drop
- [ ] Display comments chronologically with author and timestamp
- [ ] Allow comment pinning with visual distinction
- [ ] Implement real-time updates when new comments are added
- [ ] Provide comment editing and deletion (with permissions)

### Technical Requirements

- [ ] Integrate with existing authentication system
- [ ] Support existing job data structure from scraper
- [ ] Implement responsive design across device sizes
- [ ] Provide comprehensive error handling and loading states
- [ ] Include automated testing for all major functionality
- [ ] Implement proper data validation and sanitization
- [ ] Support concurrent user access with conflict resolution

### Performance Requirements

- [ ] Page load time under 2 seconds for job details
- [ ] Comment posting response time under 1 second
- [ ] File upload with progress indication and error handling
- [ ] Real-time comment updates with <500ms latency
- [ ] Optimize image loading with lazy loading and thumbnails

## Dependencies

### Data Dependencies

- **Existing Job Data**: From current scraping system (job number, customer, order details, process tags, images)
- **Enhanced Data Extraction**: Customer contact details and order line items from job details pages
- **Database Schema**: Extensions for comments, file attachments, and user mentions

### Technical Dependencies

- **Authentication System**: User identification for comments and mentions
- **File Upload Service**: Handling and storage of comment attachments
- **Real-time Infrastructure**: WebSocket or SSE implementation
- **Image Processing**: Thumbnail generation and optimization

### External Dependencies

- **Design System**: Consistent styling with existing application
- **Testing Framework**: Unit and integration test setup
- **Deployment Pipeline**: CI/CD integration for new components

## Open Questions

1. **User Permissions**: Should comment editing/deletion be limited to comment authors or include admin overrides?
2. **File Size Limits**: What are appropriate limits for file attachments to comments?
3. **Comment Threading**: Should we implement reply threads or keep flat comment structure?
4. **Notification System**: How should users be notified of @mentions - email, in-app, or both?
5. **Comment History**: Should we maintain edit history for comments or just current version?
6. **Mobile UX**: Should mobile users get a simplified interface or full functionality?
7. **Integration Timeline**: How should this integrate with existing workflow pages - replace or complement?

## Related Tasks

Tasks for this PBI will be created in the tasks.md file and include:

**Phase 1: Enhanced Data Extraction**

- Extend JobData interface and database schema
- Implement detailed job data extraction from job details pages
- Create data migration for existing job records

**Phase 2: UI Components Development**

- Build left column components (JobHeader, CustomerInfo, OrderItems, etc.)
- Develop right column components (CommunicationThread, Comment, CommentComposer)
- Implement responsive layout and design system integration

**Phase 3: Communication System Backend**

- Create database schema for comments, files, and mentions
- Implement API endpoints for comment CRUD operations
- Add real-time update infrastructure

**Phase 4: Advanced Features**

- Implement @mention system with autocomplete
- Add file upload and attachment functionality
- Create search and filtering capabilities
- Implement comment pinning and organization features

## Success Metrics

### User Adoption

- Time spent on job details page (target: increase vs current workflow pages)
- Comment activity (new feature - baseline establishment)
- File attachment usage (new feature - baseline establishment)

### Efficiency Gains

- Reduced support tickets related to job information requests
- Faster job completion times through better coordination
- Decreased email usage for job-related communication

### Technical Performance

- Page load time: <2 seconds
- Comment posting speed: <1 second
- File upload success rate: >99%
- System uptime: >99.9%
