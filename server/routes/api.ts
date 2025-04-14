import { Router } from 'express';
import { db } from '../db';
import { moods, posts, reactions, comments, affiliates } from '../schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Mood routes
router.get('/moods', async (req, res) => {
  try {
    const allMoods = await db.select().from(moods);
    res.json(allMoods);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch moods' });
  }
});

// Post routes
router.post('/posts', async (req, res) => {
  const { userId, moodId, content } = req.body;
  try {
    const newPost = await db.insert(posts).values({
      id: uuidv4(),
      userId,
      moodId,
      content,
    }).returning();
    res.json(newPost[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

router.get('/posts/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const userPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(posts.createdAt);
    res.json(userPosts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Reaction routes
router.post('/reactions', async (req, res) => {
  const { postId, userId, emoji } = req.body;
  try {
    const existingReaction = await db
      .select()
      .from(reactions)
      .where(
        and(
          eq(reactions.postId, postId),
          eq(reactions.userId, userId),
          eq(reactions.emoji, emoji)
        )
      );

    if (existingReaction.length > 0) {
      await db
        .delete(reactions)
        .where(
          and(
            eq(reactions.postId, postId),
            eq(reactions.userId, userId),
            eq(reactions.emoji, emoji)
          )
        );
      res.json({ action: 'removed' });
    } else {
      const newReaction = await db
        .insert(reactions)
        .values({
          id: uuidv4(),
          postId,
          userId,
          emoji,
        })
        .returning();
      res.json({ action: 'added', reaction: newReaction[0] });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to handle reaction' });
  }
});

// Comment routes
router.post('/comments', async (req, res) => {
  const { postId, userId, content } = req.body;
  try {
    const newComment = await db
      .insert(comments)
      .values({
        id: uuidv4(),
        postId,
        userId,
        content,
      })
      .returning();
    res.json(newComment[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

router.get('/comments/:postId', async (req, res) => {
  const { postId } = req.params;
  try {
    const postComments = await db
      .select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(comments.createdAt);
    res.json(postComments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Affiliate routes
router.get('/affiliates/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const affiliate = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.userId, userId));
    res.json(affiliate[0] || null);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch affiliate data' });
  }
});

router.post('/affiliates', async (req, res) => {
  const { userId } = req.body;
  try {
    const inviteLink = `dormlit.com/invite/${uuidv4()}`;
    const newAffiliate = await db
      .insert(affiliates)
      .values({
        id: uuidv4(),
        userId,
        inviteLink,
      })
      .returning();
    res.json(newAffiliate[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create affiliate' });
  }
});

export default router; 