
import express, {Request, Response, Router, Express} from 'express';
import router from './route';
import path from 'path';
import DBConnect from "./dbConfigs";
import { RequestHandler } from 'express-serve-static-core';

// call express
const app: Express = express(); // define our app using express

// configure app to use bodyParser for
// Getting data from body of requests
app.use(express.urlencoded({extended: true}) as RequestHandler);

app.use(express.json() as RequestHandler) 


const port: number = Number(process.env.PORT) || 8050; // set our port

// connect to database. right now it's just working with mongodb
// but in near future it will be configured for other databases as well
// DBConnect.dbConnection();

// Send index.html on root request
app.use(express.static(__dirname + '/../dist'));

// REGISTER ROUTES
// all of the routes will be prefixed with /api
const routes: Router[] = Object.values(router);
app.use('/api', routes);

// using react-router so need to catch all other URLs and render the root HTML
app.get('*', (req:Request, res:Response) => {
    console.log('sending index.html');
    res.sendFile(path.resolve(__dirname,'..', 'dist', 'index.html'))
});



// START THE SERVER
// =============================================================================
app.listen(port);
console.log(`App listening on ${port}`);
