const field = (prop, label, options = {}) => ({ prop, label, ...options })

const purchaseStatusOptions = [
  { label: '新建', value: 0 },
  { label: '已分配', value: 1 },
  { label: '已领取', value: 2 },
  { label: '已完成', value: 3 },
  { label: '有异常', value: 4 }
]

const priorityOptions = [
  { label: '低', value: 0 },
  { label: '中', value: 1 },
  { label: '高', value: 2 },
  { label: '紧急', value: 3 }
]

const purchaseStatusTagMap = { 0: 'info', 1: 'primary', 2: 'warning', 3: 'success', 4: 'danger' }
const priorityTagMap = { 0: 'info', 1: 'primary', 2: 'warning', 3: 'danger' }

const taskStatusOptions = [
  { label: '新建', value: 0 },
  { label: '已锁定', value: 1 },
  { label: '已解锁', value: 2 },
  { label: '已扣减', value: 3 }
]

export const wareConfigs = {
  waresku: {
    title: '商品库存',
    resource: 'waresku',
    infoKey: 'wareSku',
    idField: 'id',
    nameField: 'skuName',
    tableFields: [
      field('id', 'ID', { width: 90 }),
      field('skuId', 'SKU 名称', { type: 'sku', minWidth: 200 }),
      field('wareId', '仓库', { type: 'ware', minWidth: 160 }),
      field('stock', '库存数', { width: 100 }),
      field('stockLocked', '锁定库存', { width: 110 })
    ],
    searchFields: [
      field('skuName', 'SKU 名称'),
      field('skuId', 'SKU', { type: 'sku' }),
      field('wareId', '仓库', { type: 'ware' })
    ],
    formFields: [
      field('skuId', 'SKU', { type: 'sku', required: true, nameProp: 'skuName' }),
      field('skuName', 'SKU 名称', { required: true, disabled: true }),
      field('wareId', '仓库', { type: 'ware', required: true }),
      field('stock', '库存数', { type: 'number', min: 0, defaultValue: 0 }),
      field('stockLocked', '锁定库存', { type: 'number', min: 0, defaultValue: 0 })
    ]
  },
  wareinfo: {
    title: '仓库信息',
    resource: 'wareinfo',
    infoKey: 'wareInfo',
    idField: 'id',
    nameField: 'name',
    tableFields: [
      field('id', 'ID', { width: 90 }),
      field('name', '仓库名', { minWidth: 160 }),
      field('address', '仓库地址', { minWidth: 240 }),
      field('areacode', '区域编码', { minWidth: 140 })
    ],
    searchFields: [
      field('name', '仓库名'),
      field('areacode', '区域编码')
    ],
    formFields: [
      field('name', '仓库名', { required: true }),
      field('address', '仓库地址', { span: 2 }),
      field('areacode', '区域编码')
    ]
  },
  purchase: {
    title: '采购单',
    resource: 'purchase',
    infoKey: 'purchase',
    idField: 'id',
    nameField: 'id',
    rowActions: [
      { label: '查看明细', navigate: '/inventory/purchase-detail', queryKey: 'purchaseId' },
      {
        label: '完成采购单',
        type: 'confirm-action',
        condition: (row) => row.status < 3,
        confirmTitle: '确认完成',
        confirmMessage: (row) => `确认完成采购单 #${row.id}？完成后所有明细将自动入库，操作不可撤销。`,
        api: { base: 'ware', path: (row) => `purchase/complete/${row.id}` },
        successMessage: '采购完成，库存已更新'
      }
    ],
    tableFields: [
      field('id', 'ID', { width: 90 }),
      field('assigneeName', '采购人', { minWidth: 120 }),
      field('phone', '联系方式', { minWidth: 130 }),
      field('priority', '优先级', { type: 'tag', width: 90, options: priorityOptions, tagColorMap: priorityTagMap }),
      field('status', '状态', { type: 'tag', width: 90, options: purchaseStatusOptions, tagColorMap: purchaseStatusTagMap }),
      field('wareId', '仓库', { type: 'ware', minWidth: 150 }),
      field('amount', '总金额', { width: 120 }),
      field('detailCount', '明细数', { width: 90 }),
      field('createTime', '创建时间', { width: 170 }),
      field('updateTime', '更新时间', { width: 170 })
    ],
    searchFields: [
      field('assigneeName', '采购人'),
      field('status', '状态', { type: 'select', options: purchaseStatusOptions }),
      field('wareId', '仓库', { type: 'ware' })
    ],
    formFields: [
      field('assigneeId', '采购人', { type: 'sysuser', required: true, nameProp: 'assigneeName', linkedFields: { phone: 'mobile' } }),
      field('assigneeName', '采购人名', { disabled: true }),
      field('phone', '联系方式', { disabled: true }),
      field('priority', '优先级', { type: 'select', options: priorityOptions, defaultValue: 0 }),
      field('status', '状态', { type: 'select', options: purchaseStatusOptions, defaultValue: 0, disabled: true }),
      field('wareId', '仓库', { type: 'ware' }),
      field('amount', '总金额', { type: 'number', precision: 2, defaultValue: 0 })
    ]
  },
  purchasedetail: {
    title: '采购明细',
    resource: 'purchasedetail',
    infoKey: 'purchaseDetail',
    idField: 'id',
    nameField: 'id',
    toolbarActions: [
      {
        label: '合并生成采购单',
        requireSelection: true,
        type: 'form-dialog',
        title: '合并生成采购单',
        fields: [
          { prop: 'wareId', label: '仓库', type: 'ware', required: true },
          { prop: 'priority', label: '优先级', type: 'select', options: priorityOptions, defaultValue: 0 }
        ],
        api: { base: 'ware', path: 'purchase/merge', selectionKey: 'detailIds' },
        successMessage: '采购单生成成功',
        afterSuccess: { navigate: '/inventory/purchase' }
      }
    ],
    tableFields: [
      field('id', 'ID', { width: 90 }),
      field('purchaseId', '采购单 ID', { width: 120 }),
      field('skuId', 'SKU 名称', { type: 'sku', minWidth: 200 }),
      field('skuNum', '采购数量', { width: 110 }),
      field('skuPrice', '采购金额', { width: 120 }),
      field('wareId', '仓库', { type: 'ware', minWidth: 150 }),
      field('status', '状态', { type: 'tag', width: 90, options: purchaseStatusOptions, tagColorMap: purchaseStatusTagMap })
    ],
    searchFields: [
      field('purchaseId', '采购单', { type: 'purchase' }),
      field('skuId', 'SKU', { type: 'sku' }),
      field('status', '状态', { type: 'select', options: purchaseStatusOptions }),
      field('wareId', '仓库', { type: 'ware' }),
      field('hasNoPurchase', '仅看未分配', { type: 'switch' })
    ],
    formFields: [
      field('purchaseId', '采购单', { type: 'purchase', required: false, linkedFields: { wareId: 'wareId' }, preserveLinkedFieldsOnEmpty: true }),
      field('skuId', 'SKU', { type: 'sku', required: true }),
      field('skuNum', '采购数量', { type: 'number', min: 0, defaultValue: 0 }),
      field('skuPrice', '采购金额', { type: 'number', precision: 2, defaultValue: 0 }),
      field('wareId', '仓库', { type: 'ware' }),
      field('status', '状态', { type: 'select', options: purchaseStatusOptions, defaultValue: 0 })
    ]
  },
  wareordertask: {
    title: '库存工作单',
    resource: 'wareordertask',
    infoKey: 'wareOrderTask',
    idField: 'id',
    nameField: 'orderSn',
    tableFields: [
      field('id', 'ID', { width: 90 }),
      field('orderId', '订单 ID', { width: 110 }),
      field('orderSn', '订单号', { minWidth: 160 }),
      field('consignee', '收货人', { minWidth: 100 }),
      field('consigneeTel', '收货电话', { minWidth: 130 }),
      field('paymentWay', '付款方式', { width: 100 }),
      field('taskStatus', '任务状态', { width: 100 }),
      field('wareId', '仓库', { type: 'ware', minWidth: 150 }),
      field('trackingNo', '物流单号', { minWidth: 150 }),
      field('createTime', '创建时间', { width: 170 })
    ],
    searchFields: [
      field('orderSn', '订单号'),
      field('consignee', '收货人'),
      field('taskStatus', '任务状态', { type: 'select', options: taskStatusOptions }),
      field('wareId', '仓库', { type: 'ware' })
    ],
    formFields: [
      field('orderId', '订单 ID', { type: 'number' }),
      field('orderSn', '订单号', { required: true }),
      field('consignee', '收货人'),
      field('consigneeTel', '收货电话'),
      field('deliveryAddress', '配送地址', { span: 2 }),
      field('orderComment', '订单备注', { type: 'textarea', span: 2 }),
      field('paymentWay', '付款方式', { type: 'number', defaultValue: 1 }),
      field('taskStatus', '任务状态', { type: 'number', defaultValue: 0 }),
      field('orderBody', '订单描述', { type: 'textarea', span: 2 }),
      field('trackingNo', '物流单号'),
      field('createTime', '创建时间', { type: 'datetime' }),
      field('wareId', '仓库', { type: 'ware' }),
      field('taskComment', '工作单备注', { type: 'textarea', span: 2 })
    ]
  },
  wareordertaskdetail: {
    title: '工作单明细',
    resource: 'wareordertaskdetail',
    infoKey: 'wareOrderTaskDetail',
    idField: 'id',
    nameField: 'skuName',
    tableFields: [
      field('id', 'ID', { width: 90 }),
      field('taskId', '工作单 ID', { width: 120 }),
      field('skuId', 'SKU 名称', { type: 'sku', minWidth: 200 }),
      field('skuNum', '购买个数', { width: 110 })
    ],
    searchFields: [
      field('taskId', '工作单 ID', { type: 'number', min: 0 }),
      field('skuId', 'SKU', { type: 'sku' }),
      field('skuName', 'SKU 名称')
    ],
    formFields: [
      field('taskId', '工作单 ID', { type: 'number', required: true }),
      field('skuId', 'SKU', { type: 'sku', required: true, nameProp: 'skuName' }),
      field('skuName', 'SKU 名称', { required: true, disabled: true }),
      field('skuNum', '购买个数', { type: 'number', min: 0, defaultValue: 0 })
    ]
  }
}
