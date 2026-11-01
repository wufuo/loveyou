# ✨ 爱心宇宙 ✨

一个浪漫的星空主题网页，支持多人互动和数据同步。

## 功能

- 🌌 动态星空背景
- ⭐ 点击添加星星
- ☁️ 添加可爱云朵
- 💖 写下祝福
- ☁️ 云端数据同步（使用 Supabase）
- 📊 实时统计

## 部署步骤

### 1. 配置 Supabase

1. 打开 https://supabase.com
2. 创建新项目
3. 在 SQL Editor 中运行：
   ```sql
   CREATE TABLE IF NOT EXISTS app_data (
     user_id TEXT NOT NULL,
     key TEXT NOT NULL,
     data JSONB NOT NULL,
     updated_at TIMESTAMPTZ DEFAULT NOW(),
     PRIMARY KEY (user_id, key)
   );
