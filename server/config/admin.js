/**
 * 管理员配置文件
 * 包含管理员身份验证相关的配置和工具函数
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * 对密码进行哈希处理
 * @param {string} password 原始密码
 * @returns {string} 哈希后的密码
 */
function hashPassword(password) {
  // 使用SHA-256哈希算法，实际生产环境应使用更安全的方法如bcrypt
  return crypto.createHash('sha256').update(password).digest('hex');
}

// 配置文件路径
const CONFIG_FILE_PATH = path.join(__dirname, '../config/admin_config.json');

// 默认配置
const DEFAULT_CONFIG = {
  // 默认管理员账户，初始用户名和密码
  // 注意: 这只是首次运行时的默认值，应该在首次使用后通过管理界面修改
  admins: [
    {
      id: '1',
      username: 'admin',
      // 密码默认为'veoai-admin-2024'的哈希值
      passwordHash: hashPassword('veoai-admin-2024'),
      displayName: '系统管理员',
      role: 'super_admin',
      createdAt: new Date().toISOString(),
      lastLogin: null
    }
  ],
  // 安全设置
  security: {
    // 令牌有效期（小时）
    tokenExpiresIn: 24,
    // 最大登录尝试次数
    maxLoginAttempts: 5,
    // 锁定时间（分钟）
    lockoutDuration: 30,
    // 是否启用双因素认证
    enable2FA: false
  },
  // 审计日志设置
  audit: {
    // 是否记录管理员操作
    enableAuditLog: true,
    // 是否记录管理员登录
    enableLoginLog: true
  }
};

/**
 * 确保配置文件存在
 */
function ensureConfigExists() {
  try {
    const configDir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    if (!fs.existsSync(CONFIG_FILE_PATH)) {
      fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2));
      console.log('已创建管理员配置文件:', CONFIG_FILE_PATH);
    }
  } catch (error) {
    console.error('创建管理员配置文件失败:', error);
    // 如果无法创建配置文件，使用内存中的默认配置
    return DEFAULT_CONFIG;
  }
}

/**
 * 获取管理员配置
 * @returns {Object} 管理员配置对象
 */
function getAdminConfig() {
  ensureConfigExists();
  
  try {
    const configData = fs.readFileSync(CONFIG_FILE_PATH, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('读取管理员配置失败:', error);
    return DEFAULT_CONFIG;
  }
}

/**
 * 更新管理员配置
 * @param {Object} newConfig 新的配置对象
 * @returns {boolean} 是否成功更新
 */
function updateAdminConfig(newConfig) {
  try {
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(newConfig, null, 2));
    console.log('管理员配置已更新');
    return true;
  } catch (error) {
    console.error('更新管理员配置失败:', error);
    return false;
  }
}

/**
 * 验证管理员身份
 * @param {string} username 用户名
 * @param {string} password 密码
 * @returns {Object|null} 成功返回管理员对象，失败返回null
 */
function validateAdmin(username, password) {
  const config = getAdminConfig();
  const admin = config.admins.find(a => a.username === username);
  
  if (!admin) {
    return null;
  }
  
  const hashedPassword = hashPassword(password);
  if (admin.passwordHash !== hashedPassword) {
    return null;
  }
  
  // 更新最后登录时间
  admin.lastLogin = new Date().toISOString();
  updateAdminConfig(config);
  
  return {
    id: admin.id,
    username: admin.username,
    displayName: admin.displayName,
    role: admin.role
  };
}

/**
 * 创建身份验证令牌
 * @param {Object} admin 管理员对象
 * @returns {string} 身份验证令牌
 */
function createAuthToken(admin) {
  // 简单的令牌生成，实际生产环境应使用JWT或其他更安全的方法
  const payload = {
    id: admin.id,
    username: admin.username,
    role: admin.role,
    timestamp: Date.now(),
    expiresAt: Date.now() + getAdminConfig().security.tokenExpiresIn * 60 * 60 * 1000
  };
  
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * 验证身份验证令牌
 * @param {string} token 身份验证令牌
 * @returns {Object|null} 成功返回管理员对象，失败返回null
 */
function validateAuthToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    
    // 检查令牌是否过期
    if (payload.expiresAt < Date.now()) {
      return null;
    }
    
    // 在实际生产环境中，应该进一步验证令牌的有效性
    return {
      id: payload.id,
      username: payload.username,
      role: payload.role
    };
  } catch (error) {
    console.error('令牌验证失败:', error);
    return null;
  }
}

// 初始化配置
ensureConfigExists();

module.exports = {
  getAdminConfig,
  updateAdminConfig,
  hashPassword,
  validateAdmin,
  createAuthToken,
  validateAuthToken
}; 