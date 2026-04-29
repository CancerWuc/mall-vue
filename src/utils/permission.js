import { useUserStore } from '@/store/modules/user'

export function hasPermission(value) {
  const userStore = useUserStore()
  if (!value) return true
  if (Array.isArray(value)) {
    return value.some((p) => userStore.permissions.includes(p))
  }
  return userStore.permissions.includes(value)
}
