# 🔐 Sharing System Documentation

## Overview

The Sharing System allows users to collaborate by sharing resources (tasks, notes, events, files) with other users or via public links. It implements a flexible permission-based access control system with real-time updates.

---

## 🎯 Key Features

### ✅ User-to-User Sharing
- Share resources with specific users by email
- Support for both registered and unregistered users
- Automatic invitation system for new users
- Multiple permission levels (Viewer, Commenter, Editor, Admin, Owner)

### 🔗 Public Link Sharing
- Generate secure, unique public links
- Anyone with the link can access the resource
- One-click copy to clipboard
- Easy link revocation

### 🛡️ Permission Levels

| Level | Description | Capabilities |
|-------|-------------|--------------|
| **OWNER** | Full control | Delete, manage permissions, edit, view |
| **ADMIN** | Administrative access | Share with others, edit, view |
| **EDITOR** | Edit access | Modify content, view |
| **COMMENTER** | Comment access | Add comments, view |
| **VIEWER** | Read-only access | View content only |

### 📊 Activity Tracking
- Complete audit log of sharing activities
- Track who shared, when, and with whom
- Monitor permission changes and access events

---

## 🚀 Quick Start Guide

### 1. Share a Resource with a User

```typescript
import { useShareResourceMutation, ResourceType, PermissionLevel } from '@/entities/sharing';

const MyComponent = () => {
  const [shareResource] = useShareResourceMutation();

  const handleShare = async () => {
    try {
      await shareResource({
        resourceType: ResourceType.TASK,
        resourceId: 123,
        email: 'friend@example.com',
        permissionLevel: PermissionLevel.EDITOR,
      }).unwrap();

      console.log('✅ Successfully shared!');
    } catch (error) {
      console.error('❌ Failed to share:', error);
    }
  };

  return <button onClick={handleShare}>Share Task</button>;
};
```

### 2. Create a Public Link

```typescript
import { useCreatePublicLinkMutation, ResourceType } from '@/entities/sharing';

const MyComponent = () => {
  const [createPublicLink] = useCreatePublicLinkMutation();

  const handleCreateLink = async () => {
    try {
      const { token, url } = await createPublicLink({
        resourceType: ResourceType.NOTE,
        resourceId: 456,
        permissionLevel: PermissionLevel.VIEWER,
      }).unwrap();

      console.log('🔗 Public link:', url);
      // Copy to clipboard
      navigator.clipboard.writeText(url);
    } catch (error) {
      console.error('❌ Failed to create link:', error);
    }
  };

  return <button onClick={handleCreateLink}>Create Public Link</button>;
};
```

### 3. Use ShareModal Component

```typescript
import { useState } from 'react';
import { ShareModal } from '@/features/sharing';
import { ResourceType } from '@/entities/sharing';

const TaskItem = ({ task }) => {
  const [shareModalOpen, setShareModalOpen] = useState(false);

  return (
    <>
      <button onClick={() => setShareModalOpen(true)}>
        Share Task
      </button>

      <ShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        resourceType={ResourceType.TASK}
        resourceId={task.id}
        resourceName={task.title}
      />
    </>
  );
};
```

---

## 📖 API Reference

### Mutations

#### `useShareResourceMutation`
Share a resource with a user by email.

**Request:**
```typescript
{
  resourceType: ResourceType;
  resourceId: number;
  email?: string;
  userId?: number;
  permissionLevel: PermissionLevel;
  expiresAt?: string; // ISO date string
}
```

**Response:**
```typescript
SharePermission
```

---

#### `useUpdatePermissionMutation`
Update an existing permission level.

**Request:**
```typescript
{
  permissionId: number;
  permissionLevel: PermissionLevel;
}
```

---

#### `useRevokePermissionMutation`
Remove user's access to a resource.

**Request:**
```typescript
permissionId: number
```

---

#### `useCreatePublicLinkMutation`
Generate a public sharing link.

**Request:**
```typescript
{
  resourceType: ResourceType;
  resourceId: number;
  permissionLevel?: PermissionLevel;
}
```

**Response:**
```typescript
{
  token: string;
  url: string; // Full URL like: https://yourapp.com/shared/abc123
}
```

---

#### `useDeletePublicLinkMutation`
Delete an existing public link.

**Request:**
```typescript
{
  resourceType: ResourceType;
  resourceId: number;
}
```

---

### Queries

#### `useGetResourcePermissionsQuery`
Get all permissions for a specific resource.

**Request:**
```typescript
{
  resourceType: ResourceType;
  resourceId: number;
}
```

**Response:**
```typescript
SharePermission[]
```

---

#### `useGetSharedWithMeQuery`
Get all resources shared with the current user.

**Request:**
```typescript
type?: ResourceType // Optional filter
```

**Response:**
```typescript
SharedResource[]
```

---

#### `useGetSharedByMeQuery`
Get all resources shared by the current user.

**Request:**
```typescript
type?: ResourceType // Optional filter
```

**Response:**
```typescript
SharedResource[]
```

---

#### `useCheckPermissionQuery`
Check current user's permission level for a resource.

**Request:**
```typescript
{
  resourceType: ResourceType;
  resourceId: number;
}
```

**Response:**
```typescript
{
  hasAccess: boolean;
  permissionLevel: PermissionLevel | null;
  expired?: boolean;
}
```

---

#### `useAccessPublicResourceQuery`
Access a resource via public token.

**Request:**
```typescript
token: string
```

**Response:**
```typescript
{
  resource: any;
  permissionLevel: PermissionLevel;
}
```

---

## 🔄 User Flow Examples

### Scenario 1: Share with Registered User

1. User A clicks "Share" on Task #123
2. User A enters User B's email: `userb@example.com`
3. User A selects permission level: `EDITOR`
4. User A clicks "Share"
5. ✅ User B immediately sees Task #123 in "Shared with me"
6. ✅ User B can edit the task

### Scenario 2: Share with Unregistered User

1. User A shares Note #456 with `newuser@example.com`
2. System creates a pending permission
3. 📧 `newuser@example.com` receives invitation email
4. New user registers/activates account
5. ✅ Note #456 automatically appears in their "Shared with me"

### Scenario 3: Public Link Sharing

1. User A clicks "Create public link" for Event #789
2. System generates unique token: `abc123xyz`
3. 🔗 Public URL: `https://yourapp.com/shared/abc123xyz`
4. User A copies and sends link to anyone
5. ✅ Recipients can view Event #789 without logging in
6. User A can revoke link anytime

---

## 🎨 UI Components

### ShareModal

The main modal component for managing resource sharing.

**Props:**
```typescript
interface ShareModalProps {
  open: boolean;              // Controls modal visibility
  onClose: () => void;        // Close handler
  resourceType: ResourceType; // Type of resource being shared
  resourceId: number;         // ID of the resource
  resourceName: string;       // Display name for UI
}
```

**Features:**
- 👥 Invite users by email
- 🔗 Create/manage public links
- 👀 View all collaborators
- ✏️ Change permission levels
- 🗑️ Revoke access

---

## 🔒 Security Features

### Permission Validation
- Server-side validation of all permission changes
- Users can only share resources they own
- Permission levels are hierarchical

### Expiration Support
- Set temporary access with `expiresAt` field
- Automatically revoke expired permissions
- Visual indicators for temporary access

### Activity Logging
- All sharing actions are logged
- Includes actor, target, timestamp
- IP address and user agent tracking

---

## 🌐 Backend Routes

### Private Routes (Requires Authentication)

```
POST   /api/v1/sharing/share                              - Share resource
GET    /api/v1/sharing/permissions/:resourceType/:id      - Get permissions
PATCH  /api/v1/sharing/permissions/:permissionId          - Update permission
DELETE /api/v1/sharing/permissions/:permissionId          - Revoke permission
POST   /api/v1/sharing/public-link                        - Create public link
DELETE /api/v1/sharing/public-link/:resourceType/:id      - Delete public link
GET    /api/v1/sharing/shared-with-me                     - Get shared resources
GET    /api/v1/sharing/shared-by-me                       - Get my shares
GET    /api/v1/sharing/check-permission/:resourceType/:id - Check permission
GET    /api/v1/sharing/activity/:resourceType/:id         - Get activity log
```

### Public Routes (No Authentication)

```
GET    /api/v1/sharing/public/:token                      - Access public resource
```

---

## 💡 Best Practices

### 1. **Always Check Permissions**
Before allowing actions, verify user permissions:

```typescript
const { data: permission } = useCheckPermissionQuery({
  resourceType: ResourceType.TASK,
  resourceId: task.id,
});

const canEdit = permission?.permissionLevel === PermissionLevel.EDITOR ||
                permission?.permissionLevel === PermissionLevel.ADMIN ||
                permission?.permissionLevel === PermissionLevel.OWNER;
```

### 2. **Use Permission Levels Appropriately**
- `VIEWER`: Default for public links and read-only sharing
- `EDITOR`: For active collaborators
- `ADMIN`: For team leads who need to invite others
- `OWNER`: Original creator only

### 3. **Handle Public Links Carefully**
- Always show clear indicators that content is publicly accessible
- Provide easy link revocation
- Consider adding expiration dates for sensitive content

### 4. **Provide User Feedback**
- Show loading states during share operations
- Display success/error messages clearly
- Update UI immediately after permission changes

---

## 🐛 Troubleshooting

### "Permission already exists"
**Solution:** User is already shared with. Use `updatePermission` instead.

### "You don't have permission to share"
**Solution:** Only resource owners and admins can share. Check permission level.

### "Public link not found"
**Solution:** Link may have been deleted or expired. Request new link.

### "Failed to share resource"
**Solution:** Check network connection and verify email format.

---

## 📚 Type Definitions

```typescript
enum ResourceType {
  NOTE = 'NOTE',
  TASK = 'TASK',
  EVENT = 'EVENT',
  FILE = 'FILE',
  FOLDER = 'FOLDER',
  CHAT = 'CHAT',
  COLUMN = 'COLUMN',
  KANBAN_BOARD = 'KANBAN_BOARD',
}

enum PermissionLevel {
  VIEWER = 'VIEWER',
  COMMENTER = 'COMMENTER',
  EDITOR = 'EDITOR',
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
}

enum ShareActivityType {
  SHARED = 'SHARED',
  PERMISSION_CHANGED = 'PERMISSION_CHANGED',
  PERMISSION_REVOKED = 'PERMISSION_REVOKED',
  ACCESSED = 'ACCESSED',
  DOWNLOADED = 'DOWNLOADED',
  EDITED = 'EDITED',
}
```

---

## 🎉 Summary

Yes! You can simply share a link and:
- ✅ Other users will see the resource in their "Shared with me" section
- ✅ They get real-time access based on permission level
- ✅ Public links work without authentication
- ✅ All changes are tracked and auditable

**Need help?** Check the code examples above or contact the dev team! 🚀

---

## 📋 Implementation Checklist

### Backend Setup
- [x] Prisma schema with Permission and ShareActivity models
- [x] Sharing controller with all endpoints
- [x] Sharing service with permission validation
- [x] Routes configuration (private + public)
- [x] Run migration: `npx prisma migrate dev --name add_sharing_system`

### Frontend Setup
- [x] Create `entities/sharing` with types, API, and slice
- [x] Add sharing routes to `ApiPaths`
- [x] Update RTK Query tags with 'Permissions'
- [x] Add `sharingReducer` to store
- [x] Create `ShareModal` component in `features/sharing`
- [x] Add styles for ShareModal

### Integration
- [ ] Add "Share" button to Tasks, Notes, Events, Files
- [ ] Create "Shared with me" page
- [ ] Add permission checks before edit/delete actions
- [ ] Create public resource viewer page (`/shared/:token`)
- [ ] Test all sharing scenarios

### Optional Enhancements
- [ ] Email notifications for sharing invitations
- [ ] Real-time collaboration indicators
- [ ] Batch sharing (multiple users at once)
- [ ] Advanced permission filters
- [ ] Sharing analytics dashboard

---

## 🔗 Related Documentation

- [Backend API Specification](./API_SPECIFICATION.md)
- [Permission System Architecture](./PERMISSION_ARCHITECTURE.md)
- [Frontend Component Guide](./FRONTEND_COMPONENTS.md)

---

**Version:** 1.0.0  
**Last Updated:** January 9, 2026  
**Maintainer:** Development Team
