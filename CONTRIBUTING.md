# Contributing to Brush

Thank you for your interest in contributing to Brush! This project uses a Pull Request (PR) workflow.

## Development Workflow

### 1. Branch Structure

- **`main`**: Production-ready code (protected from direct commits)
- **`develop`**: Integration branch for new features
- **`feature/*`**: Feature-specific branches
- **`bugfix/*`**: Bug fix branches

### 2. Creating a Pull Request

**Step 1: Create a Feature Branch**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

**Step 2: Make Your Changes**
- Write your code
- Add/update tests
- Update documentation
- Commit with descriptive messages

**Step 3: Push and Create PR**
```bash
git push origin feature/your-feature-name
```

Then visit the GitHub web UI to create a Pull Request:
https://github.com/code74249/brush/pull/new/develop

**Step 4: Code Review**
- Your PR will be reviewed
- Make requested changes
- Squash commits if needed

**Step 5: Merge**
- Once approved, your PR will be merged to `develop`
- Periodic releases from `develop` to `main`

### 3. Working on Existing PRs

If you need to update your PR:
```bash
git checkout feature/your-feature-name
git pull origin feature/your-feature-name
# Make changes
git commit -am "Update: Description of changes"
git push origin feature/your-feature-name
```

### 4. Release Process

When releasing to `main`:
```bash
git checkout main
git pull origin main
git checkout develop
git merge main
# Or use GitHub's "Create release" feature
```

## Coding Standards

- Follow existing code style
- Use ES6 modules
- Add comments for complex logic
- Write tests for new features
- Ensure all tests pass before opening PR

## Code Review Guidelines

### For Contributors
- Keep PRs focused on one feature/fix
- Provide clear description of changes
- Refer to relevant issues
- Respond to review feedback promptly

### For Reviewers
- Focus on code quality and best practices
- Test the changes if applicable
- Ask questions rather than assuming
- Be constructive and respectful

## Running Tests

Before opening a PR:
```bash
cd /projects/brush/tests
node unit.test.js
```

Ensure all tests pass.

## Documentation Updates

- Update README.md for user-facing changes
- Update PLAN.md for architectural changes
- Add inline comments for complex logic

## Labels

Use these labels for PRs:
- `bug`: Bug fixes
- `enhancement`: New features
- `documentation`: Documentation updates
- `testing`: Test additions/changes

## Questions?

Feel free to open an issue if you have questions about contributing!