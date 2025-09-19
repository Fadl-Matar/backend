import { Router } from 'express';
import {db} from "../db/db"
const router = Router();


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  
  const { testUsers } = await db.query({
    testUsers: {
      $: { where: { email, password } },
    },
  });

  const user = testUsers[0];

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const { testUserSettings } = await db.query({
    testUserSettings: {
      $: { where: { user: user.id } }, 
    },
  });

  const settings = testUserSettings[0];
  const defaultTeacherId = settings?.defaultTeacher ?? null;

  
  const token = await db.auth.createToken(email);

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      password: user.password,
      defaultTeacherId, 
    },
  });
});

router.post('/getUser', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  
  const { testUsers } = await db.query({
    testUsers: {
      $: { where: { email, password } },
    },
  });

  const user = testUsers[0];


  return res.json({    
    user
  });
});

router.post('/getSettings', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const { testUsers } = await db.query({
    testUsers: {
      $: { where: { email, password } },
    },
  });

  const user = testUsers[0];

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const { testUserSettings } = await db.query({
    testUserSettings: {
      $: { where: { user: user.id } }, 
    },
  });

  const settings = testUserSettings[0];

  return res.json({    
    settings
  });
});

router.post('/update-password', async (req,res) => {
  try{
    const { currPassword, newPassword } = req.body;

    const authHeader = req.headers.authorization;
    if(!authHeader){
      return res.status(401).json({ error: "Missing authorization header" });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }

    const authUser = await db.auth.verifyToken(token);
    if (!authUser) {
      return res.status(401).json({ error: "Not authorized" });
    }

    const { testUsers } = await db.query({
      testUsers: { $: { where: { auth_id: authUser.id } } },
    });

    const userRow = testUsers[0];
    if (!userRow) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userRow.password !== currPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // @ts-ignore
    await db.transact([db.tx.testUsers[userRow!.id].update({ password: newPassword })]);
    
    return res.status(200).json({message:"password updated."});

  } catch(err) {
    console.error('update password error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
})

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Missing authorization header" });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }

    const authUser = await db.auth.verifyToken(token);
    if (!authUser) {
      return res.status(401).json({ error: "Not authorized" });
    }

    const { testUsers, testUserSettings } = await db.query({
      testUsers: { $: { where: { auth_id: authUser.id } } },
      testUserSettings: { $: { where: { auth_id: authUser.id } } },
    });

    const userRow = testUsers[0];
    const settingsRow = testUserSettings[0];

    if (!userRow) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      success: true,
      user: {
        id: userRow.id,
        email: userRow.email,
        password: userRow.password ?? null,
        created_at: userRow.created_at ?? null,
        defaultTeacherId: settingsRow?.defaultTeacher ?? null,
      }
    });
  } catch (err) {
    console.error('get user error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;