This project uses node.js to create and edit JSON files for the purpose of rendering websites on the Apex platform. The endpoints are available on the Vercel deployed website at [cms-routes.vercel.app](cms-routes.vercel.app). The develop branch version is live at [https://cms-routes-develop.vercel.app/](https://cms-routes-develop.vercel.app)

## API Routes

-   /api/cms-routes/save (POST): save Luna CMS data to create Apex sites
-   /api/cms-routes/landing (POST): Create/edit a landing page, publishes to www.townsquareignite.com/landing/siteName/pageName, edits site if it already exists
-   api/cms-routes/landing-domains/ (DELETE): remove domain tied to a landing page client, just pass one like this "/landing-domains/www.example.com/pageName". Make sure you passing domain with pagename.
-   api/cms-routes/apexIDs/ (DELETE): remove all domains and S3 folders tied to an apexID, just pass the apexID of the client
-   api/cms-routes/landing-request-data?domain="your domain here" (GET): pass a landing domain with page name and it will return the request data saved from the LP creation tool
-   api/cms-routes/check-domain-config?domain="your domain here" (GET): pass a domain and it will return the configuration status and DNS records needed
-   /api/cms-routes/create-site (POST): Create an Apex site with a default template, adds domain using ApexID
-   /publish (PATCH): Set an already created Apex site to render with site data (on by default)
-   /unpublish (PATCH): Set an already created Apex site to redirect to the townsquare main website

Take a look at the zod input and output files in the schema directory to have an idea of the JSON data needed for these requests.

## Getting Started

If you are running locally, you need S3 credentials to be able to upload the needed created JSON files to S3 (CMS env variables below). Vercel env variables are needed to work with domains on the projects. Remember DO NOT ever commit your .env file to GitHub as it is not safe to expose the S3 variables. Examples of these env variables can be found inside the Vercel project settings at [https://vercel.com/townsquare-interactive/apex-transformer/settings/environment-variables](https://vercel.com/townsquare-interactive/apex-transformer/settings/environment-variables).

### Env variables Used:

-   CMS_ACCESS_KEY_ID: AWS access key,
-   CMS_SECRET_ACCESS_KEY_ID: AWS Secret access key
-   CMS_DEFAULT_REGION: AWS default Region
-   MAKE_URL: Make.com webhook url for sending form emails
-   NEXT_PUBLIC_VERCEL_TEAM_ID: Our Townsquare Vercel team ID
-   NEXT_PUBLIC_VERCEL_AUTH_TOKEN: Vercel auth token
-   VERCEL_PROJECT_ID: ID of the current vercel project
-   CREATE_SITE_DOMAINS: Decides whether or not a domain is published when creating a landing page (default: 1)

These env variables are also present in the .env.example file where you can see any default values and copy them to your .env file.

```bash
npm i
npm run dev
# or
yarn dev
```

App runs locally on [http://localhost:8080](http://localhost:8080)

Testing set up through vitest. To run tests

```bash
npm run test
```

## Landing Page Domains

By default the landing page route will create a domain on the Apex Renderer Vercel project. You can manipulate this activity to not publish a domain with the env variable "CREATE_SITE_DOMAINS".

## Error Responses

Listed below are the common error types that can be seen in the API response after an error occurs. Each error also has a unique ID that will appear in the response (ex. "2f26df77-56b6-42f8-94ca-e395658f85f4") that you can search in the project's Vercel logs to learn more about the incident [https://vercel.com/townsquare-interactive/apex-transformer/logs](https://vercel.com/townsquare-interactive/apex-transformer/logs).

### Error response structure

-   id: Generated random ID specific to this instance
-   errorType: Type of error to be seen in table below (if common error)
-   message: General message on what caused the error
-   state: current State of the app (can give more info depending on errorType)
-   req: Request JSON sent to the route that caused the error

### Common Error Types

<!-- ERROR_TABLE_START -->

| Error Type | Description                                                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| DMN-001    | Domain not able to be added to Vercel. Both the normal URL and the modified postfix version are taken. Try another URL name. |
| DMN-002    | After 3 attempts to verify URL is live we are not able to receive a 200 status from the new URL.                             |
| GEN-003    | General JavaScript error when going through site deployment tasks.                                                           |
| VAL-004    | Error validating incoming request data.                                                                                      |
| VAL-005    | Error validating transformed data being sent to S3.                                                                          |
| AMS-006    | Site files not found in s3, domain cannot be updated.                                                                        |
| AMS-007    | Error when trying to upload site files to S3.                                                                                |
| DMN-008    | Production domain not available, try a different domain.                                                                     |
| DMN-009    | Error when checking domains config setup in Vercel                                                                           |
| AMS-010    | Unable to find requestData saved in page file, likely older page                                                             |

<!-- ERROR_TABLE_END -->
