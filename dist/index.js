import { config } from 'dotenv';
config();
import express from 'express';
import router from './api/cms-routes.js';
import path from 'path';
import { marked } from 'marked';
import * as fs from 'fs';
import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from './openapi.js';
const app = express();
const routes = router;
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    // authorized headers for preflight requests
    // https://developer.mozilla.org/en-US/docs/Glossary/preflight_request
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
    app.options('*', (req, res) => {
        // allowed XHR methods
        res.header('Access-Control-Allow-Methods', 'GET, PATCH, PUT, POST, DELETE, OPTIONS');
        res.send();
    });
});
app.use(express.json({ limit: '80mb' }));
app.use(express.urlencoded({ limit: '80mb', extended: true, parameterLimit: 5000000 }));
app.use('/api/cms-routes', routes);
// Serve Swagger UI
const swaggerCssFile = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui.min.css';
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
    customCss: '.swagger-ui .topbar .download-url-wrapper {display:flex;}', //show search bar
    customCssUrl: swaggerCssFile,
}));
//serve spec json file
app.get('/openapi.json', (req, res) => {
    res.json(openApiSpec);
});
const PORT = 8080;
app.get('/', (req, res) => {
    const readmePath = path.join(process.cwd(), 'public', 'README.md');
    // Read README file
    fs.readFile(readmePath, 'utf-8', (err, data) => {
        if (err) {
            res.status(500).send('Error loading README');
            console.log('readme error', err);
            return;
        }
        // Convert Markdown to HTML
        const readmeHTML = marked(data);
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>API Documentation</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: auto; padding: 20px; background:#1e1e1e; color:#B1B1B1; font-size:18px; line-height:1.5; overflow-wrap: break-word; }
                    @media(min-width:700px){
                        body{ font-size:22px;}
                    }
                    h1, h2, h3 { color: #B1B1B1; font-size:20px; }
                    a{color:#fff;}
                    pre { background-color: #1e1e1e; padding: 10px; overflow: auto; }
                    code { background-color: #1e1e1e; padding: 2px 4px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
                    th { background-color: #1e1e1e; }
                    
                </style>
            </head>
            <body>
                <h1>API Documentation</h1>
                ${readmeHTML}
            </body>
            </html>
        `);
    });
});
app.listen(PORT, () => console.log(`Server running in port ${PORT}`));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sUUFBUSxDQUFBO0FBQy9CLE1BQU0sRUFBRSxDQUFBO0FBQ1IsT0FBTyxPQUFPLE1BQU0sU0FBUyxDQUFBO0FBQzdCLE9BQU8sTUFBTSxNQUFNLHFCQUFxQixDQUFBO0FBQ3hDLE9BQU8sSUFBSSxNQUFNLE1BQU0sQ0FBQTtBQUN2QixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sUUFBUSxDQUFBO0FBQy9CLE9BQU8sS0FBSyxFQUFFLE1BQU0sSUFBSSxDQUFBO0FBQ3hCLE9BQU8sU0FBUyxNQUFNLG9CQUFvQixDQUFBO0FBQzFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxjQUFjLENBQUE7QUFFMUMsTUFBTSxHQUFHLEdBQUcsT0FBTyxFQUFFLENBQUE7QUFDckIsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFBO0FBRXJCLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFO0lBQ3ZCLEdBQUcsQ0FBQyxNQUFNLENBQUMsNkJBQTZCLEVBQUUsR0FBRyxDQUFDLENBQUE7SUFFOUMsNENBQTRDO0lBQzVDLHNFQUFzRTtJQUN0RSxHQUFHLENBQUMsTUFBTSxDQUFDLDhCQUE4QixFQUFFLGdEQUFnRCxDQUFDLENBQUE7SUFDNUYsSUFBSSxFQUFFLENBQUE7SUFFTixHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUMxQixzQkFBc0I7UUFDdEIsR0FBRyxDQUFDLE1BQU0sQ0FBQyw4QkFBOEIsRUFBRSx3Q0FBd0MsQ0FBQyxDQUFBO1FBQ3BGLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtJQUNkLENBQUMsQ0FBQyxDQUFBO0FBQ04sQ0FBQyxDQUFDLENBQUE7QUFFRixHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ3hDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ3ZGLEdBQUcsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsTUFBTSxDQUFDLENBQUE7QUFFbEMsbUJBQW1CO0FBQ25CLE1BQU0sY0FBYyxHQUFHLDZFQUE2RSxDQUFBO0FBQ3BHLEdBQUcsQ0FBQyxHQUFHLENBQ0gsV0FBVyxFQUNYLFNBQVMsQ0FBQyxLQUFLLEVBQ2YsU0FBUyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUU7SUFDekIsU0FBUyxFQUFFLDJEQUEyRCxFQUFFLGlCQUFpQjtJQUN6RixZQUFZLEVBQUUsY0FBYztDQUMvQixDQUFDLENBQ0wsQ0FBQTtBQUNELHNCQUFzQjtBQUN0QixHQUFHLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtJQUNsQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ3pCLENBQUMsQ0FBQyxDQUFBO0FBRUYsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFBO0FBRWpCLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQ3RCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQTtJQUNsRSxtQkFBbUI7SUFDbkIsRUFBRSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFO1FBQzNDLElBQUksR0FBRyxFQUFFLENBQUM7WUFDTixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO1lBQzVDLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1lBQ2hDLE9BQU07UUFDVixDQUFDO1FBRUQsMkJBQTJCO1FBQzNCLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUMvQixHQUFHLENBQUMsSUFBSSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7a0JBd0JDLFVBQVU7OztTQUduQixDQUFDLENBQUE7SUFDTixDQUFDLENBQUMsQ0FBQTtBQUNOLENBQUMsQ0FBQyxDQUFBO0FBRUYsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFBIn0=