#!/usr/bin/env bash
# AGENTS.md compliance checks — full repo or staged changes only (--staged)
set -euo pipefail

STAGED=false
if [[ "${1:-}" == "--staged" ]]; then
  STAGED=true
fi

VIOLATIONS=()

fail() {
  VIOLATIONS+=("$1")
}

report_violations() {
  local title="$1"
  if [ ${#VIOLATIONS[@]} -gt 0 ]; then
    echo ""
    echo "AGENTS.md violation — $title:"
    for v in "${VIOLATIONS[@]}"; do
      echo "  ✗ $v"
    done
    exit 1
  fi
}

clear_violations() {
  VIOLATIONS=()
}

# shadcn/ui primitives — bypass folder + arrow-function rules
UI_COMPONENTS_PATH='src/modules/core/components/ui/'

is_ui_component_file() {
  [[ "$1" == ${UI_COMPONENTS_PATH}* ]]
}

# --- file sources ---

staged_files() {
  git diff --cached --name-only --diff-filter=ACMR 2>/dev/null || true
}

module_component_tsx_files() {
  if $STAGED; then
    staged_files | grep -E '^src/modules/[^/]+/components/.+\.tsx$' || true
  else
    find src/modules -type f -name "*.tsx" | grep "/components/" | grep -v "/pages/" || true
  fi
}

module_page_index_files() {
  if $STAGED; then
    staged_files | grep -E '^src/modules/[^/]+/pages/[^/]+/index\.tsx$' || true
  else
    find src/modules -type f -path "*/pages/*/index.tsx" || true
  fi
}

module_component_index_files() {
  if $STAGED; then
    staged_files | grep -E '^src/modules/[^/]+/components/[^/]+/index\.tsx$' || true
  else
    find src/modules -type f -name "index.tsx" | grep "/components/" || true
  fi
}

module_all_component_files() {
  if $STAGED; then
    staged_files | grep -E '^src/modules/[^/]+/components/.+\.tsx$' || true
  else
    find src/modules -type f -name "*.tsx" | grep "/components/" | grep -v "/pages/" || true
  fi
}

staged_ts_files() {
  staged_files | grep -E '\.(ts|tsx)$' || true
}

# --- checks ---

check_component_structure() {
  clear_violations
  echo "Checking component folder/index.tsx structure..."

  if $STAGED; then
    while IFS= read -r file; do
      [ -z "$file" ] && continue
      is_ui_component_file "$file" && continue
      # File directly under components/ (not in a subfolder)
      if echo "$file" | grep -qE '^src/modules/[^/]+/components/[^/]+\.tsx$'; then
        fail "$file — must be inside its own folder: ComponentName/index.tsx"
      fi
      # File in subfolder but not index.tsx
      if echo "$file" | grep -qE '^src/modules/[^/]+/components/[^/]+/[^/]+\.tsx$' \
        && ! echo "$file" | grep -qE '/index\.tsx$'; then
        fail "$file — component entry file must be index.tsx"
      fi
    done < <(module_component_tsx_files)
  else
    while IFS= read -r file; do
      is_ui_component_file "$file" && continue
      fail "$file — must be inside its own folder: ComponentName/index.tsx"
    done < <(find src/modules -type f -name "*.tsx" \
      | grep "/components/" \
      | grep -v "/components/ui/" \
      | grep -v "/components/[^/]*/index\.tsx" \
      | grep -v "/pages/")
  fi

  report_violations "Component structure"
  echo "✓ Component folder/index.tsx structure"
}

check_pascal_case_folders() {
  clear_violations
  echo "Checking PascalCase component and page folder names..."

  while IFS= read -r file; do
    [ -z "$file" ] && continue
    is_ui_component_file "$file" && continue
    folder=""
    if echo "$file" | grep -q "/components/"; then
      folder=$(echo "$file" | sed -E 's|^src/modules/[^/]+/components/([^/]+)/.*|\1|')
    elif echo "$file" | grep -q "/pages/"; then
      folder=$(echo "$file" | sed -E 's|^src/modules/[^/]+/pages/([^/]+)/.*|\1|')
    fi
    [ -z "$folder" ] && continue
    if ! echo "$folder" | grep -qE '^[A-Z][a-zA-Z0-9]*$'; then
      fail "$file — folder \"$folder\" must be PascalCase (e.g. LoginForm, UserCard)"
    fi
  done < <({ module_component_index_files; module_page_index_files; } | sort -u)

  report_violations "PascalCase folder names"
  echo "✓ PascalCase component and page folders"
}

check_arrow_functions() {
  clear_violations
  echo "Checking arrow function components in modules..."

  while IFS= read -r file; do
    [ -z "$file" ] && continue
    [ ! -f "$file" ] && continue
    is_ui_component_file "$file" && continue
    if grep -qE '^[[:space:]]*(export[[:space:]]+(default[[:space:]]+)?)?function[[:space:]]+[A-Z]' "$file"; then
      fail "$file — use arrow function: const Name = () => { ... }"
    fi
  done < <({ module_component_index_files; module_page_index_files; } | sort -u)

  report_violations "Arrow function rule"
  echo "✓ Module components and pages use arrow functions"
}

check_module_root_barrels() {
  clear_violations
  echo "Checking for module root barrel index.ts..."

  if $STAGED; then
    while IFS= read -r file; do
      [ -z "$file" ] && continue
      if echo "$file" | grep -qE '^src/modules/[^/]+/index\.ts$'; then
        fail "$file — do not add root barrel index.ts in modules"
      fi
    done < <(staged_files)
  else
    while IFS= read -r file; do
      fail "$file — do not add root barrel index.ts in modules"
    done < <(find src/modules -maxdepth 2 -name "index.ts" \
      | grep -vE 'src/modules/[^/]+/(types|utils|hooks|services|components|pages)/')
  fi

  report_violations "No module root barrels"
  echo "✓ No module root barrel index.ts"
}

check_import_aliases() {
  clear_violations
  echo "Checking module path alias imports..."

  local files module_aliases
  if $STAGED; then
    files=$(staged_ts_files)
  else
    files=$(find src -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/node_modules/*")
  fi

  module_aliases=$(grep -oE '"@/[^/]+/\*"' tsconfig.json | sed -E 's|"@/([^/]+)/\*"|\1|')

  while IFS= read -r file; do
    [ -z "$file" ] && continue
    [ ! -f "$file" ] && continue

    if grep -q '@/modules/' "$file"; then
      fail "$file — use module alias (@/core/*, @/auth/*) instead of @/modules/*"
    fi

    while IFS= read -r alias; do
      [ -z "$alias" ] && continue
      if grep -qE "from [\"']@/${alias}[\"']" "$file"; then
        fail "$file — import directly from source file via alias (e.g. @/${alias}/pages/LoginPage), not @/${alias} root"
      fi
    done <<< "$module_aliases"
  done <<< "$files"

  report_violations "Import alias convention"
  echo "✓ Import paths follow module alias convention"
}

check_tsconfig_aliases_for_new_modules() {
  clear_violations
  echo "Checking tsconfig.json path aliases for modules..."

  local modules
  if $STAGED; then
    modules=$(staged_files | grep -E '^src/modules/[^/]+/' \
      | sed -E 's|^src/modules/([^/]+)/.*|\1|' | sort -u || true)
  else
    modules=$(find src/modules -mindepth 1 -maxdepth 1 -type d \
      | sed 's|src/modules/||' | sort -u)
  fi

  while IFS= read -r module; do
    [ -z "$module" ] && continue
    if ! grep -q "\"@/${module}/\\*\"" tsconfig.json; then
      fail "Module \"$module\" is used but tsconfig.json is missing: \"@/${module}/*\": [\"./src/modules/${module}/*\"]"
    fi
  done <<< "$modules"

  report_violations "tsconfig path aliases"
  echo "✓ tsconfig.json path aliases registered for modules"
}

check_no_api_calls_in_components() {
  clear_violations
  echo "Checking components do not call APIs directly..."

  while IFS= read -r file; do
    [ -z "$file" ] && continue
    [ ! -f "$file" ] && continue

    if grep -qE 'from ["'"'"']axios["'"'"']|from ["'"'"']@/utils/axios|useQueryFetch|useMutationQuery|useQuery\(|useMutation\(|[^a-zA-Z]fetch\(' "$file"; then
      fail "$file — components must not call APIs; move fetch/axios/React Query usage to hooks/ or services/"
    fi
  done < <(module_all_component_files)

  report_violations "No API calls in components"
  echo "✓ Components do not call APIs directly"
}

check_data_fetching_in_components() {
  clear_violations
  echo "Checking client components use approved data hooks..."

  while IFS= read -r file; do
    [ -z "$file" ] && continue
    [ ! -f "$file" ] && continue
    grep -q '"use client"' "$file" || continue

    if grep -qE 'from ["'"'"']@/utils/execute-fetch|executeFetch\(' "$file"; then
      fail "$file — use executeFetch in Server Components only, not client components"
    fi
  done < <(if $STAGED; then staged_ts_files; else find src -type f \( -name "*.ts" -o -name "*.tsx" \); fi)

  report_violations "Data fetching layer separation"
  echo "✓ Client/server data fetching separation"
}

# --- run ---

SCOPE="full repository"
$STAGED && SCOPE="staged changes"

echo "Running AGENTS.md compliance checks ($SCOPE)..."
echo ""

check_component_structure
check_pascal_case_folders
check_arrow_functions
check_module_root_barrels
check_import_aliases
check_tsconfig_aliases_for_new_modules
check_no_api_calls_in_components
check_data_fetching_in_components

echo ""
echo "✓ All AGENTS.md compliance checks passed ($SCOPE)"
