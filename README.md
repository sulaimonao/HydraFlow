# HydraFlow Actions API

HydraFlow dynamically manages memory, parses queries, generates sub-personas, and summarizes logs.

## Deployed Endpoints
Update `servers` in your `HydraFlow_actions.yaml` with your Vercel domain:
```
https://your-vercel-domain.vercel.app/api
```

## API Endpoints
- **`POST /compress-memory`**: Summarizes memory input.
- **`POST /parse-query`**: Extracts keywords and action items.
- **`POST /create-subpersona`**: Generates a sub-persona.
- **`POST /context-recap`**: Provides context recaps.
- **`POST /summarize-logs`**: Summarizes log details.

## Deployment Instructions
1. Clone this repository.
2. Deploy to Vercel:
   ```
   vercel deploy
   ```
3. Update `HydraFlow_actions.yaml` with your deployment URL.
```