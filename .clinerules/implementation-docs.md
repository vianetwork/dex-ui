# Implementation Documentation Guidelines

## Overview

When creating implementation plans, structure them in the order a real programmer would execute the changes. This helps Cline understand dependencies and execute changes efficiently.

## Execution Order Principles

### 1. Create Dependencies Before Dependents

Always create files that other files depend on first:

```
✅ Correct Order:
1. Create utility file (no dependencies)
2. Create/update module (depends on utility)
3. Update consumer (depends on module + utility)

❌ Wrong Order:
1. Update consumer (will have import errors)
2. Create utility file
3. Update module
```

### 2. Pure Functions Before Stateful Code

- Create pure utility functions first (easiest to test, no side effects)
- Then create modules/services that use those utilities
- Finally update consumers that use the modules

### 3. Types Before Implementation

If defining new types (interfaces, structs, schemas):
1. Define types first
2. Implement functions that use those types
3. Update consumers

### 4. Configuration Before Code That Uses It

When adding new features that require configuration:
1. Add environment variables or config files first
2. Create services/utilities that read the config
3. Update consumers that use the services

### 5. Backend/API Changes Before Frontend

If changes span multiple layers:
1. Database schema changes (if applicable)
2. API endpoint changes
3. Service layer updates
4. UI/client updates

### 6. Shared Code Before Feature-Specific Code

When refactoring or adding features:
1. Extract/create shared utilities first
2. Update or create shared modules
3. Implement feature-specific code that uses shared pieces

### 7. Delete After Replace, Not Before

When replacing old code with new:
1. Create the new implementation first
2. Update consumers to use the new code
3. Verify everything works
4. Then delete the old code

```
❌ Bad: Delete old code → Create new code (broken state)
✅ Good: Create new code → Migrate → Delete old code
```

### 8. One Complete File at a Time

When making changes to multiple files:
- Complete all changes to one file before moving to the next
- Don't partially edit file A, then file B, then back to file A
- This reduces context switching and errors

### 9. Show Insertion Context for Diffs

When showing diffs that add new code to existing files, include enough surrounding context to show WHERE the code should be inserted:

```
❌ Bad - No context about surrounding code:
```diff
+  const result = calculateValue(inputData);
```

✅ Good - Shows what comes before/after:
```diff
    const inputData = prepareInput(...);  // existing line for context
+
+  const result = calculateValue(inputData);
+
    processResult(result);  // existing line for context
```

**Why this matters:**
- Most languages require declarations before use (variables, functions, classes)
- Insertion point affects scope and visibility
- Some languages have ordering requirements (e.g., forward declarations in C/C++, hook ordering in React)
- Without context, the implementer must guess where to insert the code

**For complex files, consider:**
- Showing line numbers in comments: `// Insert at ~line 45`
- Listing anchor points: "Insert after: `const selectedAsset = ...`"
- Providing a skeleton showing the order of declarations
- Including the function/class/block the code belongs in

**Language-specific considerations:**
| Language | Ordering Concern |
|----------|------------------|
| JavaScript/TypeScript | Variables must be declared before use (no hoisting for `const`/`let`) |
| Python | Functions/classes must be defined before called (at runtime) |
| Go | Package-level declarations can be in any order, but local variables must be declared first |
| Rust | Items can be in any order, but local variables follow declaration order |
| C/C++ | Forward declarations needed, or define before use |

### 10. Prefer Unified Diff Format for Insertions

When adding new code blocks (not modifying existing), use unified diff format with context lines:

```
✅ Good - Unified diff with before/after context:
```diff
     existing_code_before();

+    // New code to add
+    new_function_call();
+
     existing_code_after();
```

```
❌ Avoid - Standalone block without context:
```
// Add this somewhere:
new_function_call();
```

**Why unified diff is better:**
- Shows what comes before and after (anchor points)
- Standard format recognized across all languages
- No ambiguity about placement
- Can be applied with `git apply` or patch tools

## Documentation Format

### Prefer Git Diff Format

Use standard git diff format for all changes. This is cleaner and more universally understood than verbose "Replace X with Y" patterns.

```diff
diff --git a/path/to/file.ts b/path/to/file.ts
--- a/path/to/file.ts
+++ b/path/to/file.ts
@@
-import { OldThing } from './old';
+import { NewThing } from './new';
@@
 function example() {
-    return oldValue;
+    return newValue;
 }
```

**Do NOT use verbose patterns like:**
```
### Step 2.1.3 - Update function
**Replace:**
```typescript
const old = thing;
```
**With:**
```typescript
const new = thing;
```
```

This verbose format is harder to read and apply than a simple diff.

### For New Files

Show the complete file content in a diff block:

```diff
diff --git a/path/to/new-file.ts b/path/to/new-file.ts
new file mode 100644
--- /dev/null
+++ b/path/to/new-file.ts
@@
+// Full file content here
+export function newFunction() {
+  return 'hello';
+}
```

### Include Verification Steps

At the end of the plan, include verification:

```markdown
## Verification Steps

1. **Compile/Build Check**
   - Ensure the project compiles without errors

2. **Lint Check**
   - Run the project's linter

3. **Test**
   - Run automated tests
   - Manual testing checklist:
     - [ ] Test case 1
     - [ ] Test case 2
```

## Anti-Patterns to Avoid

### ❌ Don't Start with the Consumer

Starting with the consumer that uses a not-yet-created utility will cause:
- Import errors during development
- Confusion about what the utility API should be
- Back-and-forth between files

### ❌ Don't Mix Creation and Cleanup

```
❌ Bad:
1. Create new utility
2. Delete old code from module
3. Add new code to module
4. Delete more old code

✅ Good:
1. Create new utility (complete)
2. Update module (complete - both add new and remove old)
3. Update consumer (complete)
```

### ❌ Don't Skip Intermediate Verification

For complex refactors, verify after each major step:
- After creating utility: Does it compile?
- After updating module: Does it compile?
- After updating consumer: Does it compile and work?

### ❌ Don't Do Big Bang Migrations

```
❌ Bad: "Update all 47 modules to use the new API"
   → One failure breaks everything
   → Hard to identify which module caused the issue

✅ Good: "Update modules one by one, verify after each"
```

### ❌ Don't Leave Dependencies Implicit

```
❌ Bad: "This step assumes you've set up the database"
   → What if they haven't?

✅ Good: "Depends on: Step 2 (database configuration)"
   → Explicit, traceable
```

## Summary

**Order of operations:**
1. Types/interfaces (if new)
2. Pure utility functions
3. Modules/services that use utilities
4. Consumers that use modules
5. Cleanup (remove dead code)
6. Verification (compile, lint, test)
