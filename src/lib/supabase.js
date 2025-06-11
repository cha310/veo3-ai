import { createClient } from '@supabase/supabase-js';

// 从环境变量中获取Supabase URL和匿名密钥
const supabaseUrl = 'https://fijmggqhxqjszrnaqnio.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpam1nZ3FoeHFqc3pybmFxbmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDY2NDcsImV4cCI6MjA2NTEyMjY0N30.CdTls1LPjS8t_7B4gz8yBNwQGvm3JR_Ms3A11SUCx2Y';

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase; 