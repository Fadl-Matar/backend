import { Router } from 'express';
import {db} from "../db/db"
const router = Router();



router.post('/update-default-teacher', async (req, res) => {
  try {
    const authHearder = req.headers.authorization;
    if(!authHearder){
        return res.status(401).json({error: "Missing authorization header"});
    }
    const token = authHearder.split(' ')[1];
    if(!token){
        return res.status(401).json({error: "Missing token"});
    }
    const user = await db.auth.verifyToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { newDefaultTeacher } = req.body;
    if (!newDefaultTeacher) {
      return res.status(400).json({ error: 'defaultTeacher is required' });
    }

    console.log('Verified user id:', user.id);

    const { testUserSettings } = await db.query({
      testUserSettings: { $: { where: { auth_id: user.id } } }
    });

    if (!testUserSettings.length) {
      return res.status(404).json({ error: 'Settings not found' });
    }
        
    const settingsRow = testUserSettings[0]!;
    if (!settingsRow) {
        return res.status(404).json({ error: 'Settings row empty' });
    }
    
    // @ts-ignore
    const result = await db.transact([db.tx.testUserSettings[settingsRow!.id].update({ defaultTeacher: newDefaultTeacher })]);

    return res.status(200).send("teacher updated.");
  } catch (err) {
    console.error('update-default-teacher error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;