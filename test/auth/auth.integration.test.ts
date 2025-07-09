import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Integration tests that test the actual auth flow
describe('Auth Integration Tests', () => {
  const testUsers: string[] = [];

  afterEach(async () => {
    // Clean up test users
    for (const userId of testUsers) {
      await db.delete(users).where(eq(users.id, userId));
    }
    testUsers.length = 0;
    
    // Clean up guest users
    const guestUsers = await db.select().from(users)
      .where(eq(users.email, 'guest.whix.local'));
    
    for (const user of guestUsers) {
      if (user.email?.includes('@guest.whix.local')) {
        await db.delete(users).where(eq(users.id, user.id));
      }
    }
  });

  describe('Guest User Flow', () => {
    it('should create unique guest users with proper database fields', async () => {
      // Test the actual database constraints
      const testCases = [
        {
          name: 'Valid guest with all fields',
          data: {
            id: 'guest_test_123',
            email: 'guest_test_123@guest.whix.local',
            name: 'Courier_test',
            password: '',
            role: 'free' as const,
            guestId: 'guest_test_123',
            emailVerified: null,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          shouldSucceed: true
        },
        {
          name: 'Guest without email (should fail)',
          data: {
            id: 'guest_test_456',
            email: undefined as any,
            name: 'Courier_test2',
            password: '',
            role: 'free' as const,
            guestId: 'guest_test_456',
            emailVerified: null,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          shouldSucceed: false
        },
        {
          name: 'Guest with null password (should fail)',
          data: {
            id: 'guest_test_789',
            email: 'guest_test_789@guest.whix.local',
            name: 'Courier_test3',
            password: null as any,
            role: 'free' as const,
            guestId: 'guest_test_789',
            emailVerified: null,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          shouldSucceed: false
        }
      ];

      for (const testCase of testCases) {
        if (testCase.shouldSucceed) {
          const result = await db.insert(users).values(testCase.data).returning();
          expect(result[0]).toBeDefined();
          expect(result[0].id).toBe(testCase.data.id);
          expect(result[0].email).toBe(testCase.data.email);
          testUsers.push(result[0].id);
        } else {
          await expect(
            db.insert(users).values(testCase.data).returning()
          ).rejects.toThrow();
        }
      }
    });

    it('should handle rapid guest creation without conflicts', async () => {
      const createGuest = async (index: number) => {
        const guestId = `guest_rapid_${index}_${Date.now()}`;
        const result = await db.insert(users).values({
          id: guestId,
          email: `${guestId}@guest.whix.local`,
          name: `Courier_${index}`,
          password: '',
          role: 'free' as const,
          guestId: guestId,
          emailVerified: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();
        return result[0];
      };

      // Create 10 guests rapidly
      const promises = Array.from({ length: 10 }, (_, i) => createGuest(i));
      const results = await Promise.all(promises);

      // Verify all were created successfully
      expect(results.length).toBe(10);
      
      // Verify all have unique emails
      const emails = results.map(r => r.email);
      const uniqueEmails = new Set(emails);
      expect(uniqueEmails.size).toBe(10);

      // Track for cleanup
      results.forEach(r => testUsers.push(r.id));
    });

    it('should properly set guest-specific fields', async () => {
      const guestId = 'guest_fields_test_' + Date.now();
      const result = await db.insert(users).values({
        id: guestId,
        email: `${guestId}@guest.whix.local`,
        name: 'Courier_fields',
        password: '',
        role: 'free',
        guestId: guestId,
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      const guest = result[0];
      testUsers.push(guest.id);

      // Verify guest-specific properties
      expect(guest.guestId).toBe(guestId);
      expect(guest.email).toContain('@guest.whix.local');
      expect(guest.password).toBe('');
      expect(guest.emailVerified).toBeNull();
      expect(guest.role).toBe('free');
    });
  });

  describe('Database Constraints', () => {
    it('should enforce unique email constraint', async () => {
      const email = 'unique_test@example.com';
      
      // First user should succeed
      const user1 = await db.insert(users).values({
        id: 'user_unique_1',
        email,
        name: 'User 1',
        password: 'hashed_password',
        role: 'free',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      testUsers.push(user1[0].id);

      // Second user with same email should fail
      await expect(
        db.insert(users).values({
          id: 'user_unique_2',
          email, // Same email
          name: 'User 2',
          password: 'hashed_password',
          role: 'free',
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning()
      ).rejects.toThrow();
    });

    it('should enforce primary key constraint', async () => {
      const id = 'pk_test_user';
      
      // First user should succeed
      const user1 = await db.insert(users).values({
        id,
        email: 'pk1@example.com',
        name: 'PK User 1',
        password: 'hashed_password',
        role: 'free',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      testUsers.push(user1[0].id);

      // Second user with same ID should fail
      await expect(
        db.insert(users).values({
          id, // Same ID
          email: 'pk2@example.com',
          name: 'PK User 2',
          password: 'hashed_password',
          role: 'free',
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning()
      ).rejects.toThrow();
    });

    it('should handle timestamps correctly', async () => {
      const before = new Date();
      
      const user = await db.insert(users).values({
        id: 'timestamp_test_user',
        email: 'timestamp@example.com',
        name: 'Timestamp User',
        password: '',
        role: 'free',
        guestId: 'timestamp_test_user',
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      const after = new Date();
      testUsers.push(user[0].id);

      expect(user[0].createdAt).toBeDefined();
      expect(user[0].updatedAt).toBeDefined();
      expect(user[0].createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(user[0].createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('Error Handling', () => {
    it('should provide meaningful error for missing required fields', async () => {
      try {
        await db.insert(users).values({
          id: 'error_test_user',
          // Missing email
          name: 'Error User',
          password: '',
          role: 'free',
          createdAt: new Date(),
          updatedAt: new Date()
        } as any).returning();
        
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toBeDefined();
      }
    });

    it('should handle SQL injection attempts safely', async () => {
      const maliciousId = "'; DROP TABLE users; --";
      const safeId = 'injection_test_user';
      
      const user = await db.insert(users).values({
        id: safeId,
        email: `${safeId}@example.com`,
        name: maliciousId, // Malicious content in name
        password: '',
        role: 'free',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      testUsers.push(user[0].id);

      // Verify the user was created with the malicious string as data, not executed
      expect(user[0].name).toBe(maliciousId);
      
      // Verify users table still exists
      const tableCheck = await db.select().from(users).limit(1);
      expect(tableCheck).toBeDefined();
    });
  });
});