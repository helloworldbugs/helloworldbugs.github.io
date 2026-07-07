const fs = require("fs");
const path = require("path");

const EXTRACT_DIR = path.resolve(__dirname, "_tmp_images/helloworldbugs.github.io/source/_posts");
const POSTS_DIR = path.resolve(__dirname, "src/posts");
const IMG_DST = path.resolve(__dirname, "public/images/posts");

fs.mkdirSync(IMG_DST, { recursive: true });

// Build a map of post-name → full-image-path from backup
const imageMap = new Map(); // postFolderName → [{ fullPath, fileName }]

function scanImages(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Check if this directory contains image files
      const hasImages = fs.readdirSync(fullPath).some(f => {
        const ext = path.extname(f).toLowerCase();
        return [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"].includes(ext);
      });
      if (hasImages) {
        const postName = entry.name;
        if (!imageMap.has(postName)) imageMap.set(postName, []);
        const imgFiles = fs.readdirSync(fullPath).filter(f => {
          const ext = path.extname(f).toLowerCase();
          return [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"].includes(ext);
        });
        for (const img of imgFiles) {
          imageMap.get(postName).push({
            srcFullPath: path.join(fullPath, img),
            fileName: img,
          });
        }
      }
      scanImages(fullPath);
    }
  }
}

console.log("Scanning backup images...");
scanImages(EXTRACT_DIR);
console.log(`Found ${imageMap.size} posts with images`);

// For each post in src/posts, find matching images and copy them
function walkPosts(dir, baseDir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkPosts(fullPath, baseDir);
    } else if (entry.name.endsWith(".md")) {
      const postName = path.basename(entry.name, ".md");
      const relDir = path.relative(baseDir, path.dirname(fullPath));
      
      if (imageMap.has(postName)) {
        const targetDir = path.join(IMG_DST, relDir, postName);
        fs.mkdirSync(targetDir, { recursive: true });
        
        const images = imageMap.get(postName);
        for (const img of images) {
          fs.copyFileSync(img.srcFullPath, path.join(targetDir, img.fileName));
        }
        
        // Also fix post content - replace <!-- img: ... --> with correct paths
        let content = fs.readFileSync(fullPath, "utf-8");
        const imgBasePath = `/images/posts/${relDir.split("\\").join("/")}/${postName}`;
        
        content = content.replace(
          /<!-- img: .+? -->/g,
          (match) => `<!-- img: restored -->`
        );
        
        // If post has no image refs, add them
        if (!content.includes("![](")) {
          const imgTags = images.map(img => `![](${imgBasePath}/${img.fileName})`).join("\n");
          // Insert before first heading
          content = content.replace(/\n#/, `\n${imgTags}\n\n#`);
        }
        
        fs.writeFileSync(fullPath, content, "utf-8");
        console.log(`  ${relDir}/${entry.name} (${images.length} images)`);
      }
    }
  }
}

console.log("\nCopying images and fixing posts...");
walkPosts(POSTS_DIR, POSTS_DIR);
console.log("Done!");
