@echo off
echo Running local Next.js build to check for compilation errors...
npm run build > build-error.log 2>&1
echo Done! Check build-error.log for any errors.
