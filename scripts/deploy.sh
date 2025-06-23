#!/bin/bash

# AS Platform Vercel 快速部署腳本
# 使用方法: ./scripts/deploy.sh [environment]
# 環境選項: dev, preview, production

set -e  # 遇到錯誤立即退出

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函數定義
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  AS Platform 部署腳本${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 檢查必要工具
check_requirements() {
    print_info "檢查部署要求..."
    
    # 檢查 Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安裝，請先安裝 Node.js 18+"
        exit 1
    fi
    
    # 檢查 npm
    if ! command -v npm &> /dev/null; then
        print_error "npm 未安裝，請先安裝 npm"
        exit 1
    fi
    
    # 檢查 Vercel CLI
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI 未安裝，正在安裝..."
        npm install -g vercel
    fi
    
    print_success "所有要求已滿足"
}

# 檢查環境變量
check_env_vars() {
    print_info "檢查環境變量配置..."
    
    if [ ! -f ".env.local" ]; then
        print_warning ".env.local 文件不存在，從 .env.example 創建..."
        cp .env.example .env.local
        print_warning "請編輯 .env.local 文件並填入正確的環境變量值"
        read -p "按 Enter 繼續..."
    fi
    
    print_success "環境變量檢查完成"
}

# 運行測試
run_tests() {
    print_info "運行代碼質量檢查..."
    
    # 類型檢查
    print_info "執行 TypeScript 類型檢查..."
    npm run type-check
    
    # ESLint 檢查
    print_info "執行 ESLint 檢查..."
    npm run lint
    
    # 格式檢查
    print_info "執行代碼格式檢查..."
    npm run format:check
    
    print_success "所有檢查通過"
}

# 構建項目
build_project() {
    print_info "構建項目..."
    
    # 清理舊的構建文件
    npm run clean
    
    # 安裝依賴
    print_info "安裝依賴..."
    npm ci
    
    # 構建項目
    print_info "執行構建..."
    npm run build
    
    print_success "項目構建完成"
}

# 部署到 Vercel
deploy_to_vercel() {
    local env="$1"
    print_info "部署到 Vercel ($env)..."

    local vercel_command

    case "$env" in
        "dev")
            vercel_command="dev"
            ;; 
        "preview")
            # For preview, just `vercel` is enough
            vercel_command=""
            ;; 
        "production")
            vercel_command="--prod"
            ;; 
        *)
            print_error "無效的環境參數: $env"
            print_info "有效選項: dev, preview, production"
            exit 1
            ;; 
    esac

    # Execute the command
    if [ -n "$vercel_command" ]; then
        vercel "$vercel_command"
    else
        vercel
    fi

    print_success "部署完成"
}

# 部署後驗證
post_deploy_verification() {
    local deployment_url="$1"
    print_info "執行部署後驗證..."

    if [ -n "$deployment_url" ]; then
        print_info "檢查部署 URL: $deployment_url"

        # 檢查網站是否可訪問
        if curl -f -s "$deployment_url" > /dev/null; then
            print_success "網站可正常訪問"
        else
            print_error "網站無法訪問，請檢查部署狀態"
        fi

        # 檢查 API 健康狀態
        if curl -f -s "$deployment_url/api/health" > /dev/null; then
            print_success "API 端點正常"
        else
            print_warning "API 端點可能有問題，請檢查"
        fi
    fi
}

# 設置環境變量到 Vercel
setup_vercel_env() {
    print_info "設置 Vercel 環境變量..."
    
    # 讀取 .env.local 文件並設置到 Vercel
    if [ -f ".env.local" ]; then
        print_info "從 .env.local 讀取環境變量..."
        
        # 提示用戶確認
        read -p "是否要將 .env.local 中的變量同步到 Vercel? (y/N): " confirm
        
        if [[ $confirm =~ ^[Yy]$ ]]; then
            print_info "請手動在 Vercel Dashboard 中設置環境變量"
            print_info "或使用 'vercel env add' 命令逐個添加"
        fi
    else
        print_warning ".env.local 文件不存在"
    fi
}

# 顯示幫助信息
show_help() {
    echo "AS Platform Vercel 部署腳本"
    echo ""
    echo "使用方法:"
    echo "  ./scripts/deploy.sh [ENVIRONMENT] [OPTIONS]"
    echo ""
    echo "環境選項:"
    echo "  dev         啟動開發服務器"
    echo "  preview     部署到預覽環境"
    echo "  production  部署到生產環境"
    echo ""
    echo "選項:"
    echo "  --skip-tests    跳過代碼質量檢查"
    echo "  --skip-build    跳過本地構建"
    echo "  --setup-env     設置 Vercel 環境變量"
    echo "  --help          顯示此幫助信息"
    echo ""
    echo "範例:"
    echo "  ./scripts/deploy.sh production"
    echo "  ./scripts/deploy.sh preview --skip-tests"
    echo "  ./scripts/deploy.sh --setup-env"
}

# 主函數
main() {
    print_header
    
    # 解析參數
    ENVIRONMENT=""
    SKIP_TESTS=false
    SKIP_BUILD=false
    SETUP_ENV=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            dev|preview|production)
                ENVIRONMENT="$1"
                shift
                ;;
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --setup-env)
                SETUP_ENV=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                print_error "未知參數: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 如果只是設置環境變量
    if [ "$SETUP_ENV" = true ]; then
        setup_vercel_env
        exit 0
    fi
    
    # 如果沒有指定環境，顯示幫助
    if [ -z "$ENVIRONMENT" ]; then
        print_error "請指定部署環境"
        show_help
        exit 1
    fi
    
    # 執行部署流程
    check_requirements
    check_env_vars
    
    if [ "$SKIP_TESTS" = false ]; then
        run_tests
    fi
    
    if [ "$SKIP_BUILD" = false ] && [ "$ENVIRONMENT" != "dev" ]; then
        build_project
    fi
    
    deploy_to_vercel "$ENVIRONMENT"
    
    print_success "部署流程完成！"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        print_info "生產環境部署完成，請進行以下檢查："
        echo "  1. 訪問網站確認功能正常"
        echo "  2. 檢查 Vercel Dashboard 中的部署狀態"
        echo "  3. 監控應用性能和錯誤日誌"
        echo "  4. 確認所有環境變量設置正確"
    fi
}

# 執行主函數
main "$@"