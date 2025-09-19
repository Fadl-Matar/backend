import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import teacherRoutes from './routes/teacherRoutes';


dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(userRoutes);
app.use(teacherRoutes);
//app.use(chatRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
