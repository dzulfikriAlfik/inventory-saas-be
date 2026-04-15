# Engineering Standards

## Mandatory

- Every function must have a doc block.
- No magic strings.
- No repeated domain literals.
- Prefer TypeScript.
- Prefer `as const` objects or enums.
- Keep controllers thin.
- Keep components thin.
- Validate at boundaries.
- Test behavior changes.

## Recommended literal patterns

```ts
export const RequestStatus = {
  Idle: 'idle',
  Loading: 'loading',
  Success: 'success',
  Error: 'error',
} as const;

export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus];
```

```ts
export enum UserRole {
  Admin = 'admin',
  Member = 'member',
}
```
