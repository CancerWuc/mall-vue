import { defineStore } from 'pinia'
import { login as loginApi, getInfo, logout as logoutApi } from '@/api/auth'
import { getToken, setToken, removeToken } from '@/utils/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken() || '',
    userInfo: null,
    permissions: [],
    menuTree: []
  }),
  getters: {
    isLogin: (state) => !!state.token,
    name: (state) => state.userInfo?.username || ''
  },
  actions: {
    async login(form) {
      const res = await loginApi(form)
      this.token = res.token
      setToken(res.token)
      return res
    },
    async fetchInfo() {
      const res = await getInfo()
      this.userInfo = res.user
      this.permissions = res.permissions || []
      this.menuTree = res.menuTree || []
      return res
    },
    async logout() {
      try {
        await logoutApi()
      } catch (e) {
        // ignore
      }
      this.resetState()
    },
    resetState() {
      this.token = ''
      this.userInfo = null
      this.permissions = []
      this.menuTree = []
      removeToken()
    }
  }
})
