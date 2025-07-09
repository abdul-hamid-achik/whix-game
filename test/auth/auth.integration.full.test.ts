import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { db } from '@/lib/db/local'; // Use local database connection for tests
import { users, players } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

/**
 * Comprehensive integration tests for auth system
 * Tests against real database to catch schema mismatches
 */
describe('Auth System - Full Integration Tests', () => {
  let testUserIds: string[] = [];

  beforeAll(async () => {
    // Ensure we have a clean test environment
    console.log('Setting up test environment...');
    
    // Check database connection
    try {
      await db.execute(sql`SELECT 1`);
      console.log('Database connection successful');
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }

    // Check if users table exists with correct schema
    try {
      const tableInfo = await db.execute(sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position;
      `);
      console.log('Users table schema:', tableInfo.rows);
    } catch (error) {
      console.error('Failed to get users table info:', error);
      throw error;
    }
  });

  afterAll(async () => {
    // Clean up all test users
    console.log('Cleaning up test users...');
    for (const userId of testUserIds) {
      try {
        // Delete related records first
        await db.delete(players).where(eq(players.userId, userId));
        await db.delete(users).where(eq(users.id, userId));
      } catch (error) {
        console.error(`Failed to clean up user ${userId}:`, error);
      }
    }
  });

  beforeEach(() => {
    // Clear test user tracking for each test
    testUserIds = [];
  });

  describe('Database Schema Validation', () => {
    it('should have users table with correct columns', async () => {
      const result = await db.execute(sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position;
      `);

      const columns = result.rows.map(row => ({
        name: row.column_name,
        type: row.data_type
      }));

      // Verify all required columns exist
      const requiredColumns = [
        { name: 'id', type: 'text' },
        { name: 'email', type: 'text' },
        { name: 'name', type: 'text' },
        { name: 'password', type: 'text' },
        { name: 'role', type: 'USER-DEFINED' }, // enum type
        { name: 'guest_id', type: 'text' },
        { name: 'email_verified', type: 'timestamp without time zone' },
        { name: 'created_at', type: 'timestamp without time zone' },
        { name: 'updated_at', type: 'timestamp without time zone' }
      ];

      for (const required of requiredColumns) {
        const found = columns.find(col => col.name === required.name);
        expect(found, `Column ${required.name} should exist`).toBeDefined();
        if (found && required.type !== 'USER-DEFINED') {
          expect(found.type).toBe(required.type);
        }
      }
    });

    it('should have correct user_role enum values', async () => {
      const result = await db.execute(sql`
        SELECT enumlabel 
        FROM pg_enum 
        JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
        WHERE pg_type.typname = 'user_role'
        ORDER BY enumsortorder;
      `);

      const roles = result.rows.map(row => row.enumlabel);
      expect(roles).toContain('free');
      expect(roles).toContain('paid');
      expect(roles).toContain('admin');
    });
  });

  describe('Guest User Creation - Real Database', () => {
    it('should create guest user with exact auth.ts logic', async () => {
      // Replicate exact auth.ts logic
      const guestId = `guest_${nanoid(10)}`;
      const guestName = `Courier_${Math.random().toString(36).substring(2, 7)}`;
      
      try {
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

        testUserIds.push(newGuest[0].id);

        expect(newGuest[0]).toBeDefined();
        expect(newGuest[0].id).toBe(guestId);
        expect(newGuest[0].email).toBe(`${guestId}@guest.whix.local`);
        expect(newGuest[0].name).toBe(guestName);
        expect(newGuest[0].password).toBe('');
        expect(newGuest[0].role).toBe('free');
        expect(newGuest[0].guestId).toBe(guestId);
      } catch (error: any) {
        console.error('Guest creation error:', error);
        console.error('Error details:', error.detail);
        throw error;
      }
    });

    it('should handle the exact SQL that was failing in production', async () => {
      const guestId = 'guest_UNzLbi2t2r';
      const email = `${guestId}@guest.whix.local`;
      const name = 'Courier_vgr28';
      const password = '';
      const role = 'free';
      const emailVerified = null;
      const createdAt = new Date('2025-07-09T05:59:18.200Z');
      const updatedAt = new Date('2025-07-09T05:59:18.200Z');

      // First ensure this doesn't exist
      await db.delete(users).where(eq(users.id, guestId));

      try {
        // Execute the exact SQL that was failing
        const result = await db.execute(sql`
          INSERT INTO users (id, email, name, password, role, guest_id, email_verified, created_at, updated_at)
          VALUES (${guestId}, ${email}, ${name}, ${password}, ${role}, ${guestId}, ${emailVerified}, ${createdAt}, ${updatedAt})
          RETURNING *;
        `);

        testUserIds.push(guestId);

        expect(result.rows.length).toBe(1);
        expect(result.rows[0].id).toBe(guestId);
        expect(result.rows[0].email).toBe(email);
        expect(result.rows[0].password).toBe(password);
      } catch (error: any) {
        console.error('SQL execution error:', error);
        console.error('Error code:', error.code);
        console.error('Error position:', error.position);
        console.error('Error detail:', error.detail);
        throw error;
      }
    });

    it('should create 100 guest users rapidly without conflicts', async () => {
      const createGuest = async (index: number) => {
        const guestId = `guest_stress_${index}_${Date.now()}_${nanoid(5)}`;
        const guestName = `Courier_${index}`;
        
        const result = await db.insert(users).values({
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
        
        return result[0];
      };

      // Create 100 guests concurrently
      const promises = Array.from({ length: 100 }, (_, i) => createGuest(i));
      const results = await Promise.all(promises);

      // Track for cleanup
      results.forEach(r => testUserIds.push(r.id));

      // Verify all were created
      expect(results.length).toBe(100);
      
      // Verify all have unique IDs and emails
      const ids = new Set(results.map(r => r.id));
      const emails = new Set(results.map(r => r.email));
      
      expect(ids.size).toBe(100);
      expect(emails.size).toBe(100);
    });
  });

  describe('Regular User Authentication - Real Database', () => {
    it('should create and authenticate regular user', async () => {
      const userId = `user_${nanoid(10)}`;
      const email = `test_${Date.now()}@example.com`;
      const password = 'Test123!@#';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const newUser = await db.insert(users).values({
        id: userId,
        email,
        name: 'Test User',
        password: hashedPassword,
        role: 'free',
        emailVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      testUserIds.push(newUser[0].id);

      // Verify creation
      expect(newUser[0].email).toBe(email);
      
      // Test authentication
      const foundUser = await db.select().from(users)
        .where(eq(users.email, email))
        .limit(1);

      expect(foundUser.length).toBe(1);
      
      const isValid = await bcrypt.compare(password, foundUser[0].password || '');
      expect(isValid).toBe(true);
    });

    it('should reject invalid passwords', async () => {
      const userId = `user_${nanoid(10)}`;
      const email = `test_invalid_${Date.now()}@example.com`;
      const password = 'CorrectPassword123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await db.insert(users).values({
        id: userId,
        email,
        name: 'Test User',
        password: hashedPassword,
        role: 'free',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      testUserIds.push(userId);

      const foundUser = await db.select().from(users)
        .where(eq(users.email, email))
        .limit(1);

      const isValid = await bcrypt.compare('WrongPassword123', foundUser[0].password || '');
      expect(isValid).toBe(false);
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle null values correctly', async () => {
      const testCases = [
        {
          name: 'Guest with null email_verified',
          data: {
            id: `guest_null_test_${nanoid(5)}`,
            email: `guest_null_${Date.now()}@guest.whix.local`,
            name: 'Null Test Guest',
            password: '',
            role: 'free' as const,
            guestId: `guest_null_test_${nanoid(5)}`,
            emailVerified: null,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          shouldSucceed: true
        },
        {
          name: 'Regular user with guestId null',
          data: {
            id: `user_null_test_${nanoid(5)}`,
            email: `user_null_${Date.now()}@example.com`,
            name: 'Regular User',
            password: 'hashedpassword',
            role: 'free' as const,
            guestId: null,
            emailVerified: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          },
          shouldSucceed: true
        }
      ];

      for (const testCase of testCases) {
        if (testCase.shouldSucceed) {
          const result = await db.insert(users).values(testCase.data).returning();
          testUserIds.push(result[0].id);
          expect(result[0]).toBeDefined();
        }
      }
    });

    it('should handle very long strings', async () => {
      const longString = 'a'.repeat(1000);
      const guestId = `guest_long_${nanoid(5)}`;
      
      const guest = await db.insert(users).values({
        id: guestId,
        email: `${guestId}@guest.whix.local`,
        name: longString.substring(0, 255), // Assuming reasonable limit
        password: '',
        role: 'free',
        guestId: guestId,
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      testUserIds.push(guest[0].id);
      expect(guest[0].name).toBe(longString.substring(0, 255));
    });

    it('should handle unicode characters in names', async () => {
      const unicodeName = 'Courier_🚀_测试_テスト_тест';
      const guestId = `guest_unicode_${nanoid(5)}`;
      
      const guest = await db.insert(users).values({
        id: guestId,
        email: `${guestId}@guest.whix.local`,
        name: unicodeName,
        password: '',
        role: 'free',
        guestId: guestId,
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      testUserIds.push(guest[0].id);
      expect(guest[0].name).toBe(unicodeName);
    });

    it('should enforce unique email constraint', async () => {
      const email = `unique_test_${Date.now()}@example.com`;
      
      // First user
      const user1 = await db.insert(users).values({
        id: `user_unique_1_${nanoid(5)}`,
        email,
        name: 'User 1',
        password: 'password1',
        role: 'free',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      testUserIds.push(user1[0].id);

      // Attempt duplicate
      await expect(
        db.insert(users).values({
          id: `user_unique_2_${nanoid(5)}`,
          email, // Same email
          name: 'User 2',
          password: 'password2',
          role: 'free',
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning()
      ).rejects.toThrow();
    });
  });

  describe('Player Creation After Auth', () => {
    it('should create player record after user creation', async () => {
      const userId = `user_player_${nanoid(10)}`;
      
      // Create user first
      const user = await db.insert(users).values({
        id: userId,
        email: `player_test_${Date.now()}@example.com`,
        name: 'Player Test',
        password: '',
        role: 'free',
        guestId: userId,
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      testUserIds.push(user[0].id);

      // Create associated player
      const player = await db.insert(players).values({
        userId: user[0].id,
        level: 1,
        experience: 0,
        credits: 1000,
        resonancePoints: 0,
        currentTips: 1000,
        totalTipsEarned: 0,
        companyStars: 0,
        tipCutPercentage: 75,
        storyProgress: {},
        unlockedChapters: [1],
        stats: {
          missionsCompleted: 0,
          partnersRecruited: 0,
          traitsmastered: 0,
        }
      }).returning();

      expect(player[0]).toBeDefined();
      expect(player[0].userId).toBe(userId);
    });
  });
});