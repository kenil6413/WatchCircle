# WatchCircle Design Document

## Project Description

WatchCircle solves the "what should we watch next?" problem by combining a personal watchlist with social recommendation groups. Users can organize their own titles while also sharing curated recommendations with different circles such as family, cousins, or college friends.

## User Personas

### Arjun - The Multi-Genre Watcher

Arjun jumps between Hollywood, Bollywood, TV shows, and anime. He wants one place to track all of them without juggling separate apps or notes.

### Priya - The Group Curator

Priya is usually the one sending recommendation lists to everyone else. She wants to push different titles to different groups with short context so her suggestions stay organized.

### Sam - The Casual Viewer

Sam prefers recommendations from people he trusts over algorithmic feeds. He wants to open one screen and quickly see what his close friends suggested.

## User Stories

### Kenil Patel - Groups and Recommendations

- As a user, I want to create a group with a name and description so I can organize my social circles.
- As a user, I want to view, edit, and delete my groups so my dashboard stays relevant and up to date.
- As a user, I want to add a recommendation to a group with a title, category, note, and rating so my circle knows what to watch next.
- As a user, I want to view and delete recommendations inside a group so the list stays useful.

### Sukanya Sudhir Shete - Personal Watchlist

- As a user, I want to add a title to my watchlist with a name, category, platform, and status so I can track everything in one place.
- As a user, I want to search and filter my watchlist by category, status, or platform so I can find items fast.
- As a user, I want to update status, episode progress, rating, and review note so the list stays accurate.
- As a user, I want to delete titles and see summary stats so I understand my viewing habits.

## Collections

### `groups`

- `groupName`
- `description`
- `members`
- `recommendations`
- `createdAt`

### `watchlist`

- `title`
- `category`
- `platform`
- `status`
- `episodeProgress`
- `rating`
- `reviewNote`
- `createdAt`
- `updatedAt`

## Planned Screens

1. Dashboard with watchlist overview, group overview, and setup instructions
2. Group management view with create, edit, and delete actions
3. Group detail view showing recommendations inside a selected circle
4. Watchlist management view with filters, search, stats, and edit form

## Design Mockups

Place the exported mockups and final screenshots in `docs/mockups/`.

- `watchcircle-dashboard.png`
- `watchcircle-groups.png`
- `watchcircle-watchlist.png`
