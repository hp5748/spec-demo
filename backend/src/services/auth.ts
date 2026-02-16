import { PrismaClient } from '@prisma/client'
import { comparePassword } from '../utils/password.js'
import { generateToken } from '../utils/jwt.js'
import type { User, LoginRequest } from '../types/index.js'

const prisma = new PrismaClient()

export async function login(data: LoginRequest): Promise<{ token: string; user: User } | null> {
  const user = await prisma.user.findUnique({
    where: { username: data.username }
  })

  if (!user) {
    return null
  }

  const isPasswordValid = await comparePassword(data.password, user.password)

  if (!isPasswordValid) {
    return null
  }

  const token = generateToken({
    userId: user.id,
    username: user.username,
    role: user.role
  })

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role as 'admin' | 'hr' | 'manager' | 'user'
    }
  }
}

export async function getUserById(id: number): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { id }
  })

  if (!user) {
    return null
  }

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role as 'admin' | 'hr' | 'manager' | 'user'
  }
}
