-- AI 客服 SaaS 数据库表结构
-- 版本: 1.0.0

-- 租户表
CREATE TABLE IF NOT EXISTS `tenants` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '租户ID',
  `company_name` VARCHAR(100) NOT NULL COMMENT '公司名称',
  `email` VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
  `industry` VARCHAR(50) COMMENT '行业',
  `plan` ENUM('free', 'pro', 'enterprise', 'custom') DEFAULT 'free' COMMENT '套餐',
  `status` ENUM('active', 'suspended', 'cancelled') DEFAULT 'active' COMMENT '状态',
  `logo` VARCHAR(255) COMMENT 'Logo URL',
  `contact` VARCHAR(50) COMMENT '联系人',
  `phone` VARCHAR(20) COMMENT '联系电话',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='租户表';

-- 用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
  `email` VARCHAR(100) NOT NULL COMMENT '邮箱',
  `password_hash` VARCHAR(255) NOT NULL COMMENT '密码',
  `name` VARCHAR(50) COMMENT '姓名',
  `role` ENUM('admin', 'manager', 'agent', 'viewer') DEFAULT 'viewer' COMMENT '角色',
  `status` TINYINT DEFAULT 1 COMMENT '状态 0禁用 1启用',
  `last_login` DATETIME COMMENT '最后登录',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_tenant` (`tenant_id`),
  INDEX `idx_email` (`email`),
  FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 知识库表
CREATE TABLE IF NOT EXISTS `knowledge` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '知识ID',
  `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
  `title` VARCHAR(200) NOT NULL COMMENT '标题',
  `content` TEXT NOT NULL COMMENT '内容',
  `category` VARCHAR(50) DEFAULT 'general' COMMENT '分类',
  `tags` VARCHAR(255) COMMENT '标签，逗号分隔',
  `status` ENUM('draft', 'published', 'archived') DEFAULT 'draft' COMMENT '状态',
  `view_count` INT DEFAULT 0 COMMENT '查看次数',
  `useful_count` INT DEFAULT 0 COMMENT '赞',
  `created_by` BIGINT COMMENT '创建人',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_tenant` (`tenant_id`),
  INDEX `idx_category` (`category`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库表';

-- 对话表
CREATE TABLE IF NOT EXISTS `conversations` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '对话ID',
  `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
  `user_id` BIGINT COMMENT '客服用户ID',
  `channel` VARCHAR(20) NOT NULL COMMENT '渠道: weixin/feishu/web/app',
  `channel_user_id` VARCHAR(100) COMMENT '渠道用户ID',
  `channel_user_name` VARCHAR(50) COMMENT '渠道用户名',
  `status` ENUM('active', 'waiting', 'answered', 'transferred', 'closed') DEFAULT 'active' COMMENT '状态',
  `rating` TINYINT COMMENT '满意度 1-5',
  `rating_comment` VARCHAR(500) COMMENT '评价内容',
  `started_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '开始时间',
  `answered_at` DATETIME COMMENT '首次回复时间',
  `transferred_at` DATETIME COMMENT '转人工时间',
  `closed_at` DATETIME COMMENT '结束时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_tenant` (`tenant_id`),
  INDEX `idx_channel` (`channel`),
  INDEX `idx_status` (`status`),
  INDEX `idx_started_at` (`started_at`),
  FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='对话表';

-- 消息表
CREATE TABLE IF NOT EXISTS `messages` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '消息ID',
  `conversation_id` BIGINT NOT NULL COMMENT '对话ID',
  `role` ENUM('user', 'assistant', 'agent') NOT NULL COMMENT '角色',
  `content` TEXT NOT NULL COMMENT '内容',
  `source` VARCHAR(20) DEFAULT 'ai' COMMENT '来源: ai/human/robot',
  `model` VARCHAR(50) COMMENT '使用的模型',
  `tokens` INT COMMENT '消耗的token',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_conversation` (`conversation_id`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息表';

-- 渠道配置表
CREATE TABLE IF NOT EXISTS `channels` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '渠道ID',
  `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
  `name` VARCHAR(50) NOT NULL COMMENT '渠道名称',
  `type` VARCHAR(20) NOT NULL COMMENT '类型: weixin/feishu/web/app',
  `config` JSON COMMENT '配置信息',
  `status` TINYINT DEFAULT 1 COMMENT '状态 0禁用 1启用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_tenant` (`tenant_id`),
  INDEX `idx_type` (`type`),
  FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='渠道配置表';

-- 套餐表
CREATE TABLE IF NOT EXISTS `plans` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `plan_key` VARCHAR(20) NOT NULL UNIQUE COMMENT '套餐标识',
  `name` VARCHAR(50) NOT NULL COMMENT '套餐名称',
  `price` DECIMAL(10,2) DEFAULT 0 COMMENT '价格/月',
  `features` JSON COMMENT '功能列表',
  `limits` JSON COMMENT '限制配置',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `status` TINYINT DEFAULT 1 COMMENT '状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='套餐表';

-- 订单表
CREATE TABLE IF NOT EXISTS `orders` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
  `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
  `plan_key` VARCHAR(20) NOT NULL COMMENT '套餐',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '金额',
  `status` ENUM('pending', 'paid', 'cancelled', 'refunded') DEFAULT 'pending' COMMENT '状态',
  `pay_method` VARCHAR(20) COMMENT '支付方式',
  `pay_time` DATETIME COMMENT '支付时间',
  `expired_at` DATETIME COMMENT '过期时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_tenant` (`tenant_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 用量统计表
CREATE TABLE IF NOT EXISTS `usage_stats` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
  `stat_date` DATE NOT NULL COMMENT '统计日期',
  `chats` INT DEFAULT 0 COMMENT '对话数',
  `messages` INT DEFAULT 0 COMMENT '消息数',
  `ai_calls` INT DEFAULT 0 COMMENT 'AI调用次数',
  `tokens` BIGINT DEFAULT 0 COMMENT '消耗token',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX `idx_tenant_date` (`tenant_id`, `stat_date`),
  FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用量统计表';

-- 操作日志表
CREATE TABLE IF NOT EXISTS `operation_logs` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `tenant_id` BIGINT COMMENT '租户ID',
  `user_id` BIGINT COMMENT '用户ID',
  `action` VARCHAR(50) NOT NULL COMMENT '操作',
  `module` VARCHAR(50) COMMENT '模块',
  `content` TEXT COMMENT '内容',
  `ip` VARCHAR(45) COMMENT 'IP地址',
  `user_agent` VARCHAR(255) COMMENT '用户代理',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_tenant` (`tenant_id`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 初始化套餐数据
INSERT INTO `plans` (`plan_key`, `name`, `price`, `features`, `limits`, `sort_order`) VALUES
('free', '免费版', 0, 
 '["100条对话/月", "1个渠道", "基础知识库", "基本统计"]',
 '{"chats": 100, "channels": 1, "users": 3, "storage": 500}',
 1),
('pro', '专业版', 99, 
 '["5000条对话/月", "3个渠道", "高级知识库", "完整统计", "API接入"]',
 '{"chats": 5000, "channels": 3, "users": 10, "storage": 5000}',
 2),
('enterprise', '企业版', 299, 
 '["无限对话", "10个渠道", "私有知识库", "专属客服", "定制开发"]',
 '{"chats": -1, "channels": 10, "users": -1, "storage": -1}',
 3);
