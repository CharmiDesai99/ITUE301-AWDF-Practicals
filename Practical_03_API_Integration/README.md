# Practical 3: API Integration and Data Rendering in React

## Objective
To consume an external REST API asynchronously with loading and error states.

## Implementation Details
- Consumed GitHub REST API (https://api.github.com/users/:username/repos) inside Projects.jsx.
- Handled lifecycle with useEffect hook.
- Added visual states:
  - <Spinner />: Displayed while request is pending.
  - <ErrorMessage />: Displayed on network failure.
  - <RepoList />: Renders repository cards with live links and star counts.

## How to Run
`ash
cd frontend
npm install
npm run dev
`
