#!/bin/bash

# grafana-k6-skill Installation Script
# Installs k6 skill for Claude, Copilot, and Gemini agents
# Version: 1.0.0

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_NAME="k6-core"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print functions
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

print_header() {
    echo ""
    echo "========================================"
    echo "$1"
    echo "========================================"
    echo ""
}

# Detect OS
detect_os() {
    case "$(uname -s)" in
        Darwin*)    OS='macOS';;
        Linux*)     OS='Linux';;
        MINGW*|MSYS*|CYGWIN*) OS='Windows';;
        *)          OS='Unknown';;
    esac
    print_info "Detected OS: $OS"
}

# Create directory if it doesn't exist
ensure_dir() {
    local dir=$1
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        print_success "Created directory: $dir"
    else
        print_info "Directory exists: $dir"
    fi
}

# Create symlink or copy
link_or_copy() {
    local source=$1
    local target=$2
    local name=$3
    
    # Remove existing symlink or directory
    if [ -L "$target" ] || [ -d "$target" ]; then
        rm -rf "$target"
        print_info "Removed existing: $target"
    fi
    
    # Create symlink (or copy on Windows)
    if [ "$OS" = "Windows" ]; then
        cp -r "$source" "$target"
        print_success "Copied $name to $target"
    else
        ln -s "$source" "$target"
        print_success "Linked $name to $target"
    fi
}

# Install for Claude
install_claude() {
    print_header "Installing for Claude"
    
    local claude_skills="$HOME/.claude/skills"
    local claude_plugins="$HOME/.claude/plugins"
    
    ensure_dir "$claude_skills"
    ensure_dir "$claude_plugins"
    
    # Link skills directory
    link_or_copy "$SCRIPT_DIR/skills/$SKILL_NAME" "$claude_skills/$SKILL_NAME" "k6-core skill"
    
    # Link plugin manifest
    link_or_copy "$SCRIPT_DIR/.claude-plugin" "$claude_plugins/grafana-k6-skill" "plugin manifest"
    
    print_success "Claude installation complete"
}

# Install for Copilot
install_copilot() {
    print_header "Installing for GitHub Copilot"
    
    local copilot_skills="$HOME/.copilot/skills"
    local copilot_agents="$HOME/.copilot/agents"
    
    ensure_dir "$copilot_skills"
    ensure_dir "$copilot_agents"
    
    # Link skills directory
    link_or_copy "$SCRIPT_DIR/skills/$SKILL_NAME" "$copilot_skills/$SKILL_NAME" "k6-core skill"
    
    # Link plugin manifest (Copilot may use different location)
    link_or_copy "$SCRIPT_DIR/.claude-plugin" "$copilot_agents/grafana-k6-skill" "plugin manifest"
    
    print_success "Copilot installation complete"
}

# Install for Gemini
install_gemini() {
    print_header "Installing for Gemini"
    
    local gemini_skills="$HOME/.gemini/skills"
    local gemini_agents="$HOME/.agents/skills"
    
    # Try both locations
    if [ -d "$HOME/.gemini" ] || [ ! -z "$GEMINI_HOME" ]; then
        ensure_dir "$gemini_skills"
        link_or_copy "$SCRIPT_DIR/skills/$SKILL_NAME" "$gemini_skills/$SKILL_NAME" "k6-core skill"
        print_success "Gemini installation complete"
    else
        print_info "Gemini directory not found, skipping"
    fi
    
    # Also try generic agents directory
    ensure_dir "$gemini_agents"
    link_or_copy "$SCRIPT_DIR/skills/$SKILL_NAME" "$gemini_agents/$SKILL_NAME" "k6-core skill"
}

# Verify installation
verify_installation() {
    print_header "Verifying Installation"
    
    local errors=0
    
    # Check SKILL.md exists
    if [ -f "$SCRIPT_DIR/skills/$SKILL_NAME/SKILL.md" ]; then
        print_success "SKILL.md found"
    else
        print_error "SKILL.md not found"
        errors=$((errors + 1))
    fi
    
    # Check plugin.json exists
    if [ -f "$SCRIPT_DIR/.claude-plugin/plugin.json" ]; then
        print_success "plugin.json found"
    else
        print_error "plugin.json not found"
        errors=$((errors + 1))
    fi
    
    # Check symlinks/copies
    local install_dirs=(
        "$HOME/.claude/skills/$SKILL_NAME"
        "$HOME/.copilot/skills/$SKILL_NAME"
        "$HOME/.agents/skills/$SKILL_NAME"
    )
    
    for dir in "${install_dirs[@]}"; do
        if [ -e "$dir/SKILL.md" ]; then
            print_success "Installed: $dir"
        else
            print_info "Not found: $dir (may be expected)"
        fi
    done
    
    if [ $errors -eq 0 ]; then
        print_success "All checks passed!"
        return 0
    else
        print_error "$errors error(s) found"
        return 1
    fi
}

# Uninstall
uninstall() {
    print_header "Uninstalling grafana-k6-skill"
    
    local dirs_to_remove=(
        "$HOME/.claude/skills/$SKILL_NAME"
        "$HOME/.claude/plugins/grafana-k6-skill"
        "$HOME/.copilot/skills/$SKILL_NAME"
        "$HOME/.copilot/agents/grafana-k6-skill"
        "$HOME/.gemini/skills/$SKILL_NAME"
        "$HOME/.agents/skills/$SKILL_NAME"
    )
    
    for dir in "${dirs_to_remove[@]}"; do
        if [ -L "$dir" ] || [ -d "$dir" ]; then
            rm -rf "$dir"
            print_success "Removed: $dir"
        fi
    done
    
    print_success "Uninstallation complete"
}

# Main installation
main() {
    print_header "grafana-k6-skill Installer v1.0.0"
    
    detect_os
    
    # Check if uninstall flag
    if [ "$1" = "--uninstall" ] || [ "$1" = "-u" ]; then
        uninstall
        exit 0
    fi
    
    # Validate source files exist
    if [ ! -f "$SCRIPT_DIR/skills/$SKILL_NAME/SKILL.md" ]; then
        print_error "SKILL.md not found. Are you running this from the repository root?"
        exit 1
    fi
    
    if [ ! -f "$SCRIPT_DIR/.claude-plugin/plugin.json" ]; then
        print_error "plugin.json not found. Are you running this from the repository root?"
        exit 1
    fi
    
    # Perform installation
    install_claude
    install_copilot
    install_gemini
    
    # Verify
    echo ""
    verify_installation
    
    # Final instructions
    print_header "Installation Complete!"
    echo "The k6 skill is now available for your AI agents."
    echo ""
    echo "Usage:"
    echo "  /k6.plan scenario=load target=https://example.com sla=p95<500ms"
    echo "  /k6.optimize script=test.js focus=thresholds"
    echo "  /k6.validate script=test.js"
    echo "  /k6.thresholds metrics=p95,p99"
    echo "  /k6.run script=test.js env=staging"
    echo ""
    echo "For more information, see README.md"
    echo ""
    print_info "To uninstall, run: ./install.sh --uninstall"
}

# Run main with all arguments
main "$@"
