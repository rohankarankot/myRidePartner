const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, '../apps/api-gateway/src'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('../prisma.service') || content.includes('../prisma.module')) {
    content = content.replace(/import\s+{\s*PrismaService\s*}\s+from\s+'\.\.\/prisma\.service';/g, "import { PrismaService } from '@app/common';");
    content = content.replace(/import\s+{\s*PrismaModule\s*}\s+from\s+'\.\.\/prisma\.module';/g, "import { PrismaModule } from '@app/common';");
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}
