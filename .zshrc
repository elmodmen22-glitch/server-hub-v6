export TERM=xterm-256color
export COLORTERM=truecolor
export LANG=C.UTF-8
export LC_ALL=C.UTF-8
export PYTHONUNBUFFERED=1
export PATH="/opt/venv/bin:$PATH"

# Zsh autosuggestions
if [ -f /usr/share/zsh-autosuggestions/zsh-autosuggestions.zsh ]; then
  source /usr/share/zsh-autosuggestions/zsh-autosuggestions.zsh
fi

# Zsh syntax highlighting
if [ -f /usr/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh ]; then
  source /usr/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
fi

# Shared history across all terminal sessions
HISTFILE=~/.shared_history
HISTSIZE=50000
SAVEHIST=50000
setopt INC_APPEND_HISTORY
setopt SHARE_HISTORY
setopt HIST_IGNORE_DUPS
setopt HIST_IGNORE_SPACE

# PROMPT - Kali Linux style
PROMPT='
%F{green}┌──(%F{white}runner%F{242}㉿%F{white}serverhub%F{green})-[%F{blue}%~%F{green}]
%F{green}└─%F{green}$ %f'
RPROMPT='%F{242}%*%f'

# Bash-like aliases
alias python='python3'
alias pip='pip3'
alias py='python3'
alias ll='ls -la'
alias la='ls -la'
alias l='ls -la'
alias cls='clear'
alias ..='cd ..'
alias ...='cd ../..'

# Auto apt update before install
alias apt='apt-get'
alias apt-update='apt-get update && apt-get upgrade -y'

# Auto-complete
autoload -Uz compinit && compinit
zstyle ':completion:*' menu select
zstyle ':completion:*' matcher-list 'm:{a-z}={A-Za-z}'
