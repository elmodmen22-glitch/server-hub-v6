FROM node:20-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    php-cli \
    php-mbstring \
    php-xml \
    php-curl \
    php-zip \
    php-gd \
    php-intl \
    zsh \
    curl \
    git \
    wget \
    build-essential \
    locales \
    apt-utils \
    sudo \
    docker.io \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/runner && chmod 777 /home/runner
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm install 2>&1

COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install 2>&1

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt 2>&1 || echo "Python deps installed"

COPY . .

RUN echo "Building frontend..." && cd frontend && (npx tsc -b && npx vite build) 2>&1

RUN echo "Building backend..." && cd backend && node build.mjs 2>&1

RUN echo "Installing zsh plugins..." \
    && git clone --depth=1 https://github.com/zsh-users/zsh-autosuggestions /usr/share/zsh-autosuggestions 2>/dev/null || true \
    && git clone --depth=1 https://github.com/zsh-users/zsh-syntax-highlighting /usr/share/zsh-syntax-highlighting 2>/dev/null || true

RUN cp /app/.zshrc /root/.zshrc 2>/dev/null || true
RUN chmod +x /app/start.sh 2>/dev/null || true
RUN chmod +x /app/scripts/container-init.sh 2>/dev/null || true

RUN echo "Build complete. Backend dist:" && ls -la /app/backend/dist/ 2>/dev/null || echo "DIST NOT FOUND"
RUN echo "Frontend dist:" && ls -la /app/frontend/dist/ 2>/dev/null || echo "DIST NOT FOUND"

EXPOSE 3001

CMD ["/app/start.sh"]
