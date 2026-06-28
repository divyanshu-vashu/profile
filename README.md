

# Run the Next.js app

This project now runs as a Next.js App Router app while keeping the existing portfolio UI and component design intact.

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and fill in your API keys (see `.env.example` for reference)
3. Run the app:
   `npm run dev`
4. Build for production:
   `npm run build`

## Project Architecture & Configuration (Tags & Filters)

This project separates code from data/configuration. All project filters (categories) are dynamically loaded from the server configurations.

### 1. Categories Configuration File
The categories (filters) shown on the Projects page are configured in:
[project-page.config.json](file:///Users/vashusingh/Documents/Coding/project/portfilo-poc/storage/content/project-page.config.json)

```json
{
  "categories": ["All", "Web Apps", "Machine Learning", "CLI Tools"]
}
```

### 2. How to Add a New Filter
To add a new filter category (e.g., `"WASM Plugins"`):
1. Open [project-page.config.json](file:///Users/vashusingh/Documents/Coding/project/portfilo-poc/storage/content/project-page.config.json).
2. Add the new category name to the `"categories"` array:
   ```json
   {
     "categories": ["All", "Web Apps", "Machine Learning", "CLI Tools", "WASM Plugins"]
   }
   ```
3. Restart/refresh the app. The Projects page filters and the category selection dropdown in the "New Project" modal will automatically update.

### 3. How to Associate a Project with a Category Filter
Projects are stored as JSON metadata folders inside the `storage/content/projects/[project-slug]/index.json` structure.

To associate a project with your new category:
1. Open the project configuration JSON file (e.g., `storage/content/projects/sentinel-mcp/index.json`).
2. Update the `"category"` field to match the exact string name of the category filter (e.g., `"WASM Plugins"`):
   ```json
   {
     "title": "Sentinel MCP",
     "category": "WASM Plugins",
     "tags": ["Go", "MCP", "WASM"],
     "icon": "hub"
   }
   ```
   Now, clicking the `"WASM Plugins"` filter on the frontend will display this project.
