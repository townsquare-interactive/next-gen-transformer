This project creates JSON files to render websites for the Apex platform. The endpoints are available on the vercel deployed site at [cms-routes.vercel.app](cms-routes.vercel.app)

Routes

-   /api/cms-routes/landing (POST): save Luna CMS data to create Apex sites
-   /api/cms-routes/landing (POST): Create/edit a landing page, uses URL to create vercel domain. Edits website data if domain already exists.
-   /api/cms-routes/create-site (POST): Create an Apex site with a default template, adds domain using ApexID
-   /publish (PATCH): Set an already created Apex site to render with site data (on by default)
-   /unpublish (PATCH): Set an already created Apex site to redirect to the townsquare main website

Take a lood at the zod input and output files in the schema directory to have an idea of the JSON data needed for these requests.

## Getting Started

If running locally, need S3 credentials to be able to upload the needed created JSON files to S3 (CMS env variables below). Vercel env variables are needed to work with domains on the projects. Remember DO NOT ever commit your .env file to GitHub as it is not safe to expose the S3 variables.

Env variables Used: CMS_ACCESS_KEY_ID, CMS_SECRET_ACCESS_KEY_ID, CMS_DEFAULT_REGION, MAKE_URL, NEXT_PUBLIC_VERCEL_TEAM_ID, NEXT_PUBLIC_VERCEL_AUTH_TOKE, VERCEL_PROJECT_ID

```bash
npm run dev
# or
yarn dev
```

App runs locally on [http://localhost:8080](http://localhost:8080)

# Error Type List

This section provides information about the error types used in the project.

<!-- ERROR_TABLE_START -->

| Error Type | Description                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| DMN-001    | Domain not able to be added to Vercel. Both the normal URL and the postfix (-lp) version are taken. Try another URL name. |
| DMN-002    | After 3 attempts to verify URL is live we are not able to receive a 200 status from the new URL.                          |
| GEN-003    | General JavaScript error when going through site deployment tasks.                                                        |
| VAL-004    | Error validating incoming request data.                                                                                   |
| VAL-005    | Error validating transformed data being sent to S3.                                                                       |
| AMS-006    | Site files not found in s3, domain cannot be updated.                                                                     |
| AMS-007    | Error when trying to upload site files to S3.                                                                             |

<!-- ERROR_TABLE_END -->
