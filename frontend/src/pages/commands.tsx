import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronRight, Terminal, Search } from "lucide-react";

interface Command {
  label: string;
  cmd: string;
}

interface Language {
  name: string;
  icon: string;
  color: string;
  sections: { title: string; commands: Command[] }[];
}

const languages: Language[] = [
  {
    name: "Python",
    icon: "🐍",
    color: "#3776ab",
    sections: [
      { title: "Installation", commands: [
        { label: "Install Python (Ubuntu/Debian)", cmd: "apt install python3 python3-pip -y" },
        { label: "Install Python (CentOS/RHEL)", cmd: "yum install python3 python3-pip -y" },
        { label: "Install Python (macOS)", cmd: "brew install python3" },
        { label: "Check version", cmd: "python3 --version" },
      ]},
      { title: "Package Management (pip)", commands: [
        { label: "Install package", cmd: "pip install <package>" },
        { label: "Install from requirements.txt", cmd: "pip install -r requirements.txt" },
        { label: "List installed packages", cmd: "pip list" },
        { label: "Show package info", cmd: "pip show <package>" },
        { label: "Uninstall package", cmd: "pip uninstall <package>" },
        { label: "Freeze requirements", cmd: "pip freeze > requirements.txt" },
        { label: "Install pipenv", cmd: "pip install pipenv" },
        { label: "Create virtual environment", cmd: "python3 -m venv myenv" },
        { label: "Activate virtual environment", cmd: "source myenv/bin/activate" },
        { label: "Deactivate virtual environment", cmd: "deactivate" },
      ]},
      { title: "Running", commands: [
        { label: "Run Python script", cmd: "python3 script.py" },
        { label: "Run Python module", cmd: "python3 -m <module>" },
        { label: "Python interactive shell", cmd: "python3" },
        { label: "Run with arguments", cmd: "python3 script.py arg1 arg2" },
        { label: "Run with virtual env", cmd: "pipenv run python script.py" },
      ]},
      { title: "Django", commands: [
        { label: "Install Django", cmd: "pip install django" },
        { label: "Create project", cmd: "django-admin startproject myproject" },
        { label: "Create app", cmd: "python3 manage.py startapp myapp" },
        { label: "Run server", cmd: "python3 manage.py runserver" },
        { label: "Migrate", cmd: "python3 manage.py migrate" },
        { label: "Create superuser", cmd: "python3 manage.py createsuperuser" },
      ]},
      { title: "Flask", commands: [
        { label: "Install Flask", cmd: "pip install flask" },
        { label: "Run Flask app", cmd: "flask run" },
        { label: "Run with debug", cmd: "FLASK_APP=app.py flask run --debug" },
      ]},
    ],
  },
  {
    name: "Node.js",
    icon: "🟢",
    color: "#339933",
    sections: [
      { title: "Installation", commands: [
        { label: "Install Node.js (Ubuntu/Debian)", cmd: "apt install nodejs npm -y" },
        { label: "Install via NVM", cmd: "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash" },
        { label: "Install latest LTS", cmd: "nvm install --lts" },
        { label: "Check version", cmd: "node --version" },
        { label: "Check npm version", cmd: "npm --version" },
      ]},
      { title: "Package Management (npm)", commands: [
        { label: "Initialize project", cmd: "npm init -y" },
        { label: "Install package", cmd: "npm install <package>" },
        { label: "Install dev dependency", cmd: "npm install --save-dev <package>" },
        { label: "Install globally", cmd: "npm install -g <package>" },
        { label: "Uninstall package", cmd: "npm uninstall <package>" },
        { label: "Update package", cmd: "npm update <package>" },
        { label: "List packages", cmd: "npm list" },
        { label: "Run script", cmd: "npm run <script>" },
        { label: "Audit packages", cmd: "npm audit" },
        { label: "Fix vulnerabilities", cmd: "npm audit fix" },
      ]},
      { title: "Package Management (yarn)", commands: [
        { label: "Install Yarn", cmd: "npm install -g yarn" },
        { label: "Initialize", cmd: "yarn init -y" },
        { label: "Add package", cmd: "yarn add <package>" },
        { label: "Add dev dependency", cmd: "yarn add --dev <package>" },
        { label: "Remove package", cmd: "yarn remove <package>" },
      ]},
      { title: "Running", commands: [
        { label: "Run JS file", cmd: "node app.js" },
        { label: "Run with arguments", cmd: "node app.js arg1 arg2" },
        { label: "Node REPL", cmd: "node" },
        { label: "Run TypeScript", cmd: "npx tsx app.ts" },
        { label: "Watch mode", cmd: "node --watch app.js" },
      ]},
      { title: "Express.js", commands: [
        { label: "Install Express", cmd: "npm install express" },
        { label: "Install with helpers", cmd: "npm install express cors dotenv" },
        { label: "Run with nodemon", cmd: "npx nodemon app.js" },
      ]},
      { title: "Next.js", commands: [
        { label: "Create Next.js app", cmd: "npx create-next-app@latest myapp" },
        { label: "Run dev server", cmd: "npm run dev" },
        { label: "Build for production", cmd: "npm run build" },
        { label: "Start production", cmd: "npm start" },
      ]},
    ],
  },
  {
    name: "PHP",
    icon: "🐘",
    color: "#777bb4",
    sections: [
      { title: "Installation", commands: [
        { label: "Install PHP (Ubuntu/Debian)", cmd: "apt install php php-cli php-mbstring php-xml php-curl -y" },
        { label: "Install PHP (CentOS/RHEL)", cmd: "yum install php php-cli php-mbstring php-xml php-curl -y" },
        { label: "Install PHP (macOS)", cmd: "brew install php" },
        { label: "Check version", cmd: "php --version" },
      ]},
      { title: "Package Management (Composer)", commands: [
        { label: "Install Composer", cmd: "curl -sS https://getcomposer.org/installer | php" },
        { label: "Move to global path", cmd: "sudo mv composer.phar /usr/local/bin/composer" },
        { label: "Init project", cmd: "composer init" },
        { label: "Install package", cmd: "composer require <vendor/package>" },
        { label: "Install dev dependencies", cmd: "composer install" },
        { label: "Update packages", cmd: "composer update" },
        { label: "Dump autoload", cmd: "composer dump-autoload" },
        { label: "Remove package", cmd: "composer remove <vendor/package>" },
      ]},
      { title: "Running", commands: [
        { label: "Run PHP script", cmd: "php script.php" },
        { label: "Built-in server", cmd: "php -S localhost:8000" },
        { label: "Interactive shell", cmd: "php -a" },
        { label: "Lint / Syntax check", cmd: "php -l script.php" },
        { label: "List loaded modules", cmd: "php -m" },
        { label: "PHP info", cmd: "php -i | grep keyword" },
        { label: "Run artisan (Laravel)", cmd: "php artisan serve" },
        { label: "Run with arguments", cmd: "php script.php arg1 arg2" },
      ]},
      { title: "Configuration", commands: [
        { label: "Find php.ini path", cmd: "php --ini" },
        { label: "Check loaded config file", cmd: "php -i | grep 'Loaded Configuration'" },
        { label: "Test config", cmd: "php -i | grep -i 'configure command'" },
      ]},
      { title: "Laravel", commands: [
        { label: "Install Laravel", cmd: "composer create-project laravel/laravel myapp" },
        { label: "Run server", cmd: "php artisan serve" },
        { label: "Create controller", cmd: "php artisan make:controller MyController" },
        { label: "Create model", cmd: "php artisan make:model MyModel" },
        { label: "Create migration", cmd: "php artisan make:migration create_table" },
        { label: "Run migrations", cmd: "php artisan migrate" },
        { label: "Create seed", cmd: "php artisan make:seeder MySeeder" },
        { label: "List all routes", cmd: "php artisan route:list" },
        { label: "Clear cache", cmd: "php artisan cache:clear" },
        { label: "Cache config", cmd: "php artisan config:cache" },
        { label: "Run queue worker", cmd: "php artisan queue:work" },
        { label: "Create storage link", cmd: "php artisan storage:link" },
        { label: "Generate app key", cmd: "php artisan key:generate" },
        { label: "Interactive tinker", cmd: "php artisan tinker" },
      ]},
    ],
  },
  {
    name: "Java",
    icon: "☕",
    color: "#f89820",
    sections: [
      { title: "Installation", commands: [
        { label: "Install JDK (Ubuntu/Debian)", cmd: "apt install default-jdk -y" },
        { label: "Install OpenJDK 17", cmd: "apt install openjdk-17-jdk -y" },
        { label: "Check version", cmd: "java --version" },
        { label: "Check javac version", cmd: "javac --version" },
      ]},
      { title: "Running", commands: [
        { label: "Compile Java file", cmd: "javac Main.java" },
        { label: "Run Java class", cmd: "java Main" },
        { label: "Run with classpath", cmd: "java -cp /path/to/classes Main" },
        { label: "Run JAR file", cmd: "java -jar app.jar" },
      ]},
      { title: "Maven", commands: [
        { label: "Install Maven", cmd: "sudo apt install maven -y" },
        { label: "Create project", cmd: "mvn archetype:generate" },
        { label: "Build project", cmd: "mvn clean package" },
        { label: "Run tests", cmd: "mvn test" },
        { label: "Install dependencies", cmd: "mvn install" },
      ]},
      { title: "Gradle", commands: [
        { label: "Install Gradle", cmd: "sudo apt install gradle -y" },
        { label: "Build project", cmd: "gradle build" },
        { label: "Run project", cmd: "gradle run" },
        { label: "Clean build", cmd: "gradle clean build" },
      ]},
    ],
  },
  {
    name: "Go",
    icon: "🔵",
    color: "#00add8",
    sections: [
      { title: "Installation", commands: [
        { label: "Install Go (Ubuntu)", cmd: "apt install golang-go -y" },
        { label: "Install Go (latest)", cmd: "wget https://go.dev/dl/go1.22.0.linux-amd64.tar.gz && sudo tar -C /usr/local -xzf go1.22.0.linux-amd64.tar.gz" },
        { label: "Set PATH", cmd: 'export PATH=$PATH:/usr/local/go/bin' },
        { label: "Check version", cmd: "go version" },
      ]},
      { title: "Module Management", commands: [
        { label: "Init module", cmd: "go mod init myproject" },
        { label: "Download dependencies", cmd: "go mod download" },
        { label: "Tidy modules", cmd: "go mod tidy" },
        { label: "Add package", cmd: "go get <package>" },
        { label: "Show module graph", cmd: "go mod graph" },
      ]},
      { title: "Running & Building", commands: [
        { label: "Run Go file", cmd: "go run main.go" },
        { label: "Build binary", cmd: "go build -o myapp" },
        { label: "Build for current OS", cmd: "go build" },
        { label: "Cross-compile for Windows", cmd: "GOOS=windows GOARCH=amd64 go build -o myapp.exe" },
        { label: "Cross-compile for Linux", cmd: "GOOS=linux GOARCH=amd64 go build -o myapp" },
        { label: "Run tests", cmd: "go test ./..." },
        { label: "Run with verbose", cmd: "go run main.go -v" },
      ]},
    ],
  },
  {
    name: "Rust",
    icon: "🦀",
    color: "#dea584",
    sections: [
      { title: "Installation", commands: [
        { label: "Install Rust (via rustup)", cmd: "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh" },
        { label: "Update Rust", cmd: "rustup update" },
        { label: "Check version", cmd: "rustc --version" },
        { label: "Check cargo version", cmd: "cargo --version" },
      ]},
      { title: "Package Management (Cargo)", commands: [
        { label: "Create new project", cmd: "cargo new myproject" },
        { label: "Build project", cmd: "cargo build" },
        { label: "Build release", cmd: "cargo build --release" },
        { label: "Run project", cmd: "cargo run" },
        { label: "Run tests", cmd: "cargo test" },
        { label: "Add dependency", cmd: "cargo add <package>" },
        { label: "Check code", cmd: "cargo check" },
        { label: "Format code", cmd: "cargo fmt" },
        { label: "Lint code", cmd: "cargo clippy" },
      ]},
    ],
  },
  {
    name: "C#",
    icon: "🟣",
    color: "#239120",
    sections: [
      { title: "Installation", commands: [
        { label: "Install .NET SDK", cmd: "apt install dotnet-sdk-8.0 -y" },
        { label: "Check version", cmd: "dotnet --version" },
      ]},
      { title: "Project Management", commands: [
        { label: "Create console app", cmd: "dotnet new console -n myapp" },
        { label: "Create web API", cmd: "dotnet new webapi -n myapi" },
        { label: "Create MVC app", cmd: "dotnet new mvc -n myweb" },
        { label: "Restore packages", cmd: "dotnet restore" },
        { label: "Build project", cmd: "dotnet build" },
        { label: "Run project", cmd: "dotnet run" },
        { label: "Publish", cmd: "dotnet publish -c Release" },
      ]},
    ],
  },
  {
    name: "Ruby",
    icon: "💎",
    color: "#cc342d",
    sections: [
      { title: "Installation", commands: [
        { label: "Install Ruby (Ubuntu)", cmd: "apt install ruby-full -y" },
        { label: "Install via rbenv", cmd: "rbenv install 3.2.2" },
        { label: "Check version", cmd: "ruby --version" },
      ]},
      { title: "Package Management (Gem)", commands: [
        { label: "Install gem", cmd: "gem install <package>" },
        { label: "List gems", cmd: "gem list" },
        { label: "Update gems", cmd: "gem update" },
        { label: "Uninstall gem", cmd: "gem uninstall <package>" },
      ]},
      { title: "Rails", commands: [
        { label: "Install Rails", cmd: "gem install rails" },
        { label: "Create app", cmd: "rails new myapp" },
        { label: "Run server", cmd: "rails server" },
        { label: "Generate scaffold", cmd: "rails generate scaffold Post title:string body:text" },
        { label: "Run migrations", cmd: "rails db:migrate" },
        { label: "Open console", cmd: "rails console" },
      ]},
    ],
  },
  {
    name: "Docker",
    icon: "🐳",
    color: "#2496ed",
    sections: [
      { title: "Installation", commands: [
        { label: "Install Docker (Ubuntu)", cmd: "apt install docker.io docker-compose -y" },
        { label: "Start Docker", cmd: "systemctl start docker" },
        { label: "Enable Docker", cmd: "systemctl enable docker" },
        { label: "Add user to docker group", cmd: "usermod -aG docker $USER" },
        { label: "Check version", cmd: "docker --version" },
      ]},
      { title: "Images", commands: [
        { label: "Pull image", cmd: "docker pull <image>" },
        { label: "List images", cmd: "docker images" },
        { label: "Remove image", cmd: "docker rmi <image>" },
        { label: "Build image", cmd: "docker build -t myimage ." },
        { label: "Tag image", cmd: "docker tag myimage myrepo/myimage:latest" },
        { label: "Push image", cmd: "docker push myrepo/myimage:latest" },
      ]},
      { title: "Containers", commands: [
        { label: "Run container", cmd: "docker run <image>" },
        { label: "Run in background", cmd: "docker run -d <image>" },
        { label: "Run with port mapping", cmd: "docker run -p 8080:80 <image>" },
        { label: "Run with name", cmd: "docker run --name mycontainer <image>" },
        { label: "Run interactively", cmd: "docker run -it <image> /bin/bash" },
        { label: "List running", cmd: "docker ps" },
        { label: "List all", cmd: "docker ps -a" },
        { label: "Stop container", cmd: "docker stop <container>" },
        { label: "Start container", cmd: "docker start <container>" },
        { label: "Remove container", cmd: "docker rm <container>" },
        { label: "View logs", cmd: "docker logs <container>" },
        { label: "Execute command", cmd: "docker exec -it <container> /bin/bash" },
      ]},
      { title: "Docker Compose", commands: [
        { label: "Start services", cmd: "docker-compose up -d" },
        { label: "Stop services", cmd: "docker-compose down" },
        { label: "View logs", cmd: "docker-compose logs" },
        { label: "Build services", cmd: "docker-compose build" },
        { label: "List services", cmd: "docker-compose ps" },
      ]},
    ],
  },
  {
    name: "Git",
    icon: "🔀",
    color: "#f05032",
    sections: [
      { title: "Setup", commands: [
        { label: "Set name", cmd: 'git config --global user.name "Your Name"' },
        { label: "Set email", cmd: 'git config --global user.email "your@email.com"' },
        { label: "Check config", cmd: "git config --list" },
      ]},
      { title: "Basic Commands", commands: [
        { label: "Init repo", cmd: "git init" },
        { label: "Clone repo", cmd: "git clone <url>" },
        { label: "Check status", cmd: "git status" },
        { label: "Add all files", cmd: "git add ." },
        { label: "Add specific file", cmd: "git add <file>" },
        { label: "Commit", cmd: 'git commit -m "message"' },
        { label: "Push", cmd: "git push origin main" },
        { label: "Pull", cmd: "git pull origin main" },
      ]},
      { title: "Branches", commands: [
        { label: "List branches", cmd: "git branch" },
        { label: "Create branch", cmd: "git branch <branch>" },
        { label: "Switch branch", cmd: "git checkout <branch>" },
        { label: "Create & switch", cmd: "git checkout -b <branch>" },
        { label: "Merge branch", cmd: "git merge <branch>" },
        { label: "Delete branch", cmd: "git branch -d <branch>" },
      ]},
      { title: "Clone & Run Project", commands: [
        { label: "Clone + npm install + start", cmd: "git clone <url> && cd <repo> && npm install && npm start" },
        { label: "Clone + pip install + run", cmd: "git clone <url> && cd <repo> && pip install -r requirements.txt && python3 main.py" },
        { label: "Clone + composer + php serve", cmd: "git clone <url> && cd <repo> && composer install && php -S 0.0.0.0:8000" },
        { label: "Clone + go mod + run", cmd: "git clone <url> && cd <repo> && go mod tidy && go run main.go" },
        { label: "Clone + bundle + rails", cmd: "git clone <url> && cd <repo> && bundle install && rails server" },
        { label: "Clone + cargo + run (Rust)", cmd: "git clone <url> && cd <repo> && cargo build && cargo run" },
        { label: "Clone + mvn + run (Java)", cmd: "git clone <url> && cd <repo> && mvn clean package && java -jar target/*.jar" },
        { label: "Clone specific branch", cmd: "git clone -b branch-name <url> && cd <repo>" },
        { label: "Shallow clone (fast)", cmd: "git clone --depth 1 <url> && cd <repo>" },
        { label: "Clone + detect + run", cmd: "git clone <url> && cd <repo> && (ls package.json && npm start || ls requirements.txt && python3 main.py || ls composer.json && php -S 0.0.0.0:8000)" },
      ]},
      { title: "Advanced", commands: [
        { label: "Stash changes", cmd: "git stash" },
        { label: "Apply stash", cmd: "git stash pop" },
        { label: "View log", cmd: "git log --oneline" },
        { label: "View diff", cmd: "git diff" },
        { label: "Reset commit", cmd: "git reset --soft HEAD~1" },
        { label: "Hard reset", cmd: "git reset --hard HEAD~1" },
        { label: "Revert commit", cmd: "git revert <commit-hash>" },
        { label: "Tag release", cmd: 'git tag -a v1.0 -m "Release 1.0"' },
      ]},
    ],
  },
  {
    name: "Linux",
    icon: "🐧",
    color: "#fcc624",
    sections: [
      { title: "File Operations", commands: [
        { label: "List files", cmd: "ls -la" },
        { label: "Change directory", cmd: "cd /path/to/dir" },
        { label: "Print working dir", cmd: "pwd" },
        { label: "Copy file", cmd: "cp source dest" },
        { label: "Move/rename", cmd: "mv source dest" },
        { label: "Remove file", cmd: "rm file" },
        { label: "Remove directory", cmd: "rm -rf directory" },
        { label: "Create directory", cmd: "mkdir -p directory" },
        { label: "Touch file", cmd: "touch file" },
        { label: "View file", cmd: "cat file" },
        { label: "Head of file", cmd: "head -n 20 file" },
        { label: "Tail of file", cmd: "tail -n 20 file" },
        { label: "Edit with nano", cmd: "nano file" },
        { label: "Edit with vim", cmd: "vim file" },
      ]},
      { title: "Permissions", commands: [
        { label: "Make executable", cmd: "chmod +x script.sh" },
        { label: "Change owner", cmd: "chown user:group file" },
        { label: "Change permissions", cmd: "chmod 755 file" },
        { label: "Recursive chmod", cmd: "chmod -R 755 directory" },
      ]},
      { title: "Process Management", commands: [
        { label: "List processes", cmd: "ps aux" },
        { label: "Find process", cmd: "ps aux | grep <name>" },
        { label: "Kill process", cmd: "kill <pid>" },
        { label: "Force kill", cmd: "kill -9 <pid>" },
        { label: "Run in background", cmd: "command &" },
        { label: "Background jobs", cmd: "jobs" },
        { label: "Bring to foreground", cmd: "fg %1" },
      ]},
      { title: "System Info", commands: [
        { label: "Disk usage", cmd: "df -h" },
        { label: "Directory size", cmd: "du -sh directory" },
        { label: "Memory info", cmd: "free -h" },
        { label: "CPU info", cmd: "lscpu" },
        { label: "Uptime", cmd: "uptime" },
        { label: "Hostname", cmd: "hostname" },
        { label: "OS info", cmd: "uname -a" },
      ]},
      { title: "Network", commands: [
        { label: "IP address", cmd: "ip addr" },
        { label: "Ping", cmd: "ping google.com" },
        { label: "Download file", cmd: "wget <url>" },
        { label: "Download (curl)", cmd: "curl -O <url>" },
        { label: "Check ports", cmd: "netstat -tlnp" },
        { label: "SS ports", cmd: "ss -tlnp" },
        { label: "Traceroute", cmd: "traceroute google.com" },
        { label: "DNS lookup", cmd: "nslookup google.com" },
      ]},
      { title: "Package Management (apt)", commands: [
        { label: "Update packages", cmd: "apt update" },
        { label: "Upgrade packages", cmd: "apt upgrade -y" },
        { label: "Install package", cmd: "apt install <package> -y" },
        { label: "Remove package", cmd: "apt remove <package> -y" },
        { label: "Search package", cmd: "apt search <keyword>" },
        { label: "Show package info", cmd: "apt show <package>" },
        { label: "List installed", cmd: "apt list --installed" },
        { label: "Autoremove", cmd: "apt autoremove -y" },
      ]},
    ],
  },
  {
    name: "Nano",
    icon: "📝",
    color: "#22c55e",
    sections: [
      { title: "Basic Usage", commands: [
        { label: "Open/Create file", cmd: "nano file.txt" },
        { label: "Open with line number", cmd: "nano +5 file.txt" },
        { label: "Save file", cmd: "Ctrl+O" },
        { label: "Exit nano", cmd: "Ctrl+X" },
        { label: "Cut line", cmd: "Ctrl+K" },
        { label: "Paste line", cmd: "Ctrl+U" },
        { label: "Search text", cmd: "Ctrl+W" },
        { label: "Search and replace", cmd: "Ctrl+\\" },
        { label: "Go to line", cmd: "Ctrl+_" },
        { label: "Show line numbers", cmd: "Alt+#" },
        { label: "Undo", cmd: "Alt+U" },
        { label: "Redo", cmd: "Alt+E" },
        { label: "Enable syntax highlight", cmd: "nano -Y python file.py" },
        { label: "Soft wrap", cmd: "nano --softwrap file.txt" },
      ]},
    ],
  },
  {
    name: "LocalTunnel",
    icon: "🌐",
    color: "#8b5cf6",
    sections: [
      { title: "Tunnel Commands", commands: [
        { label: "Create tunnel (port 8000)", cmd: "npx localtunnel --port 8000" },
        { label: "Create tunnel (specific port)", cmd: "npx localtunnel --port 3000" },
        { label: "Tunnel with custom subdomain", cmd: "npx localtunnel --port 8000 --subdomain myapp" },
        { label: "Tunnel with local host", cmd: "npx localtunnel --port 8000 --local-host localhost" },
        { label: "Install globally", cmd: "npm install -g localtunnel" },
        { label: "Tunnel with region", cmd: "npx localtunnel --port 8000 --region eu" },
      ]},
    ],
  },
  {
    name: "PM2",
    icon: "⚡",
    color: "#2b2b2b",
    sections: [
      { title: "Process Management", commands: [
        { label: "Start app", cmd: "pm2 start app.js" },
        { label: "Start with name", cmd: "pm2 start app.js --name myapp" },
        { label: "Start with cluster mode", cmd: "pm2 start app.js -i max" },
        { label: "List processes", cmd: "pm2 list" },
        { label: "Stop process", cmd: "pm2 stop myapp" },
        { label: "Restart process", cmd: "pm2 restart myapp" },
        { label: "Delete process", cmd: "pm2 delete myapp" },
        { label: "Show process info", cmd: "pm2 show myapp" },
        { label: "View logs", cmd: "pm2 logs" },
        { label: "View logs for app", cmd: "pm2 logs myapp" },
        { label: "Monitor dashboard", cmd: "pm2 monit" },
        { label: "Save process list", cmd: "pm2 save" },
        { label: "Startup script", cmd: "pm2 startup" },
        { label: "Reload all", cmd: "pm2 reload all" },
        { label: "Kill PM2 daemon", cmd: "pm2 kill" },
      ]},
    ],
  },
  {
    name: "Nginx",
    icon: "🌍",
    color: "#009639",
    sections: [
      { title: "Service Management", commands: [
        { label: "Start Nginx", cmd: "systemctl start nginx" },
        { label: "Stop Nginx", cmd: "systemctl stop nginx" },
        { label: "Restart Nginx", cmd: "systemctl restart nginx" },
        { label: "Reload config", cmd: "systemctl reload nginx" },
        { label: "Enable on boot", cmd: "systemctl enable nginx" },
        { label: "Check status", cmd: "systemctl status nginx" },
        { label: "Test config", cmd: "nginx -t" },
      ]},
      { title: "Site Management", commands: [
        { label: "List sites", cmd: "ls /etc/nginx/sites-available/" },
        { label: "Enable site", cmd: "ln -s /etc/nginx/sites-available/example.com /etc/nginx/sites-enabled/" },
        { label: "Disable site", cmd: "rm /etc/nginx/sites-enabled/example.com" },
        { label: "Create site config", cmd: "nano /etc/nginx/sites-available/example.com" },
      ]},
      { title: "SSL / Certbot", commands: [
        { label: "Install Certbot", cmd: "apt install certbot python3-certbot-nginx -y" },
        { label: "Get SSL cert", cmd: "certbot --nginx -d example.com" },
        { label: "Renew certs", cmd: "certbot renew" },
        { label: "Dry-run renew", cmd: "certbot renew --dry-run" },
        { label: "Check cert expiry", cmd: "openssl x509 -enddate -noout -in /etc/letsencrypt/live/example.com/fullchain.pem" },
      ]},
    ],
  },
  {
    name: "Bots",
    icon: "🤖",
    color: "#5865f2",
    sections: [
      { title: "Telegram Bots", commands: [
        { label: "Install python-telegram-bot", cmd: "pip install python-telegram-bot" },
        { label: "Install aiogram", cmd: "pip install aiogram" },
        { label: "Install telebot", cmd: "pip install pyTelegramBotAPI" },
        { label: "Start bot (python)", cmd: "python3 bot.py" },
        { label: "Run bot with nohup", cmd: "nohup python3 bot.py > bot.log 2>&1 &" },
        { label: "Run bot with PM2", cmd: "pm2 start bot.py --interpreter python3 --name telegram-bot" },
        { label: "Set webhook", cmd: "curl -F \"url=https://yourdomain.com/webhook\" https://api.telegram.org/bot<TOKEN>/setWebhook" },
        { label: "Delete webhook", cmd: "curl https://api.telegram.org/bot<TOKEN>/deleteWebhook" },
        { label: "Get webhook info", cmd: "curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo" },
        { label: "Get bot info", cmd: "curl https://api.telegram.org/bot<TOKEN>/getMe" },
        { label: "Send message via API", cmd: "curl -X POST https://api.telegram.org/bot<TOKEN>/sendMessage -d \"chat_id=CHAT_ID&text=Hello\"" },
        { label: "Bot with node-telegram-bot-api", cmd: "npm install node-telegram-bot-api" },
        { label: "Telegraf (Node.js)", cmd: "npm install telegraf" },
      ]},
      { title: "Discord Bots", commands: [
        { label: "Install discord.py", cmd: "pip install discord.py" },
        { label: "Install discord.js", cmd: "npm install discord.js" },
        { label: "Start bot (Node.js)", cmd: "node bot.js" },
        { label: "Run with PM2", cmd: "pm2 start bot.js --name discord-bot" },
        { label: "Deploy slash commands", cmd: "node deploy-commands.js" },
      ]},
      { title: "WhatsApp Bots", commands: [
        { label: "Install whatsapp-web.js", cmd: "npm install whatsapp-web.js" },
        { label: "Install baileys", cmd: "npm install @whiskeysockets/baileys" },
        { label: "Install venom", cmd: "npm install venom-bot" },
        { label: "Start WhatsApp bot", cmd: "node whatsapp-bot.js" },
      ]},
    ],
  },
  {
    name: "Web Dev",
    icon: "🕸️",
    color: "#e34f26",
    sections: [
      { title: "Build Tools", commands: [
        { label: "Install Vite", cmd: "npm create vite@latest myapp" },
        { label: "Install Webpack", cmd: "npm install --save-dev webpack webpack-cli" },
        { label: "Install Parcel", cmd: "npm install --save-dev parcel" },
        { label: "Build with Vite", cmd: "npm run build" },
        { label: "Build for production", cmd: "NODE_ENV=production npm run build" },
      ]},
      { title: "Deployment", commands: [
        { label: "Build & Serve", cmd: "npm run build && npx serve dist" },
        { label: "Deploy to Netlify CLI", cmd: "npx netlify deploy --prod" },
        { label: "Deploy to Vercel", cmd: "npx vercel --prod" },
        { label: "GitHub Pages deploy", cmd: "npm run build && npx gh-pages -d dist" },
        { label: "Rsync to server", cmd: "rsync -avz dist/ user@server:/var/www/html/" },
        { label: "SCP to server", cmd: "scp -r dist/* user@server:/var/www/html/" },
      ]},
      { title: "Database", commands: [
        { label: "Connect MongoDB", cmd: "mongosh mongodb://localhost:27017" },
        { label: "Dump MongoDB", cmd: "mongodump --db mydb --out ./backup" },
        { label: "Restore MongoDB", cmd: "mongorestore --db mydb ./backup/mydb" },
        { label: "MySQL dump", cmd: "mysqldump -u root -p mydb > backup.sql" },
        { label: "MySQL restore", cmd: "mysql -u root -p mydb < backup.sql" },
        { label: "PostgreSQL dump", cmd: "pg_dump mydb > backup.sql" },
        { label: "PostgreSQL restore", cmd: "psql mydb < backup.sql" },
        { label: "SQLite dump", cmd: "sqlite3 database.db .dump > backup.sql" },
        { label: "Redis CLI", cmd: "redis-cli" },
        { label: "Redis flush all", cmd: "redis-cli FLUSHALL" },
      ]},
      { title: "cURL / HTTP", commands: [
        { label: "GET request", cmd: "curl https://api.example.com" },
        { label: "POST JSON", cmd: "curl -X POST -H \"Content-Type: application/json\" -d '{\"key\":\"value\"}' https://api.example.com" },
        { label: "POST form data", cmd: "curl -X POST -d \"key=value\" https://api.example.com" },
        { label: "With Bearer token", cmd: "curl -H \"Authorization: Bearer TOKEN\" https://api.example.com" },
        { label: "Download file", cmd: "curl -O https://example.com/file.zip" },
        { label: "Follow redirects", cmd: "curl -L https://bit.ly/short" },
        { label: "Show response headers", cmd: "curl -I https://example.com" },
        { label: "Verbose output", cmd: "curl -v https://example.com" },
        { label: "Install httpie", cmd: "pip install httpie" },
        { label: "HTTPie GET", cmd: "http https://api.example.com" },
        { label: "HTTPie POST", cmd: "http POST https://api.example.com key=value" },
      ]},
      { title: "Archives", commands: [
        { label: "Create tar.gz", cmd: "tar -czvf archive.tar.gz /path/to/dir" },
        { label: "Extract tar.gz", cmd: "tar -xzvf archive.tar.gz" },
        { label: "Create zip", cmd: "zip -r archive.zip /path/to/dir" },
        { label: "Extract zip", cmd: "unzip archive.zip" },
        { label: "Extract tar.xz", cmd: "tar -xJvf archive.tar.xz" },
        { label: "List archive contents", cmd: "tar -tzvf archive.tar.gz" },
        { label: "Extract tar.bz2", cmd: "tar -xjvf archive.tar.bz2" },
        { label: "7z archive", cmd: "7z a archive.7z /path/to/dir" },
        { label: "7z extract", cmd: "7z x archive.7z" },
      ]},
      { title: "Screen / Tmux", commands: [
        { label: "Start screen session", cmd: "screen -S mysession" },
        { label: "List screen sessions", cmd: "screen -ls" },
        { label: "Attach to screen", cmd: "screen -r mysession" },
        { label: "Detach from screen", cmd: "Ctrl+A, D" },
        { label: "Kill screen session", cmd: "screen -X -S mysession quit" },
        { label: "Start tmux session", cmd: "tmux new -s mysession" },
        { label: "List tmux sessions", cmd: "tmux ls" },
        { label: "Attach tmux", cmd: "tmux attach -t mysession" },
        { label: "Detach tmux", cmd: "Ctrl+B, D" },
        { label: "Kill tmux session", cmd: "tmux kill-session -t mysession" },
      ]},
    ],
  },
];

export default function CommandsPage() {
  const [expandedLang, setExpandedLang] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<Record<string, boolean>>({});
  const [copiedIdx, setCopiedIdx] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const toggleLang = (name: string) => {
    setExpandedLang(expandedLang === name ? null : name);
    setExpandedSection({});
  };

  const toggleSection = (key: string) => {
    setExpandedSection((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const copyCmd = async (cmd: string, idx: string) => {
    await navigator.clipboard.writeText(cmd);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const filtered = languages.filter(
    (l) => l.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6d28d9,#a855f7)", boxShadow: "0 0 20px rgba(139,92,246,0.3)" }}>
            <Terminal className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Commands</h1>
            <p className="text-zinc-400 text-sm">Quick reference for all languages</p>
          </div>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search languages..."
          className="w-full h-10 pl-10 pr-4 rounded-xl text-white text-sm bg-[#140a24] border border-[rgba(139,92,246,0.3)] focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((lang) => {
          const isOpen = expandedLang === lang.name;
          return (
            <div key={lang.name} className="rounded-xl border overflow-hidden transition-all" style={{ background: "#140a24", borderColor: isOpen ? `${lang.color}60` : "rgba(139,92,246,0.15)" }}>
              <button
                onClick={() => toggleLang(lang.name)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/3 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.icon}</span>
                  <span className="font-semibold text-white">{lang.name}</span>
                  <span className="text-[10px] text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full">{lang.sections.length} sections</span>
                </div>
                {isOpen ? <ChevronDown className="w-5 h-5 text-zinc-400" /> : <ChevronRight className="w-5 h-5 text-zinc-400" />}
              </button>

              {isOpen && (
                <div className="px-5 pb-4 space-y-3">
                  {lang.sections.map((section) => {
                    const sKey = `${lang.name}-${section.title}`;
                    const sOpen = expandedSection[sKey] !== false;
                    return (
                      <div key={sKey} className="rounded-lg border overflow-hidden" style={{ borderColor: `${lang.color}30` }}>
                        <button
                          onClick={() => toggleSection(sKey)}
                          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/3 transition-colors cursor-pointer"
                        >
                          <span className="text-sm font-medium" style={{ color: lang.color }}>{section.title}</span>
                          <span className="text-[10px] text-zinc-500">{section.commands.length} commands</span>
                        </button>
                        {sOpen && (
                          <div className="px-4 pb-3 space-y-1">
                            {section.commands.map((cmd, i) => {
                              const idx = `${sKey}-${i}`;
                              return (
                                <div key={idx} className="flex items-center justify-between gap-2 py-1.5 px-3 rounded-lg hover:bg-white/5 group">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[11px] text-zinc-500">{cmd.label}</p>
                                    <p className="text-xs text-zinc-300 font-mono truncate">{cmd.cmd}</p>
                                  </div>
                                  <button
                                    onClick={() => copyCmd(cmd.cmd, idx)}
                                    className="shrink-0 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all cursor-pointer"
                                    title="Copy"
                                  >
                                    {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
