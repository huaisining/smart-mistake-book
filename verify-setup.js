const fs = require('fs');
const path = require('path');

console.log('🔍 开始验证智能错题本配置...\n');

let allPassed = true;

// 1. 检查 Node.js 版本
console.log('1️⃣  检查 Node.js 版本...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1));
if (majorVersion >= 18) {
  console.log(`   ✅ Node.js ${nodeVersion} 满足要求 (>= 18.17)\n`);
} else {
  console.log(`   ❌ Node.js ${nodeVersion} 不满足要求 (需要 >= 18.17)\n`);
  allPassed = false;
}

// 2. 检查 .env.local
console.log('2️⃣  检查环境变量配置...');
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasSecret = envContent.includes('NEXTAUTH_SECRET=') && envContent.split('NEXTAUTH_SECRET=')[1].split('\n')[0].length > 10;
  const hasDbUrl = envContent.includes('DATABASE_URL=');
  
  if (hasSecret && hasDbUrl) {
    console.log('   ✅ 环境变量配置完整\n');
  } else {
    if (!hasSecret) {
      console.log('   ⚠️  缺少或无效的 NEXTAUTH_SECRET\n');
      allPassed = false;
    }
    if (!hasDbUrl) {
      console.log('   ⚠️  缺少 DATABASE_URL\n');
      allPassed = false;
    }
  }
} else {
  console.log('   ❌ .env.local 文件不存在\n');
  allPassed = false;
}

// 3. 检查依赖
console.log('3️⃣  检查项目依赖...');
const requiredPackages = [
  'next', 'react', 'react-dom', 'prisma', '@prisma/client',
  'next-auth', 'bcryptjs', 'recharts'
];
const missingPackages = [];

for (const pkg of requiredPackages) {
  try {
    require.resolve(pkg);
  } catch {
    missingPackages.push(pkg);
  }
}

if (missingPackages.length === 0) {
  console.log('   ✅ 所有依赖已安装\n');
} else {
  console.log(`   ❌ 缺少依赖: ${missingPackages.join(', ')}\n`);
  allPassed = false;
}

// 4. 检查 Prisma Schema
console.log('4️⃣  检查数据库配置...');
const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
if (fs.existsSync(schemaPath)) {
  console.log('   ✅ Prisma Schema 文件存在\n');
} else {
  console.log('   ❌ Prisma Schema 文件不存在\n');
  allPassed = false;
}

// 5. 总结
console.log('='.repeat(50));
if (allPassed) {
  console.log('✅ 所有验证通过！系统配置完成。\n');
  console.log('下一步:');
  console.log('  1. 运行数据库迁移: npx prisma db push');
  console.log('  2. 启动开发服务器: npm run dev');
  console.log('  3. 访问: http://localhost:3000');
} else {
  console.log('❌ 部分验证未通过，请根据上述提示修复问题。\n');
}
console.log('='.repeat(50));
