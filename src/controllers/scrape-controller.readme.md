These utilities have been created to scrape assets from a website and save them to various resources. The route sends the URL parameter to be scraped for images and site information. These assets are then uploaded to S3 and other areas depending on the parameters below.

### Scraping Route:

-   **POST**: `/api/cms-routes/scrape-site`

## Parameter Options

| Parameter          | Type    | Description                                          | Default Value |
| ------------------ | ------- | ---------------------------------------------------- | ------------- |
| `url` (required)   | String  | The website URL to scrape.                           | N/A           |
| `uploadLocation`   | String  | Duda website ID for uploading images.                | None          |
| `saveMethod`       | String  | Determines where to save images.                     | `dudaUpload`  |
|                    |         | - `dudaUpload`: Upload images to Duda                |               |
|                    |         | - `writeFolder`: Save images to a local folder       |               |
|                    |         | - `test`: Save images nowhere (for testing purposes) |               |
| `saveImages`       | Boolean | Whether to save scraped images.                      | `true`        |
| `scrapeImages`     | Boolean | Whether to scrape images at all.                     | `true`        |
| `backupImagesSave` | Boolean | Whether to backup save the images to S3.             | `true`        |
| `useAi`            | Boolean | Whether to use OpenAI to analyze the scrape.         | `true`        |

---

## Duda Environment Variables

Make sure the following environment variables are set for Duda integration:

-   `DUDA_USERNAME`: Duda username for the API endpoint.
-   `DUDA_PASSWORD`: Duda password for the API endpoint.

See the project README for generic project env variable usage

---

## Example Request Body

```json
{
    "url": "https://www.toymaniausa.com/",
    "uploadLocation": "duda id",
    "saveMethod": "dudaUpload",
    "saveImages": true,
    "useAi": true
}
```

### Scraped data cleanup

This route can be used to remove the scraped folder created in s3 from a site.
Simply pass the URL that you initially scraped in a DELETE request to the route
Route: /api/cms-routes/scrape-site (DELETE)
