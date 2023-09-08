import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import apiRoutes from './routers/api';

dotenv.config();

const server = express();

server.use(cors({
	origin: '*',
}));

server.use(express.static(path.join(__dirname, '../public')));
server.use(express.urlencoded({ extended: true }));

server.use('/api', apiRoutes)

server.listen(process.env.PORT);