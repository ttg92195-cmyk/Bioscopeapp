import { PrismaClient } from '@prisma/client';

// Remove channel_binding=require from DATABASE_URL if present
// (Neon includes this but Prisma does not support it)
function cleanDatabaseUrl(url: string): string {
  // Remove ?channel_binding=require or &channel_binding=require
  let cleaned = url.replace(/[?&]channel_binding=require/, '');
  // Fix leftover ?& or trailing &
  cleaned = cleaned.replace(/[?&]$/, '');
  // Fix case where ? was removed leaving first param without ?
  // e.g. "neondb&sslmode=require" -> "neondb?sslmode=require"
  cleaned = cleaned.replace(/([^\?&])&/, '$1?');
  return cleaned;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const databaseUrl = process.env.DATABASE_URL
  ? cleanDatabaseUrl(process.env.DATABASE_URL)
  : '';

export const db = globalForPrisma.prisma ?? new PrismaClient({
  datasourceUrl: databaseUrl || undefined,
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
