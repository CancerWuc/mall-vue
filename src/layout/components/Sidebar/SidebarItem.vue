<template>
  <template v-if="hasOneVisibleChild && !item.meta?.alwaysShow">
    <el-menu-item :index="onlyChildPath">
      <el-icon v-if="onlyIcon"><component :is="onlyIcon" /></el-icon>
      <template #title>
        <span>{{ onlyTitle }}</span>
      </template>
    </el-menu-item>
  </template>
  <el-sub-menu v-else :index="resolvePath()">
    <template #title>
      <el-icon v-if="item.meta?.icon"><component :is="item.meta.icon" /></el-icon>
      <span>{{ item.meta?.title }}</span>
    </template>
    <SidebarItem
      v-for="child in visibleChildren"
      :key="child.path"
      :item="child"
      :base-path="resolvePath(child.path)"
    />
  </el-sub-menu>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: { type: Object, required: true },
  basePath: { type: String, default: '' }
})

const visibleChildren = computed(
  () => (props.item.children || []).filter((c) => !c.meta?.hidden)
)

const hasOneVisibleChild = computed(() => {
  if (!props.item.children) return true
  return visibleChildren.value.length <= 1
})

const onlyChild = computed(() => visibleChildren.value[0] || props.item)
const onlyChildPath = computed(() => {
  if (!props.item.children) return props.basePath
  return resolvePath(onlyChild.value.path)
})
const onlyTitle = computed(() => onlyChild.value.meta?.title || props.item.meta?.title)
const onlyIcon = computed(() => onlyChild.value.meta?.icon || props.item.meta?.icon)

function resolvePath(p) {
  const target = typeof p === 'string' ? p : props.item.path
  if (target?.startsWith('/')) return target
  if (props.basePath?.endsWith('/')) return props.basePath + target
  return props.basePath ? `${props.basePath}/${target}` : '/' + target
}
</script>
