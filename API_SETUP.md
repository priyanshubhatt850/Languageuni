# API Architecture Setup & Integration Guide

## Quick Setup (5 minutes)

### Step 1: Add Aggregated Routes to Backend

Edit `Languageunibackend/src/app.js` and add these lines:

```javascript
// Add this with other route imports (around line where other routes are)
const aggregateRoutes = require('./routes/aggregate');

// Add this to app.use() section (after other api routes)
app.use('/api', aggregateRoutes);
```

**Full example of where to add:**
```javascript
// ... other imports ...

// Add this import
const aggregateRoutes = require('./routes/aggregate');

// ... rest of app setup ...

// Add this in app.use() section (after other routes like /User, /Course, etc)
app.use('/api', aggregateRoutes);

// Error handling should come after all routes
```

### Step 2: Test Backend Endpoints

After adding routes, restart backend and test:

```bash
# Test admin dashboard endpoint
curl http://localhost:3000/api/aggregate/admin-dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return: { "success": true, "data": { "stats": {...}, ... } }
```

### Step 3: Frontend Already Configured

The frontend is already set up with:
- ✅ `src/api/apiService.js` - API service layer
- ✅ `src/hooks/useApi.js` - Custom hooks
- ✅ Example pages showing new approach

No additional setup needed!

## Understanding the Data Flow

### Data Flow Example: Admin Dashboard

```
1. Component loads
   ↓
2. Component calls: useAdminDashboard()
   ↓
3. Hook calls: apiService.dashboard.getAdminDashboard()
   ↓
4. Service calls: GET /api/aggregate/admin-dashboard
   ↓
5. Backend aggregates data from multiple collections
   ↓
6. Backend returns aggregated response:
   {
     success: true,
     data: {
       stats: { total_users, total_revenue, ... },
       recent_users: [...],
       recent_courses: [...],
       notifications: [...]
     }
   }
   ↓
7. Hook caches and returns data
   ↓
8. Component renders with aggregated data
```

## File Reference

| File | Purpose | Location |
|------|---------|----------|
| Aggregated Routes | Backend endpoints | `Languageunibackend/src/routes/aggregate.js` |
| API Service | Service layer with organized methods | `Languageuni/src/api/apiService.js` |
| Custom Hooks | React hooks for data fetching | `Languageuni/src/hooks/useApi.js` |
| Documentation | Full architecture guide | `Languageuni/API_ARCHITECTURE.md` |
| Example Pages | Refactored pages showing new approach | `AdminDashboard.REFACTORED.jsx`, `AdminStudents.REFACTORED.jsx` |

## Migration Guide

### For Each Page You Want to Migrate:

#### OLD CODE (Multiple API calls)
```javascript
import { useQuery } from '@tanstack/react-query';
import { WWClient } from '@/api/WWClient';

export default function AdminPage() {
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => WWClient.entities.User.list()
  });
  
  const { data: enrollments } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => WWClient.entities.Enrollment.list()
  });
  
  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => WWClient.entities.Course.list()
  });
  
  // Manual data calculation
  const stats = {
    totalUsers: users.length,
    totalEnrollments: enrollments.length,
    revenue: enrollments.filter(e => e.paid).reduce((sum, e) => sum + e.amount, 0)
  };
  
  return <div>{stats.totalUsers} users</div>;
}
```

#### NEW CODE (Single aggregated call)
```javascript
import { useAdminDashboard } from '@/hooks/useApi';

export default function AdminPage() {
  const { data: dashboard, isLoading, error } = useAdminDashboard();
  
  if (isLoading) return <LoadingPage />;
  if (error) return <ErrorMessage />;
  
  const stats = dashboard.data.stats; // Already calculated on backend!
  
  return <div>{stats.total_users} users</div>;
}
```

### Step-by-Step Migration

1. **Identify what data you need**
   ```javascript
   // Find all useQuery hooks in the page
   // Find what data is being calculated from them
   ```

2. **Find the matching hook in useApi.js**
   ```javascript
   // useAdminDashboard - for dashboard pages
   // useStudents - for student list pages
   // useCourseDetail - for course detail pages
   // useInstructor - for instructor pages
   // etc.
   ```

3. **Replace all useQuery calls with single hook**
   ```javascript
   const { data, isLoading, error } = useAdminDashboard();
   ```

4. **Update data access**
   ```javascript
   // OLD: data?.users
   // NEW: data?.data?.recent_users
   // OLD: data?.stats.total_users
   // NEW: data?.data?.stats?.total_users
   ```

5. **Remove manual calculations**
   ```javascript
   // These are now done on backend:
   // - Filtering by role
   // - Counting totals
   // - Calculating revenue
   // - Computing percentages
   ```

6. **Test in browser**
   - Check that data loads
   - Check loading/error states
   - Check Network tab - should see fewer requests
   - Check Console - should see no errors

## Common Patterns

### Pattern 1: List with Pagination
```javascript
import { useStudents } from '@/hooks/useApi';

const [page, setPage] = useState(1);
const { data: response } = useStudents({ page, limit: 10 });

const students = response?.data?.students || [];
const pagination = response?.data?.pagination || {};

return (
  <>
    <StudentTable data={students} />
    <Pagination 
      current={pagination.current_page}
      total={pagination.total_pages}
      onPageChange={setPage}
    />
  </>
);
```

### Pattern 2: Detail Page
```javascript
import { useCourseDetail } from '@/hooks/useApi';

const { data: response } = useCourseDetail(courseId);

const course = response?.data?.course;
const levels = response?.data?.levels;
const stats = response?.data?.stats;

return (
  <>
    <h1>{course.title}</h1>
    <p>Levels: {stats.total_levels}</p>
    <LevelsList data={levels} />
  </>
);
```

### Pattern 3: Update Form
```javascript
import { useUpdateStudent } from '@/hooks/useApi';

const updateMutation = useUpdateStudent();

const handleSubmit = async (newData) => {
  try {
    await updateMutation.mutateAsync({
      studentId: id,
      data: newData
    });
    // Success toast already shown by hook
  } catch (error) {
    console.error('Update failed:', error);
    // Error toast already shown by hook
  }
};

return (
  <form onSubmit={handleSubmit}>
    {/* form fields */}
    <button disabled={updateMutation.isLoading}>
      {updateMutation.isLoading ? 'Saving...' : 'Save'}
    </button>
  </form>
);
```

## Debugging

### Check Network Requests

Open DevTools → Network tab:
- **Before:** Should see multiple requests per page
  - GET /User
  - GET /Course
  - GET /Enrollment
  - GET /InstructorProfile
  - GET /Notification

- **After:** Should see single request
  - GET /api/aggregate/admin-dashboard

### Check Response Structure

In DevTools → Network → click request → Response:
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_users": 100,
      "total_revenue": 5000,
      ...
    },
    "recent_users": [...],
    "notifications": [...]
  }
}
```

### Check Hook Data

In component:
```javascript
const { data, isLoading, error } = useAdminDashboard();
console.log('Full response:', data);
console.log('Stats:', data?.data?.stats);
console.log('Users:', data?.data?.recent_users);
```

## Performance Metrics

Monitor improvements with:

```javascript
// Measure initial load time
console.time('page-load');
// ... load code ...
console.timeEnd('page-load');

// Check Network tab in DevTools:
// Calculate total request time and size
```

Expected improvements:
- **Network Requests:** -50 to 80%
- **Load Time:** -40 to 70%
- **Data Transfer:** -30 to 60%

## Troubleshooting

### 404 Error on Aggregate Endpoints
- ✅ Check backend routes are added
- ✅ Check backend is restarted
- ✅ Check URL path is exactly `/api/aggregate/...`

### Data Not Loading
- ✅ Check error state: `error?.message`
- ✅ Check network request actually made (Network tab)
- ✅ Check backend server is running
- ✅ Check authentication token is valid

### Old API Calls Still Showing
- ✅ Search for `WWClient.entities` in the file
- ✅ Replace with appropriate hook
- ✅ Remove old useQuery calls

### Pagination Not Working
- ✅ Check `page` and `limit` parameters being passed
- ✅ Check pagination object: `response?.data?.pagination`
- ✅ Check page state updates trigger refetch

## Next Steps

1. **Add aggregate routes to backend** (Step 1 above)
2. **Pick a page to migrate** (start with AdminDashboard)
3. **Compare old vs refactored version** (see example files)
4. **Update the page to use new hooks**
5. **Test in browser**
6. **Repeat for other pages**

## Pages Ready to Migrate (Priority Order)

High Priority (Heavy API usage):
1. AdminDashboard - 5 separate calls
2. AdminStudents - 3 separate calls
3. AdminInstructors - 3 separate calls
4. CourseDetail - 4 separate calls

Medium Priority:
5. AdminLanguages - 1 call (already efficient)
6. AdminLevelMaterials - 2 separate calls
7. AdminCourses - 2 separate calls

## Complete Example

See refactored pages for complete working examples:
- `AdminDashboard.REFACTORED.jsx` - Dashboard example
- `AdminStudents.REFACTORED.jsx` - List with pagination example

Copy the pattern and apply to other pages.

## Support

For detailed API reference, see: `API_ARCHITECTURE.md`

For specific hooks documentation, see: `src/hooks/useApi.js`

For service layer documentation, see: `src/api/apiService.js`
