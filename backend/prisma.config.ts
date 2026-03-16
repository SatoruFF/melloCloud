import path from 'node:path'
import { defineConfig } from 'prisma/config'
import { PrismaPg } from '@prisma/adapter-pg'

export default defineConfig({
  earlyAccess: true,
  schema: path.join('src', 'prisma', 'schema.prisma'),
  migrate: {
    async adapter(env) {
      return new PrismaPg({ connectionString: env['DATABASE_URL'] ?? '' })
    },
  },
})
