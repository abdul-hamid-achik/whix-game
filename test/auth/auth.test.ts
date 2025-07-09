import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

// Mock the auth module
vi.mock('next-auth', () => ({
  default: vi.fn(),
}));

// Mock nanoid to have predictable IDs in tests
vi.mock('nanoid', () => ({
  nanoid: vi.fn(),
}));

// Import after mocks
import { handlers } from '@/auth';

describe('Auth System', () => {
  let testUserId: string;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    // Mock nanoid to return predictable values
    (nanoid as any).mockImplementation((length?: number) => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let result = 'test_';
      for (let i = 0; i < (length || 10); i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
      return result;
    });
  });

  afterEach(async () => {
    // Clean up test users
    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId));
    }
    // Clean up any guest users created during tests
    await db.delete(users).where(eq(users.role, 'free'));
  });

  describe('Guest User Creation', () => {
    it('should create a guest user with valid fields', async () => {
      const guestId = `guest_${nanoid(10)}`;
      const guestName = `Courier_test`;
      
      const newGuest = await db.insert(users).values({
        id: guestId,
        email: `${guestId}@guest.whix.local`,
        name: guestName,
        password: '',
        role: 'free',
        guestId: guestId,
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      testUserId = newGuest[0].id;

      expect(newGuest[0]).toBeDefined();
      expect(newGuest[0].id).toBe(guestId);
      expect(newGuest[0].email).toBe(`${guestId}@guest.whix.local`);
      expect(newGuest[0].name).toBe(guestName);
      expect(newGuest[0].password).toBe('');
      expect(newGuest[0].role).toBe('free');
      expect(newGuest[0].guestId).toBe(guestId);
    });

    it('should handle unique email constraint for multiple guest users', async () => {
      const guestId1 = `guest_${nanoid(10)}`;
      const guestId2 = `guest_${nanoid(10)}`;
      
      const guest1 = await db.insert(users).values({
        id: guestId1,
        email: `${guestId1}@guest.whix.local`,
        name: 'Courier_1',
        password: '',
        role: 'free',
        guestId: guestId1,
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      const guest2 = await db.insert(users).values({
        id: guestId2,
        email: `${guestId2}@guest.whix.local`,
        name: 'Courier_2',
        password: '',
        role: 'free',
        guestId: guestId2,
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      expect(guest1[0].email).not.toBe(guest2[0].email);
      expect(guest1[0].id).not.toBe(guest2[0].id);

      // Clean up
      await db.delete(users).where(eq(users.id, guestId1));
      await db.delete(users).where(eq(users.id, guestId2));
    });

    it('should not allow guest users to sign in with credentials', async () => {
      const guestId = `guest_${nanoid(10)}`;
      
      await db.insert(users).values({
        id: guestId,
        email: `${guestId}@guest.whix.local`,
        name: 'Courier_test',
        password: '',
        role: 'free',
        guestId: guestId,
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      // Try to find user by email
      const foundUser = await db.select().from(users)
        .where(eq(users.email, `${guestId}@guest.whix.local`))
        .limit(1);

      expect(foundUser.length).toBe(1);
      expect(foundUser[0].password).toBe('');
      
      // Password verification should fail for empty password
      const isValidPassword = await bcrypt.compare('anypassword', '');
      expect(isValidPassword).toBe(false);

      // Clean up
      await db.delete(users).where(eq(users.id, guestId));
    });

    it('should handle database constraints properly', async () => {
      const testData = {
        validGuest: {
          id: `guest_${nanoid(10)}`,
          email: `guest_${nanoid(10)}@guest.whix.local`,
          name: 'Valid Guest',
          password: '',
          role: 'free' as const,
          guestId: `guest_${nanoid(10)}`,
          emailVerified: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        invalidGuest: {
          id: `guest_${nanoid(10)}`,
          email: null as any, // This should fail
          name: 'Invalid Guest',
          password: null as any,
          role: 'free' as const,
          guestId: `guest_${nanoid(10)}`,
          emailVerified: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      // Valid guest should succeed
      const validResult = await db.insert(users).values(testData.validGuest).returning();
      expect(validResult[0]).toBeDefined();
      
      // Invalid guest should fail
      await expect(
        db.insert(users).values(testData.invalidGuest).returning()
      ).rejects.toThrow();

      // Clean up
      await db.delete(users).where(eq(users.id, testData.validGuest.id));
    });
  });

  describe('Regular User Registration', () => {
    it('should create a regular user with email and password', async () => {
      const userData = {
        id: nanoid(),
        email: 'test@example.com',
        name: 'Test User',
        password: await bcrypt.hash('password123', 10),
        role: 'free' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const newUser = await db.insert(users).values(userData).returning();
      testUserId = newUser[0].id;

      expect(newUser[0]).toBeDefined();
      expect(newUser[0].email).toBe(userData.email);
      expect(newUser[0].name).toBe(userData.name);
      expect(newUser[0].guestId).toBeNull();
      
      // Verify password was hashed
      const isValidPassword = await bcrypt.compare('password123', newUser[0].password || '');
      expect(isValidPassword).toBe(true);
    });

    it('should not allow duplicate email addresses', async () => {
      const email = 'duplicate@example.com';
      
      const user1 = await db.insert(users).values({
        id: nanoid(),
        email,
        name: 'User 1',
        password: await bcrypt.hash('password1', 10),
        role: 'free',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      testUserId = user1[0].id;

      await expect(
        db.insert(users).values({
          id: nanoid(),
          email, // Same email
          name: 'User 2',
          password: await bcrypt.hash('password2', 10),
          role: 'free',
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning()
      ).rejects.toThrow();
    });
  });

  describe('User Sign In', () => {
    it('should successfully sign in with correct credentials', async () => {
      const password = 'correctpassword';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await db.insert(users).values({
        id: nanoid(),
        email: 'signin@example.com',
        name: 'Sign In User',
        password: hashedPassword,
        role: 'free',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      testUserId = user[0].id;

      // Find user by email
      const foundUser = await db.select().from(users)
        .where(eq(users.email, 'signin@example.com'))
        .limit(1);

      expect(foundUser.length).toBe(1);
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, foundUser[0].password || '');
      expect(isValidPassword).toBe(true);
    });

    it('should fail sign in with incorrect password', async () => {
      const user = await db.insert(users).values({
        id: nanoid(),
        email: 'wrongpass@example.com',
        name: 'Wrong Pass User',
        password: await bcrypt.hash('correctpassword', 10),
        role: 'free',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      testUserId = user[0].id;

      const foundUser = await db.select().from(users)
        .where(eq(users.email, 'wrongpass@example.com'))
        .limit(1);

      const isValidPassword = await bcrypt.compare('wrongpassword', foundUser[0].password || '');
      expect(isValidPassword).toBe(false);
    });

    it('should fail sign in with non-existent email', async () => {
      const foundUser = await db.select().from(users)
        .where(eq(users.email, 'nonexistent@example.com'))
        .limit(1);

      expect(foundUser.length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long guest IDs', async () => {
      const longId = `guest_${'a'.repeat(100)}`;
      const email = `${longId.substring(0, 50)}@guest.whix.local`; // Limit email length
      
      const guest = await db.insert(users).values({
        id: longId,
        email,
        name: 'Long ID Guest',
        password: '',
        role: 'free',
        guestId: longId,
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      expect(guest[0].id).toBe(longId);
      expect(guest[0].guestId).toBe(longId);

      await db.delete(users).where(eq(users.id, longId));
    });

    it('should handle special characters in user names', async () => {
      const specialName = "Courier_!@#$%^&*()";
      const guestId = `guest_${nanoid(10)}`;
      
      const guest = await db.insert(users).values({
        id: guestId,
        email: `${guestId}@guest.whix.local`,
        name: specialName,
        password: '',
        role: 'free',
        guestId: guestId,
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      expect(guest[0].name).toBe(specialName);

      await db.delete(users).where(eq(users.id, guestId));
    });

    it('should handle concurrent guest user creation', async () => {
      const promises = Array.from({ length: 5 }, async (_, i) => {
        const guestId = `guest_concurrent_${i}_${nanoid(10)}`;
        return db.insert(users).values({
          id: guestId,
          email: `${guestId}@guest.whix.local`,
          name: `Courier_${i}`,
          password: '',
          role: 'free',
          guestId: guestId,
          emailVerified: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();
      });

      const results = await Promise.all(promises);
      
      expect(results.length).toBe(5);
      const emails = results.map(r => r[0].email);
      const uniqueEmails = new Set(emails);
      expect(uniqueEmails.size).toBe(5);

      // Clean up
      for (const result of results) {
        await db.delete(users).where(eq(users.id, result[0].id));
      }
    });
  });
});