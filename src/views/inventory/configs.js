const field = (prop, label, options = {}) => ({ prop, label, ...options })

const purchaseStatusOptions = [
  { label: '新建', value: 0 },
  { label: '已分配', value: 1 },
  { label: '已领取', value: 2 },
  { label: '已完成', value: 3 },
  { label: '有异常', value: 4 }
]

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
      field('skuId', 'SKU ID', { width: 110 }),
      field('skuName', 'SKU 名称', { minWidth: 180 }),
      field('wareId', '仓库 ID', { width: 110 }),
      field('stock', '库存数', { width: 100 }),
      field('stockLocked', '锁定库存', { width: 110 })
    ],
    searchFields: [
      field('skuName', 'SKU 名称'),
      field('skuId', 'SKU ID', { type: 'number', min: 0 }),
      field('wareId', '仓库 ID', { type: 'number', min: 0 })
    ],
    formFields: [
      field('skuId', 'SKU ID', { type: 'number', required: true }),
      field('skuName', 'SKU 名称', { required: true }),
      field('wareId', '仓库 ID', { type: 'number', required: true }),
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
    tableFields: [
      field('id', 'ID', { width: 90 }),
      field('assigneeName', '采购人', { minWidth: 120 }),
      field('phone', '联系方式', { minWidth: 130 }),
      field('priority', '优先级', { width: 90 }),
      field('status', '状态', { width: 90 }),
      field('wareId', '仓库 ID', { width: 110 }),
      field('amount', '总金额', { width: 120 }),
      field('createTime', '创建时间', { width: 170 }),
      field('updateTime', '更新时间', { width: 170 })
    ],
    searchFields: [
      field('assigneeName', '采购人'),
      field('status', '状态', { type: 'select', options: purchaseStatusOptions }),
      field('wareId', '仓库 ID', { type: 'number', min: 0 })
    ],
    formFields: [
      field('assigneeId', '采购人 ID', { type: 'number' }),
      field('assigneeName', '采购人'),
      field('phone', '联系方式'),
      field('priority', '优先级', { type: 'number', defaultValue: 0 }),
      field('status', '状态', { type: 'number', defaultValue: 0 }),
      field('wareId', '仓库 ID', { type: 'number' }),
      field('amount', '总金额', { type: 'number', precision: 2, defaultValue: 0 }),
      field('createTime', '创建日期', { type: 'datetime' }),
      field('updateTime', '更新日期', { type: 'datetime' })
    ]
  },
  purchasedetail: {
    title: '采购明细',
    resource: 'purchasedetail',
    infoKey: 'purchaseDetail',
    idField: 'id',
    nameField: 'id',
    tableFields: [
      field('id', 'ID', { width: 90 }),
      field('purchaseId', '采购单 ID', { width: 120 }),
      field('skuId', 'SKU ID', { width: 110 }),
      field('skuNum', '采购数量', { width: 110 }),
      field('skuPrice', '采购金额', { width: 120 }),
      field('wareId', '仓库 ID', { width: 110 }),
      field('status', '状态', { width: 90 })
    ],
    searchFields: [
      field('purchaseId', '采购单 ID', { type: 'number', min: 0 }),
      field('skuId', 'SKU ID', { type: 'number', min: 0 }),
      field('status', '状态', { type: 'select', options: purchaseStatusOptions }),
      field('wareId', '仓库 ID', { type: 'number', min: 0 })
    ],
    formFields: [
      field('purchaseId', '采购单 ID', { type: 'number' }),
      field('skuId', 'SKU ID', { type: 'number', required: true }),
      field('skuNum', '采购数量', { type: 'number', min: 0, defaultValue: 0 }),
      field('skuPrice', '采购金额', { type: 'number', precision: 2, defaultValue: 0 }),
      field('wareId', '仓库 ID', { type: 'number' }),
      field('status', '状态', { type: 'number', defaultValue: 0 })
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
      field('wareId', '仓库 ID', { width: 100 }),
      field('trackingNo', '物流单号', { minWidth: 150 }),
      field('createTime', '创建时间', { width: 170 })
    ],
    searchFields: [
      field('orderSn', '订单号'),
      field('consignee', '收货人'),
      field('taskStatus', '任务状态', { type: 'select', options: taskStatusOptions }),
      field('wareId', '仓库 ID', { type: 'number', min: 0 })
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
      field('wareId', '仓库 ID', { type: 'number' }),
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
      field('skuId', 'SKU ID', { width: 110 }),
      field('skuName', 'SKU 名称', { minWidth: 180 }),
      field('skuNum', '购买个数', { width: 110 })
    ],
    searchFields: [
      field('taskId', '工作单 ID', { type: 'number', min: 0 }),
      field('skuId', 'SKU ID', { type: 'number', min: 0 }),
      field('skuName', 'SKU 名称')
    ],
    formFields: [
      field('taskId', '工作单 ID', { type: 'number', required: true }),
      field('skuId', 'SKU ID', { type: 'number', required: true }),
      field('skuName', 'SKU 名称', { required: true }),
      field('skuNum', '购买个数', { type: 'number', min: 0, defaultValue: 0 })
    ]
  }
}
