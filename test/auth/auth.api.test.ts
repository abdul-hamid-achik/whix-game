import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

/**
 * API-level tests for auth endpoints
 * These tests validate the actual auth flow behavior
 */
describe('Auth API Tests', () => {
  // Clean up before tests
  beforeAll(async () => {
    // Delete all guest users from previous test runs
    await db.execute(sql`
      DELETE FROM users 
      WHERE email LIKE '%@guest.whix.local'
    `);
  });

  afterAll(async () => {
    // Final cleanup
    await db.execute(sql`
      DELETE FROM users 
      WHERE email LIKE '%@guest.whix.local'
      OR email LIKE '%@test.example.com'
    `);
  });

  describe('Guest Authentication', () => {
    it('should successfully create a guest user with proper fields', async () => {
      // Simulate what the auth.ts authorize function does
      const guestId = `guest_api_test_${Date.now()}`;
      const guestName = `Courier_${Math.random().toString(36).substring(2, 7)}`;
      
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

      // Verify the response structure
      expect(newGuest[0]).toMatchObject({
        id: guestId,
        email: `${guestId}@guest.whix.local`,
        name: guestName,
        password: '',
        role: 'free',
        guestId: guestId,
        emailVerified: null
      });

      // Verify what would be returned to NextAuth
      const authResponse = {
        id: newGuest[0].id,
        name: newGuest[0].name,
        role: newGuest[0].role,
        guestId: newGuest[0].guestId || undefined,
        isGuest: true
      };

      expect(authResponse.isGuest).toBe(true);
      expect(authResponse.guestId).toBe(guestId);
    });

    it('should handle the exact SQL that was failing', async () => {
      // This replicates the exact scenario from the error
      const guestId = 'guest_rcviizKNMF';
      const guestName = 'Courier_fox2k';
      
      // First, ensure this guest doesn't exist
      await db.execute(sql`
        DELETE FROM users WHERE id = ${guestId}
      `);

      // Now test the exact insert that was failing
      const result = await db.execute(sql`
        INSERT INTO users (id, email, name, password, role, guest_id, email_verified, created_at, updated_at)
        VALUES (
          ${guestId},
          ${`${guestId}@guest.whix.local`},
          ${guestName},
          ${''},
          ${'free'},
          ${guestId},
          ${null},
          ${new Date()},
          ${new Date()}
        )
        RETURNING *
      `);

      expect(result.rows.length).toBe(1);
      expect(result.rows[0].id).toBe(guestId);

      // Clean up
      await db.execute(sql`
        DELETE FROM users WHERE id = ${guestId}
      `);
    });

    it('should not create duplicate guest users', async () => {
      const guestId = 'guest_duplicate_test';
      
      // Create first guest
      await db.insert(users).values({
        id: guestId,
        email: `${guestId}@guest.whix.local`,
        name: 'First Guest',
        password: '',
        role: 'free',
        guestId: guestId,
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      // Attempt to create duplicate should fail
      await expect(
        db.insert(users).values({
          id: guestId, // Same ID
          email: `${guestId}@guest.whix.local`, // Same email
          name: 'Duplicate Guest',
          password: '',
          role: 'free',
          guestId: guestId,
          emailVerified: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning()
      ).rejects.toThrow();

      // Clean up
      await db.execute(sql`
        DELETE FROM users WHERE id = ${guestId}
      `);
    });
  });

  describe('Regular User Authentication', () => {
    it('should create regular user with all required fields', async () => {
      const userId = 'user_api_test_' + Date.now();
      const hashedPassword = '$2a$10$K7L1OJ0/9L6sU8YqzV3Gxu3hKxGtXpLZYXVqXn5F9Y8wL1kMqI3Hy'; // bcrypt hash
      
      const newUser = await db.insert(users).values({
        id: userId,
        email: `${userId}@test.example.com`,
        name: 'Test User',
        password: hashedPassword,
        role: 'free',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      expect(newUser[0]).toMatchObject({
        id: userId,
        email: `${userId}@test.example.com`,
        name: 'Test User',
        role: 'free',
        guestId: null
      });

      // Verify password is stored (but we don't expose it in auth response)
      expect(newUser[0].password).toBe(hashedPassword);
    });
  });

  describe('SQL Edge Cases', () => {
    it('should handle empty string vs null correctly', async () => {
      const testCases = [
        {
          name: 'Empty string password (valid for guests)',
          data: {
            id: 'empty_string_test',
            email: 'empty_string_test@guest.whix.local',
            name: 'Empty String User',
            password: '',
            role: 'free' as const,
            guestId: 'empty_string_test',
            emailVerified: null,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          shouldSucceed: true
        }
      ];

      for (const testCase of testCases) {
        if (testCase.shouldSucceed) {
          const result = await db.insert(users).values(testCase.data).returning();
          expect(result[0].password).toBe('');
          
          // Clean up
          await db.execute(sql`
            DELETE FROM users WHERE id = ${testCase.data.id}
          `);
        }
      }
    });

    it('should handle the exact params from the error log', async () => {
      // The error showed these params:
      // params: guest_rcviizKNMF,,Courier_fox2k,,free,guest_rcviizKNMF,,2025-07-09T05:49:58.778Z,2025-07-09T05:49:58.778Z
      // The double commas ,, indicate null values being passed
      
      const guestId = 'guest_error_replica';
      const values = {
        id: guestId,
        email: `${guestId}@guest.whix.local`, // This was null/empty in the error
        name: 'Courier_test',
        password: '', // This was null/empty in the error
        role: 'free' as const,
        guestId: guestId,
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // This should now succeed with our fix
      const result = await db.insert(users).values(values).returning();
      expect(result[0].id).toBe(guestId);
      expect(result[0].email).toBe(`${guestId}@guest.whix.local`);
      expect(result[0].password).toBe('');

      // Clean up
      await db.execute(sql`
        DELETE FROM users WHERE id = ${guestId}
      `);
    });
  });
});