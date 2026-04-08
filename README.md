# SEL2
- software engineering 2 labor - semester project 'Tour Planner'
  
# TourPlanner
- single-screen Angular frontend application for managing tours and tour logs
 
## UI Layout & Wireframes & Design Decisions
### Screen Layout
- single-screen layout divided into four zones — a top navigation bar, a tour list on the left, a central map, and a bottom details panel
- follows the principle of spatial consistency: the user always sees the tour list on the left, the map as the main focus, and the details of the active item below 
### Tour List — Left Sidebar
- following the natural left-to-right reading pattern
- the user browses the list, selects a tour, and the result is immediately reflected in the map and the bottom panel — without any page transition
### Map as the Central Element
- the largest portion of the screen because it will provide key visual context for tours/tour logs
- map stays visible even while browsing details, supporting spatial awareness — the user never loses track of where a route is located
### Wireframes
<img width="2084" height="1267" alt="Screenshot 2026-04-07 at 18 36 40" src="https://github.com/user-attachments/assets/bf111900-a31a-4bf9-ab98-f21f4b8426e3" />
wireframe 1: default window
<img width="2084" height="1268" alt="Screenshot 2026-04-07 at 18 39 09" src="https://github.com/user-attachments/assets/e20de4e2-e8af-408f-aa97-680356c9205b" />
wireframe 2: a tour was selected by user
<img width="2084" height="1270" alt="Screenshot 2026-04-07 at 18 40 11" src="https://github.com/user-attachments/assets/0233bfc3-daa2-4e6f-84f5-a51a32eaa484" />
wireframe 3: tour logs was selected by user in the bottom menu
<img width="2086" height="1265" alt="Screenshot 2026-04-07 at 18 40 42" src="https://github.com/user-attachments/assets/65e8a77a-eefd-4dd5-84d7-9734857d3995" />
wireframe 4: a tour log was selected by user

