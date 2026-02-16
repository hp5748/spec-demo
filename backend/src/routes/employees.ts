import { Router } from 'express'
import multer from 'multer'
import xlsx from 'xlsx'
import { authMiddleware } from '../middlewares/auth.js'
import type { AuthenticatedRequest } from '../types/index.js'
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  updateEmployeeStatus,
  getAllEmployees,
  importEmployees
} from '../services/employees.js'

// 配置文件上传（使用内存存储）
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制 5MB
  },
  fileFilter: (req, file, cb) => {
    // 只允许 Excel 文件
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/octet-stream'
    ]
    const allowedExtensions = ['.xlsx', '.xls']
    const fileExtension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'))

    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true)
    } else {
      cb(new Error('只支持上传 Excel 文件 (.xlsx, .xls)'))
    }
  }
})

const router = Router()

// 所有员工路由都需要认证
router.use(authMiddleware)

// 获取员工列表（支持搜索和分页）
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 10
    const { name, employeeNo, department, status } = req.query

    const result = await getEmployees(
      { name: name as string, employeeNo: employeeNo as string, department: department as string, status: status as string },
      { page, pageSize }
    )

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    next(error)
  }
})

// ==================== Excel 导入导出功能 ====================
// 注意：这些路由必须在 /:id 之前定义，避免被 /:id 匹配

/**
 * 导出员工数据为 Excel
 * GET /api/employees/export
 */
router.get('/export', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { name, employeeNo, department, status } = req.query

    // 获取数据
    const employees = await getAllEmployees({
      name: name as string,
      employeeNo: employeeNo as string,
      department: department as string,
      status: status as string
    })

    // 性别映射
    const genderMap: Record<string, string> = {
      'male': '男',
      'female': '女',
      'other': '其他'
    }

    // 状态映射
    const statusMap: Record<string, string> = {
      'active': '在职',
      'inactive': '离职'
    }

    // 准备 Excel 数据
    const excelData = employees.map(emp => ({
      '工号': emp.employeeNo,
      '姓名': emp.name,
      '性别': genderMap[emp.gender] || emp.gender,
      '年龄': emp.age || '',
      '联系电话': emp.phone || '',
      '邮箱': emp.email || '',
      '部门': emp.department || '',
      '岗位': emp.position || '',
      '职级': emp.level || '',
      '入职日期': emp.hireDate ? new Date(emp.hireDate).toLocaleDateString('zh-CN') : '',
      '状态': statusMap[emp.status] || emp.status
    }))

    // 创建工作簿
    const worksheet = xlsx.utils.json_to_sheet(excelData)
    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, worksheet, '员工信息')

    // 设置列宽
    worksheet['!cols'] = [
      { wch: 12 }, // 工号
      { wch: 10 }, // 姓名
      { wch: 6 },  // 性别
      { wch: 6 },  // 年龄
      { wch: 15 }, // 联系电话
      { wch: 20 }, // 邮箱
      { wch: 12 }, // 部门
      { wch: 12 }, // 岗位
      { wch: 8 },  // 职级
      { wch: 12 }, // 入职日期
      { wch: 8 }   // 状态
    ]

    // 生成 Excel 文件
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // 设置响应头
    const fileName = `员工信息_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.xlsx`
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`)

    res.send(buffer)
  } catch (error) {
    next(error)
  }
})

/**
 * 下载导入模板
 * GET /api/employees/import/template
 */
router.get('/import/template', async (req: AuthenticatedRequest, res, next) => {
  try {
    // 创建模板数据
    const templateData = [
      {
        '工号': 'EMP001',
        '姓名': '张三',
        '性别': '男',
        '年龄': 28,
        '联系电话': '13800138000',
        '邮箱': 'zhangsan@example.com',
        '部门': '技术部',
        '岗位': '前端工程师',
        '职级': '3B',
        '入职日期': '2023-01-15',
        '状态': '在职'
      },
      {
        '工号': 'EMP002',
        '姓名': '李四',
        '性别': '女',
        '年龄': 26,
        '联系电话': '13800138001',
        '邮箱': 'lisi@example.com',
        '部门': '产品部',
        '岗位': '产品经理',
        '职级': '4B',
        '入职日期': '2023-03-20',
        '状态': '在职'
      }
    ]

    // 创建工作簿
    const worksheet = xlsx.utils.json_to_sheet(templateData)
    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, worksheet, '员工信息模板')

    // 设置列宽
    worksheet['!cols'] = [
      { wch: 12 }, // 工号
      { wch: 10 }, // 姓名
      { wch: 6 },  // 性别
      { wch: 6 },  // 年龄
      { wch: 15 }, // 联系电话
      { wch: 20 }, // 邮箱
      { wch: 12 }, // 部门
      { wch: 12 }, // 岗位
      { wch: 8 },  // 职级
      { wch: 12 }, // 入职日期
      { wch: 8 }   // 状态
    ]

    // 生成 Excel 文件
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // 设置响应头
    const fileName = '员工信息导入模板.xlsx'
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`)

    res.send(buffer)
  } catch (error) {
    next(error)
  }
})

// 获取单个员工详情
router.get('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = parseInt(req.params.id)
    const employee = await getEmployeeById(id)

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: '员工不存在',
        code: 404
      })
    }

    res.json({
      success: true,
      data: employee
    })
  } catch (error) {
    next(error)
  }
})

// 创建员工
router.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const {
      employeeNo,
      name,
      gender,
      age,
      phone,
      email,
      department,
      position,
      level,
      hireDate,
      status
    } = req.body

    // 验证必填字段
    if (!employeeNo || !name || !gender) {
      return res.status(400).json({
        success: false,
        error: '工号、姓名和性别为必填项',
        code: 400
      })
    }

    // 验证性别值
    if (!['male', 'female', 'other'].includes(gender)) {
      return res.status(400).json({
        success: false,
        error: '性别值无效，必须是 male、female 或 other',
        code: 400
      })
    }

    // 验证状态值
    if (status && !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: '状态值无效，必须是 active 或 inactive',
        code: 400
      })
    }

    const employee = await createEmployee({
      employeeNo,
      name,
      gender,
      age,
      phone,
      email,
      department,
      position,
      level,
      hireDate: hireDate ? new Date(hireDate) : undefined,
      status: status || 'active'
    })

    res.status(201).json({
      success: true,
      data: employee
    })
  } catch (error: any) {
    // 处理唯一约束冲突
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: '工号已存在',
        code: 409
      })
    }
    next(error)
  }
})

// 更新员工信息
router.put('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = parseInt(req.params.id)
    const {
      name,
      gender,
      age,
      phone,
      email,
      department,
      position,
      level,
      hireDate,
      status
    } = req.body

    // 验证性别值（如果提供）
    if (gender && !['male', 'female', 'other'].includes(gender)) {
      return res.status(400).json({
        success: false,
        error: '性别值无效，必须是 male、female 或 other',
        code: 400
      })
    }

    // 验证状态值（如果提供）
    if (status && !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: '状态值无效，必须是 active 或 inactive',
        code: 400
      })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (gender !== undefined) updateData.gender = gender
    if (age !== undefined) updateData.age = age
    if (phone !== undefined) updateData.phone = phone
    if (email !== undefined) updateData.email = email
    if (department !== undefined) updateData.department = department
    if (position !== undefined) updateData.position = position
    if (level !== undefined) updateData.level = level
    if (hireDate !== undefined) updateData.hireDate = new Date(hireDate)
    if (status !== undefined) updateData.status = status

    const employee = await updateEmployee(id, updateData)

    res.json({
      success: true,
      data: employee
    })
  } catch (error: any) {
    // 处理记录不存在
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: '员工不存在',
        code: 404
      })
    }
    next(error)
  }
})

// 删除员工
router.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = parseInt(req.params.id)
    await deleteEmployee(id)

    res.json({
      success: true,
      message: '删除成功'
    })
  } catch (error: any) {
    // 处理记录不存在
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: '员工不存在',
        code: 404
      })
    }
    next(error)
  }
})

// 更新员工状态
router.patch('/:id/status', async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = parseInt(req.params.id)
    const { status } = req.body

    if (!status) {
      return res.status(400).json({
        success: false,
        error: '状态不能为空',
        code: 400
      })
    }

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: '状态值无效，必须是 active 或 inactive',
        code: 400
      })
    }

    const employee = await updateEmployeeStatus(id, status)

    res.json({
      success: true,
      data: employee
    })
  } catch (error: any) {
    // 处理记录不存在
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: '员工不存在',
        code: 404
      })
    }
    next(error)
  }
})

// 导入员工数据从 Excel
// POST /api/employees/import
router.post('/import', upload.single('file'), async (req: AuthenticatedRequest, res, next) => {
  try {
    // 检查权限（仅管理员可导入）
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '无权限：仅管理员可导入数据',
        code: 403
      })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '请上传文件',
        code: 400
      })
    }

    // 解析 Excel 文件
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    // 转换为 JSON
    const jsonData = xlsx.utils.sheet_to_json<any>(worksheet)

    if (jsonData.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Excel 文件为空',
        code: 400
      })
    }

    // 性别映射
    const genderMap: Record<string, string> = {
      '男': 'male',
      '女': 'female',
      '其他': 'other'
    }

    // 状态映射
    const statusMap: Record<string, string> = {
      '在职': 'active',
      '离职': 'inactive'
    }

    // 转换数据格式
    const employeesData = jsonData.map((row: any) => {
      // 处理性别
      let gender = row['性别'] || row['gender'] || 'other'
      gender = genderMap[gender] || gender

      // 处理状态
      let status = row['状态'] || row['status'] || 'active'
      status = statusMap[status] || status

      // 处理入职日期
      let hireDate: Date | undefined
      if (row['入职日期'] || row['hireDate']) {
        const dateValue = row['入职日期'] || row['hireDate']
        if (typeof dateValue === 'number') {
          // Excel 日期序列号
          hireDate = new Date((dateValue - 25569) * 86400 * 1000)
        } else {
          hireDate = new Date(dateValue)
        }
      }

      return {
        employeeNo: String(row['工号'] || row['employeeNo'] || ''),
        name: String(row['姓名'] || row['name'] || ''),
        gender,
        age: row['年龄'] || row['age'] ? parseInt(row['年龄'] || row['age']) : undefined,
        phone: String(row['联系电话'] || row['phone'] || ''),
        email: String(row['邮箱'] || row['email'] || ''),
        department: String(row['部门'] || row['department'] || ''),
        position: String(row['岗位'] || row['position'] || ''),
        level: String(row['职级'] || row['level'] || ''),
        hireDate,
        status
      }
    })

    // 批量导入
    const result = await importEmployees(employeesData)

    res.json({
      success: true,
      data: result,
      message: `导入完成：成功 ${result.success} 条，失败 ${result.failed} 条`
    })
  } catch (error: any) {
    next(error)
  }
})

export default router
