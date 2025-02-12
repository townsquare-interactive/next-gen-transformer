These utilities have been created to scrape assets from a website and save them to various resources. The route sends the URL parameter to be scraped for images and site information. These assets are then uploaded to S3 and other areas depending on the parameters below.

### Scraping Route:

-   **POST**: `/api/cms-routes/scrape-site`

## Parameter Options

| Parameter                       | Type    | Description                                                     | Default Value |
| ------------------------------- | ------- | --------------------------------------------------------------- | ------------- |
| `url` (required)                | String  | The website URL to scrape.                                      | N/A           |
| `saveMethod`                    | String  | Determines where to save images.                                | `s3Upload`    |
|                                 |         | - `dudaUpload`: Upload images to Duda (requires uploadLocation) |               |
|                                 |         | - `writeFolder`: Save images to a local folder                  |               |
|                                 |         | - `s3Upload`: Save images to s3 folder                          |               |
|                                 |         | - `test`: Save images nowhere (for testing purposes)            |               |
| `uploadLocation` (req for Duda) | String  | Duda website ID for uploading images                            | None          |
| `saveImages`                    | Boolean | Save scraped images.                                            | `true`        |
| `scrapeImages`                  | Boolean | Scrape images at all.                                           | `true`        |
| `backupImagesSave`              | Boolean | Backup save the images to S3.                                   | `true`        |
| `analyzeHomepageData`           | Boolean | Analyze the homepage with AI and save siteData file.            | `true`        |

---

Note: Images and data are backed up to S3 by default if saving to another additional location or no saveMethod found

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
    "uploadLocation": "dudasiteid",
    "saveMethod": "dudaUpload",
    "saveImages": true
}
```

Return object structure

```json
{
    "imageUploadTotal": "number of images uploaded",
    "failedImageCount": "number of failed image uploads",
    "uploadedResources": "array of uploaded resources statusses and info",
    "s3UploadedImages": "array of s3 links for uploaded images",
    "failedImages": "array of failed image upload URLs",
    "s3LogoUrl": "link for the logo uploaded to s3 if found",
    "scrapedPages": "array of site pages scraped",
    "url": "scraped url",
    "siteData": "object of data scraped from site (see code for object details)"
}
```

### Scraped data cleanup

-   **DELETE**: `/api/cms-routes/scrape-site`

This route can be used to remove the scraped folder created in S3 from a site.
Simply pass the URL that you initially scraped in a DELETE request to the route. Currently there is no way to automatically clean up images saved in Duda.

Return object structure

```json
{
    "status": "success or fail based off the process outcome",
    "message": "status on the s3 folder for site",
    "url": "url the request sent that was initially scraped"
}
```
