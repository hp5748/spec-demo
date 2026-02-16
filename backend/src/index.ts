import express from 'express'
import { config } from './config/index.js'
import { corsMiddleware } from './middlewares/cors.js'
import { errorMiddleware } from './middlewares/error.js'
import authRouter from './routes/auth.js'
import employeesRouter from './routes/employees.js'
import organizationRouter from './routes/organization.js'
import rewardsRouter from './routes/rewards.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const app = express()

// 中间件
app.use(corsMiddleware)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`)
  next()
})

// 路由
app.use('/api/auth', authRouter)
app.use('/api/employees', employeesRouter)
app.use('/api', organizationRouter)
app.use('/api', rewardsRouter)

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '用户管理系统 API 运行正常',
    timestamp: new Date().toISOString()
  })
})

// 错误处理
app.use(errorMiddleware)

// 启动服务器
async function startServer() {
  try {
    // 连接数据库
    await prisma.$connect()
    console.log('数据库连接成功')

    // 启动服务器
    app.listen(config.port, () => {
      console.log(`用户管理系统 API 已启动: http://localhost:${config.port}`)
    })
  } catch (error) {
    console.error('启动服务器失败:', error)
    process.exit(1)
  }
}

startServer()

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('\n正在关闭服务器...')
  await prisma.$disconnect()
  process.exit(0)
})
