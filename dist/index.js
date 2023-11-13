import { config } from 'dotenv';
config();
import express from 'express';
import router from './api/cms-routes.js';
//import triviarouter from './api/trivia-routes.js'
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
//app.use('/api/cms-routes', routes)
app.use('/api/cms-routes', routes);
//const PORT = process.env.PORT || 8080
const PORT = 8080;
app.get('/', (req, res) => {
    res.send(`API Running ${PORT}`);
});
app.listen(PORT, () => console.log(`Server running in port ${PORT}`));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sUUFBUSxDQUFBO0FBQy9CLE1BQU0sRUFBRSxDQUFBO0FBQ1IsT0FBTyxPQUFPLE1BQU0sU0FBUyxDQUFBO0FBQzdCLE9BQU8sTUFBTSxNQUFNLHFCQUFxQixDQUFBO0FBQ3hDLG1EQUFtRDtBQUNuRCxNQUFNLEdBQUcsR0FBRyxPQUFPLEVBQUUsQ0FBQTtBQUVyQixJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUE7QUFDbkI7Ozs7OztJQU1JO0FBRUosR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUU7SUFDdkIsR0FBRyxDQUFDLE1BQU0sQ0FBQyw2QkFBNkIsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUU5Qyw0Q0FBNEM7SUFDNUMsc0VBQXNFO0lBQ3RFLEdBQUcsQ0FBQyxNQUFNLENBQUMsOEJBQThCLEVBQUUsZ0RBQWdELENBQUMsQ0FBQTtJQUM1RixJQUFJLEVBQUUsQ0FBQTtJQUVOLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQzFCLHNCQUFzQjtRQUN0QixHQUFHLENBQUMsTUFBTSxDQUFDLDhCQUE4QixFQUFFLHdDQUF3QyxDQUFDLENBQUE7UUFDcEYsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFBO0lBQ2QsQ0FBQyxDQUFDLENBQUE7QUFDTixDQUFDLENBQUMsQ0FBQTtBQUVGLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFDeEMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFFdkYsb0NBQW9DO0FBQ3BDLEdBQUcsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsTUFBTSxDQUFDLENBQUE7QUFFbEMsdUNBQXVDO0FBQ3ZDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQTtBQUVqQixHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtJQUN0QixHQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsSUFBSSxFQUFFLENBQUMsQ0FBQTtBQUNuQyxDQUFDLENBQUMsQ0FBQTtBQUVGLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQSJ9