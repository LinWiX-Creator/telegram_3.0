import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

import { authMiddleware } from './middleware/auth.js';
import { createUser, getUserByInternalId, getUserByPublicId, loginUser } from './services/userService.js';
import { getDialogs, getMessages, sendMessage } from './services/chatService.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST']
  }
});

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

function issueToken(user) {
  return jwt.sign(
    {
      id: user.id,
      user_id: user.user_id,
      username: user.username
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email, password required' });
    }

    const user = await createUser({ username, email, password });
    const token = issueToken(user);

    return res.status(201).json({ token, user });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password required' });
    }

    const user = await loginUser({ email, password });
    const token = issueToken(user);

    return res.json({ token, user });
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
});

app.get('/users/me', authMiddleware, async (req, res) => {
  try {
    const user = await getUserByInternalId(req.user.id);
    return res.json(user);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

app.get('/users/by-id/:userId', authMiddleware, async (req, res) => {
  const found = await getUserByPublicId(req.params.userId);
  if (!found) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({
    user_id: found.user_id,
    username: found.username
  });
});

app.get('/dialogs', authMiddleware, async (req, res) => {
  try {
    const dialogs = await getDialogs(req.user.user_id);
    return res.json(dialogs);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.get('/messages/:partnerId', authMiddleware, async (req, res) => {
  try {
    const messages = await getMessages(req.user.user_id, req.params.partnerId);
    return res.json(messages);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/messages', authMiddleware, async (req, res) => {
  try {
    const { toUserId, text } = req.body;

    if (!toUserId || !text) {
      return res.status(400).json({ error: 'toUserId and text required' });
    }

    const receiver = await getUserByPublicId(toUserId);
    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    const message = await sendMessage({
      fromUserId: req.user.user_id,
      toUserId,
      text
    });

    io.to(toUserId).emit('new_message', message);
    io.to(req.user.user_id).emit('new_message', message);

    return res.status(201).json(message);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = payload;
    return next();
  } catch {
    return next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  socket.join(socket.user.user_id);

  socket.on('send_message', async (payload, callback) => {
    try {
      const { toUserId, text } = payload;
      const receiver = await getUserByPublicId(toUserId);

      if (!receiver) {
        callback({ ok: false, error: 'Receiver not found' });
        return;
      }

      const message = await sendMessage({
        fromUserId: socket.user.user_id,
        toUserId,
        text
      });

      io.to(toUserId).emit('new_message', message);
      io.to(socket.user.user_id).emit('new_message', message);

      callback({ ok: true, data: message });
    } catch (error) {
      callback({ ok: false, error: error.message });
    }
  });
});

const port = process.env.PORT || 4000;
httpServer.listen(port, () => {
  console.log(`Backend started on http://localhost:${port}`);
});
