import { useUserStore } from '@/store/modules/user'

export default {
  mounted(el, binding) {
    const { value } = binding
    if (!value) return
    const userStore = useUserStore()
    const required = Array.isArray(value) ? value : [value]
    const has = required.some((p) => userStore.permissions.includes(p))
    if (!has) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}
