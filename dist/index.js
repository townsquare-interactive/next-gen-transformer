import { config } from 'dotenv';
config();
import express from 'express';
import router from './api/cms-routes.js';
const app = express();
let routes = router;
/* if (process.env.DB == 'dynamo') {
    routes = require('./api/dynamo-routes')
} else if (process.env.DB == 'mongo') {
    routes = require('./api/mongo-routes')
} else if (process.env.DB == 'cms') {
    routes = require('./api/cms-routes')
} */
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
const PORT = process.env.PORT || 8080;
app.get('/', (req, res) => {
    res.send(`API Running ${process.env.PORT}`);
});
app.listen(PORT, () => console.log(`Server running in port ${PORT}`));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sUUFBUSxDQUFBO0FBQy9CLE1BQU0sRUFBRSxDQUFBO0FBQ1IsT0FBTyxPQUFPLE1BQU0sU0FBUyxDQUFBO0FBQzdCLE9BQU8sTUFBTSxNQUFNLHFCQUFxQixDQUFBO0FBQ3hDLE1BQU0sR0FBRyxHQUFHLE9BQU8sRUFBRSxDQUFBO0FBRXJCLElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQTtBQUNuQjs7Ozs7O0lBTUk7QUFFSixHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRTtJQUN2QixHQUFHLENBQUMsTUFBTSxDQUFDLDZCQUE2QixFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBRTlDLDRDQUE0QztJQUM1QyxzRUFBc0U7SUFDdEUsR0FBRyxDQUFDLE1BQU0sQ0FBQyw4QkFBOEIsRUFBRSxnREFBZ0QsQ0FBQyxDQUFBO0lBQzVGLElBQUksRUFBRSxDQUFBO0lBRU4sR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFDMUIsc0JBQXNCO1FBQ3RCLEdBQUcsQ0FBQyxNQUFNLENBQUMsOEJBQThCLEVBQUUsd0NBQXdDLENBQUMsQ0FBQTtRQUNwRixHQUFHLENBQUMsSUFBSSxFQUFFLENBQUE7SUFDZCxDQUFDLENBQUMsQ0FBQTtBQUNOLENBQUMsQ0FBQyxDQUFBO0FBRUYsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUN4QyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUV2RixHQUFHLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLE1BQU0sQ0FBQyxDQUFBO0FBRWxDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQTtBQUVyQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtJQUN0QixHQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO0FBQy9DLENBQUMsQ0FBQyxDQUFBO0FBRUYsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFBIn0=