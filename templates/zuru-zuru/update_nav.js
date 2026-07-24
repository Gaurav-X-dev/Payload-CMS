const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\Dell\\Desktop\\Websites\\zuru zuru';
const htmlFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const oldDropdownRegex = /<ul class="nav-dropdown">[\s\S]*?<\/ul>/;
const newDropdown = `<ul class="nav-dropdown">
            <li><a href="menu.html?location=delhi">Delhi Menu</a></li>
            <li><a href="menu.html?location=gurugram">Gurugram Menu</a></li>
          </ul>`;

htmlFiles.forEach(file => {
    let fp = path.join(dir, file);
    let content = fs.readFileSync(fp, 'utf8');
    
    // Replace dropdown in navbar
    if (oldDropdownRegex.test(content)) {
        content = content.replace(oldDropdownRegex, newDropdown);
        
        // Also update mobile menu if necessary. The mobile menu doesn't have a dropdown in the original code, but let's see.
        // It's just a flat list.
        
        fs.writeFileSync(fp, content);
        console.log('Updated nav dropdown in ' + file);
    }
});

// Update menu.html to read query parameter
const menuFile = path.join(dir, 'menu.html');
let menuContent = fs.readFileSync(menuFile, 'utf8');

const queryScript = `
    document.addEventListener("DOMContentLoaded", () => {
      const urlParams = new URLSearchParams(window.location.search);
      const loc = urlParams.get('location');
      if (loc === 'gurugram') {
         const rad = document.querySelector('input[value="gurugram"]');
         if (rad) {
            rad.checked = true;
            if(typeof toggleLocation === 'function') toggleLocation('gurugram');
         }
      } else if (loc === 'delhi') {
         const rad = document.querySelector('input[value="delhi"]');
         if (rad) {
            rad.checked = true;
            if(typeof toggleLocation === 'function') toggleLocation('delhi');
         }
      }
    });
`;

if (!menuContent.includes('const loc = urlParams.get(\'location\');')) {
    menuContent = menuContent.replace('</script>\n</body>', queryScript + '\n</script>\n</body>');
    fs.writeFileSync(menuFile, menuContent);
    console.log('Injected query param script into menu.html');
}
