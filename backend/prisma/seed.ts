import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/utils/password.js'

const prisma = new PrismaClient()

async function main() {
  console.log('开始初始化测试数据...')

  // 清空现有数据（按照依赖顺序删除）
  await prisma.reward.deleteMany({})
  await prisma.level.deleteMany({})
  await prisma.position.deleteMany({})
  await prisma.department.deleteMany({})
  await prisma.employee.deleteMany({})
  await prisma.user.deleteMany({})
  console.log('已清空现有数据')

  // ==================== 创建测试用户 ====================
  const users = [
    { username: 'admin', password: await hashPassword('admin123'), name: '系统管理员', role: 'admin' },
    { username: 'hr', password: await hashPassword('hr123'), name: '张HR', role: 'hr' },
    { username: 'manager', password: await hashPassword('manager123'), name: '李经理', role: 'manager' },
    { username: 'user', password: await hashPassword('user123'), name: '王员工', role: 'user' },
    { username: 'hr2', password: await hashPassword('hr123'), name: '赵HR专员', role: 'hr' },
    { username: 'manager2', password: await hashPassword('manager123'), name: '钱主管', role: 'manager' }
  ]

  for (const user of users) {
    await prisma.user.create({ data: user })
    console.log(`已创建用户: ${user.username} (${user.name})`)
  }

  // ==================== 创建职级数据 ====================
  const levels = []
  for (let i = 1; i <= 7; i++) {
    levels.push({ code: `${i}A`, name: `${i}级A`, sort: (i - 1) * 3 + 1 })
    levels.push({ code: `${i}B`, name: `${i}级B`, sort: (i - 1) * 3 + 2 })
    levels.push({ code: `${i}C`, name: `${i}级C`, sort: (i - 1) * 3 + 3 })
  }

  for (const level of levels) {
    await prisma.level.create({ data: level })
  }
  console.log(`已创建职级: ${levels.length} 个`)

  // ==================== 创建部门数据 ====================
  const departments = [
    { name: '技术部', description: '负责公司技术研发工作' },
    { name: '产品部', description: '负责产品规划与设计' },
    { name: '设计部', description: '负责UI/UX设计工作' },
    { name: '市场部', description: '负责市场营销与推广' },
    { name: '销售部', description: '负责销售业务' },
    { name: '人力资源部', description: '负责人力资源管理' },
    { name: '财务部', description: '负责财务管理' },
    { name: '行政部', description: '负责行政后勤' }
  ]

  for (const dept of departments) {
    await prisma.department.create({ data: dept })
    console.log(`已创建部门: ${dept.name}`)
  }

  // ==================== 创建岗位数据 ====================
  const positions = [
    { name: '前端工程师', level: '3B', description: '负责前端开发' },
    { name: '后端工程师', level: '3A', description: '负责后端开发' },
    { name: '全栈工程师', level: '4A', description: '负责全栈开发' },
    { name: '技术总监', level: '6A', description: '技术部门负责人' },
    { name: '产品经理', level: '4B', description: '负责产品规划' },
    { name: '产品总监', level: '6B', description: '产品部门负责人' },
    { name: 'UI设计师', level: '2C', description: '负责UI设计' },
    { name: 'UX设计师', level: '3B', description: '负责用户体验设计' },
    { name: '设计总监', level: '5A', description: '设计部门负责人' },
    { name: '市场专员', level: '3B', description: '负责市场推广' },
    { name: '销售经理', level: '4A', description: '负责销售团队' },
    { name: '销售代表', level: '2A', description: '负责销售业务' },
    { name: 'HRBP', level: '4A', description: '人力资源业务伙伴' },
    { name: '招聘专员', level: '3B', description: '负责招聘工作' },
    { name: '会计', level: '3C', description: '负责会计核算' },
    { name: '财务分析师', level: '4B', description: '负责财务分析' },
    { name: '行政助理', level: '2B', description: '负责行政事务' },
    { name: '测试工程师', level: '3A', description: '负责软件测试' },
    { name: '运维工程师', level: '3B', description: '负责系统运维' }
  ]

  for (const pos of positions) {
    await prisma.position.create({ data: pos })
  }
  console.log(`已创建岗位: ${positions.length} 个`)

  // ==================== 创建测试员工数据 ====================
  const employees = [
    { employeeNo: 'EMP001', name: '张三', gender: 'male', age: 28, phone: '13800138001', email: 'zhangsan@example.com', department: '技术部', position: '前端工程师', level: '3B', hireDate: new Date('2023-01-15'), status: 'active' },
    { employeeNo: 'EMP002', name: '李四', gender: 'female', age: 26, phone: '13800138002', email: 'lisi@example.com', department: '技术部', position: '后端工程师', level: '3A', hireDate: new Date('2023-03-20'), status: 'active' },
    { employeeNo: 'EMP003', name: '王五', gender: 'male', age: 32, phone: '13800138003', email: 'wangwu@example.com', department: '产品部', position: '产品经理', level: '4B', hireDate: new Date('2022-06-10'), status: 'active' },
    { employeeNo: 'EMP004', name: '赵六', gender: 'female', age: 24, phone: '13800138004', email: 'zhaoliu@example.com', department: '设计部', position: 'UI设计师', level: '2C', hireDate: new Date('2023-08-01'), status: 'active' },
    { employeeNo: 'EMP005', name: '孙七', gender: 'male', age: 35, phone: '13800138005', email: 'sunqi@example.com', department: '技术部', position: '技术总监', level: '6A', hireDate: new Date('2020-03-15'), status: 'active' },
    { employeeNo: 'EMP006', name: '周八', gender: 'female', age: 29, phone: '13800138006', email: 'zhouba@example.com', department: '市场部', position: '市场专员', level: '3B', hireDate: new Date('2022-11-20'), status: 'active' },
    { employeeNo: 'EMP007', name: '吴九', gender: 'male', age: 31, phone: '13800138007', email: 'wujiu@example.com', department: '人力资源部', position: 'HRBP', level: '4A', hireDate: new Date('2021-09-05'), status: 'active' },
    { employeeNo: 'EMP008', name: '郑十', gender: 'female', age: 27, phone: '13800138008', email: 'zhengshi@example.com', department: '财务部', position: '会计', level: '3C', hireDate: new Date('2022-04-12'), status: 'active' },
    { employeeNo: 'EMP009', name: '刘十一', gender: 'male', age: 30, phone: '13800138009', email: 'liushiyi@example.com', department: '技术部', position: '测试工程师', level: '3A', hireDate: new Date('2022-07-25'), status: 'inactive' },
    { employeeNo: 'EMP010', name: '陈十二', gender: 'female', age: 25, phone: '13800138010', email: 'chenshier@example.com', department: '行政部', position: '行政助理', level: '2B', hireDate: new Date('2023-05-18'), status: 'active' }
  ]

  const createdEmployees = []
  for (const employee of employees) {
    const created = await prisma.employee.create({ data: employee })
    createdEmployees.push(created)
    console.log(`已创建员工: ${employee.employeeNo} (${employee.name}) - ${employee.department}`)
  }

  // ==================== 创建奖惩记录数据 ====================
  const rewards = [
    { employeeId: createdEmployees[0].id, type: 'reward', reason: '年度优秀员工', amount: 5000, date: new Date('2024-01-15'), description: '2023年度表现优异' },
    { employeeId: createdEmployees[1].id, type: 'reward', reason: '项目奖金', amount: 3000, date: new Date('2024-02-01'), description: '完成重点项目' },
    { employeeId: createdEmployees[2].id, type: 'reward', reason: '创新奖', amount: 2000, date: new Date('2024-01-20'), description: '提出创新方案' },
    { employeeId: createdEmployees[8].id, type: 'punishment', reason: '迟到早退', amount: -200, date: new Date('2024-01-10'), description: '当月迟到3次' },
    { employeeId: createdEmployees[5].id, type: 'reward', reason: '销售冠军', amount: 8000, date: new Date('2024-01-25'), description: '季度销售第一' },
    { employeeId: createdEmployees[4].id, type: 'reward', reason: '技术突破奖', amount: 10000, date: new Date('2024-02-10'), description: '攻克技术难题' },
    { employeeId: createdEmployees[3].id, type: 'reward', reason: '设计优化奖', amount: 1500, date: new Date('2024-01-30'), description: '提升产品体验' },
    { employeeId: createdEmployees[6].id, type: 'reward', reason: '优秀HR', amount: 2000, date: new Date('2024-02-05'), description: '年度优秀HR' },
    { employeeId: createdEmployees[9].id, type: 'reward', reason: '新人进步奖', amount: 1000, date: new Date('2024-01-28'), description: '快速融入团队' },
    { employeeId: createdEmployees[7].id, type: 'punishment', reason: '报销违规', amount: -500, date: new Date('2024-01-15'), description: '报销流程违规' }
  ]

  for (const reward of rewards) {
    await prisma.reward.create({ data: reward })
    const emp = createdEmployees.find(e => e.id === reward.employeeId)
    console.log(`已创建奖惩记录: ${emp?.name} - ${reward.type === 'reward' ? '奖励' : '惩罚'} ${reward.amount}元`)
  }

  console.log('\n=====================================')
  console.log('测试数据初始化完成!')
  console.log('\n测试账号列表:')
  console.log('====================')
  users.forEach(u => {
    console.log(`${u.name}: ${u.username} / ${u.role === 'admin' ? 'admin123' : u.role + '123'}`)
  })
  console.log('\n组织架构统计:')
  console.log('====================')
  console.log(`部门: ${departments.length} 个`)
  console.log(`岗位: ${positions.length} 个`)
  console.log(`职级: ${levels.length} 个`)
  console.log(`在职员工: ${employees.filter(e => e.status === 'active').length} 人`)
  console.log(`离职员工: ${employees.filter(e => e.status === 'inactive').length} 人`)
  console.log(`奖惩记录: ${rewards.length} 条 (${rewards.filter(r => r.type === 'reward').length} 条奖励 / ${rewards.filter(r => r.type === 'punishment').length} 条惩罚)`)
  console.log('=====================================')
}

main()
  .catch((e) => {
    console.error('初始化测试数据失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
