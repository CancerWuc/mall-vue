const yesNoOptions = [
  { label: '否', value: 0 },
  { label: '是', value: 1 }
]

const showOptions = [
  { label: '隐藏', value: 0 },
  { label: '显示', value: 1 }
]

const publishOptions = [
  { label: '下架', value: 0 },
  { label: '上架', value: 1 }
]

const valueTypeOptions = [
  { label: '单值', value: 0 },
  { label: '多值', value: 1 }
]

const attrTypeOptions = [
  { label: '销售属性', value: 0 },
  { label: '基本属性', value: 1 },
  { label: '销售+基本', value: 2 }
]

const commentTypeOptions = [
  { label: '商品评价', value: 0 },
  { label: '回复评价', value: 1 }
]

const field = (prop, label, options = {}) => ({ prop, label, ...options })

export const productConfigs = {
  category: {
    title: '商品分类',
    resource: 'category',
    infoKey: 'category',
    idField: 'catId',
    nameField: 'name',
    tableFields: [
      field('catId', 'ID', { width: 90 }),
      field('name', '分类名称', { minWidth: 160 }),
      field('parentName', '父分类名称', { minWidth: 140 }),
      field('catLevel', '层级', { width: 80 }),
      field('showStatus', '显示', { width: 90, type: 'tag', options: showOptions }),
      field('sort', '排序', { width: 80 }),
      field('productUnit', '计量单位', { width: 110 }),
      field('productCount', '商品数量', { width: 110 })
    ],
    formFields: [
      field('name', '分类名称', { required: true }),
      field('parentCid', '父分类', { type: 'category' }),
      field('catLevel', '层级', { type: 'number', defaultValue: 1 }),
      field('showStatus', '是否显示', { type: 'switch', defaultValue: 1 }),
      field('sort', '排序', { type: 'number', defaultValue: 0 }),
      field('icon', '图标地址'),
      field('productUnit', '计量单位'),
      field('productCount', '商品数量', { type: 'number', defaultValue: 0 })
    ]
  },
  brand: {
    title: '品牌管理',
    resource: 'brand',
    infoKey: 'brand',
    idField: 'brandId',
    nameField: 'name',
    tableFields: [
      field('brandId', 'ID', { width: 90 }),
      field('logo', 'Logo', { width: 100, type: 'image' }),
      field('name', '品牌名', { minWidth: 150 }),
      field('firstLetter', '首字母', { width: 90 }),
      field('showStatus', '显示', { width: 90, type: 'tag', options: showOptions }),
      field('sort', '排序', { width: 80 }),
      field('descript', '介绍', { minWidth: 220, showOverflowTooltip: true })
    ],
    formFields: [
      field('name', '品牌名', { required: true }),
      field('logo', 'Logo', { type: 'oss-image', span: 2 }),
      field('firstLetter', '检索首字母'),
      field('showStatus', '是否显示', { type: 'switch', defaultValue: 1 }),
      field('sort', '排序', { type: 'number', defaultValue: 0 }),
      field('descript', '介绍', { type: 'textarea', span: 2 })
    ]
  },
  attrgroup: {
    title: '属性分组',
    resource: 'attrgroup',
    infoKey: 'attrGroup',
    idField: 'attrGroupId',
    nameField: 'attrGroupName',
    tableFields: [
      field('attrGroupId', 'ID', { width: 90 }),
      field('attrGroupName', '组名', { minWidth: 160 }),
      field('catelogName', '分类名称', { minWidth: 140 }),
      field('sort', '排序', { width: 80 }),
      field('icon', '图标', { minWidth: 180, showOverflowTooltip: true }),
      field('descript', '描述', { minWidth: 220, showOverflowTooltip: true })
    ],
    formFields: [
      field('attrGroupName', '组名', { required: true }),
      field('catelogId', '所属分类', { type: 'category' }),
      field('sort', '排序', { type: 'number', defaultValue: 0 }),
      field('icon', '组图标'),
      field('descript', '描述', { type: 'textarea', span: 2 })
    ]
  },
  attr: {
    title: '商品属性',
    resource: 'attr',
    infoKey: 'attr',
    idField: 'attrId',
    nameField: 'attrName',
    tableFields: [
      field('attrId', 'ID', { width: 90 }),
      field('attrName', '属性名', { minWidth: 150 }),
      field('catelogName', '分类名称', { minWidth: 140 }),
      field('attrType', '属性类型', { width: 120, type: 'tag', options: attrTypeOptions }),
      field('valueType', '值类型', { width: 90, type: 'tag', options: valueTypeOptions }),
      field('searchType', '检索', { width: 90, type: 'tag', options: yesNoOptions }),
      field('enable', '启用', { width: 90, type: 'tag', options: yesNoOptions }),
      field('showDesc', '快速展示', { width: 110, type: 'tag', options: yesNoOptions }),
      field('valueSelect', '可选值', { minWidth: 220, showOverflowTooltip: true })
    ],
    formFields: [
      field('attrName', '属性名', { required: true }),
      field('catelogId', '所属分类', { type: 'category' }),
      field('attrType', '属性类型', { type: 'select', options: attrTypeOptions, defaultValue: 1 }),
      field('valueType', '值类型', { type: 'select', options: valueTypeOptions, defaultValue: 0 }),
      field('searchType', '是否检索', { type: 'switch', defaultValue: 0 }),
      field('enable', '是否启用', { type: 'switch', defaultValue: 1 }),
      field('showDesc', '快速展示', { type: 'switch', defaultValue: 0 }),
      field('icon', '属性图标'),
      field('valueSelect', '可选值', { type: 'textarea', span: 2 })
    ]
  },
  attrattrgrouprelation: {
    title: '属性分组关联',
    resource: 'attrattrgrouprelation',
    infoKey: 'attrAttrgroupRelation',
    idField: 'id',
    tableFields: [
      field('id', 'ID', { width: 90 }),
      field('attrName', '属性名称', { minWidth: 150 }),
      field('attrGroupName', '分组名称', { minWidth: 150 }),
      field('attrSort', '排序', { width: 90 })
    ],
    formFields: [
      field('attrId', '属性名称', { type: 'attr', required: true, nameProp: 'attrName' }),
      field('attrGroupId', '分组名称', { type: 'attrgroup', required: true, nameProp: 'attrGroupName' }),
      field('attrSort', '排序', { type: 'number', defaultValue: 0 })
    ]
  },
  categorybrandrelation: {
    title: '分类品牌关联',
    resource: 'categorybrandrelation',
    infoKey: 'categoryBrandRelation',
    idField: 'id',
    tableFields: [
      field('id', 'ID', { width: 90 }),
      field('brandName', '品牌名称', { minWidth: 150 }),
      field('catelogName', '分类名称', { minWidth: 150 })
    ],
    formFields: [
      field('brandId', '品牌名称', { type: 'brand', required: true, nameProp: 'brandName' }),
      field('catelogId', '所属分类', { type: 'category', required: true, nameProp: 'catelogName' })
    ]
  },
  spuinfo: {
    title: 'SPU 管理',
    resource: 'spuinfo',
    infoKey: 'spuInfo',
    idField: 'id',
    nameField: 'spuName',
    tableFields: [
      field('id', 'ID', { width: 90 }),
      field('spuName', '商品名称', { minWidth: 180 }),
      field('catalogName', '分类名称', { minWidth: 140 }),
      field('brandName', '品牌名称', { minWidth: 140 }),
      field('weight', '重量', { width: 100 }),
      field('publishStatus', '状态', { width: 90, type: 'tag', options: publishOptions }),
      field('createTime', '创建时间', { width: 170 }),
      field('updateTime', '更新时间', { width: 170 })
    ],
    formFields: [
      field('spuName', '商品名称', { required: true }),
      field('catalogId', '所属分类', { type: 'category' }),
      field('brandId', '品牌名称', { type: 'brand', nameProp: 'brandName' }),
      field('weight', '重量', { type: 'number', precision: 2, defaultValue: 0 }),
      field('publishStatus', '上架状态', { type: 'select', options: publishOptions, defaultValue: 0 }),
      field('spuDescription', '商品描述', { type: 'textarea', span: 2 })
    ]
  },
  skuinfo: {
    title: 'SKU 管理',
    resource: 'skuinfo',
    infoKey: 'skuInfo',
    idField: 'skuId',
    nameField: 'skuName',
    tableFields: [
      field('skuId', 'ID', { width: 90 }),
      field('skuDefaultImg', '默认图', { width: 100, type: 'image' }),
      field('skuName', 'SKU 名称', { minWidth: 180 }),
      field('skuTitle', '标题', { minWidth: 200, showOverflowTooltip: true }),
      field('spuName', 'SPU 名称', { minWidth: 180 }),
      field('catalogName', '分类名称', { minWidth: 140 }),
      field('brandName', '品牌名称', { minWidth: 140 }),
      field('price', '价格', { width: 110 }),
      field('saleCount', '销量', { width: 90 })
    ],
    formFields: [
      field('skuName', 'SKU 名称', { required: true }),
      field('spuId', 'SPU 名称', {
        type: 'spu',
        nameProp: 'spuName',
        linkedFields: {
          catalogId: 'catalogId',
          catalogName: 'catalogName',
          brandId: 'brandId',
          brandName: 'brandName'
        }
      }),
      field('catalogId', '所属分类', { type: 'category', disabled: true }),
      field('brandId', '品牌名称', { type: 'brand', nameProp: 'brandName', disabled: true }),
      field('price', '价格', { type: 'number', precision: 2, defaultValue: 0 }),
      field('saleCount', '销量', { type: 'number', defaultValue: 0 }),
      field('skuDefaultImg', '默认图片', { type: 'oss-image', span: 2 }),
      field('skuTitle', '标题', { span: 2 }),
      field('skuSubtitle', '副标题', { span: 2 }),
      field('skuDesc', '介绍描述', { type: 'textarea', span: 2 })
    ]
  },
  productattrvalue: {
    title: 'SPU 属性值',
    resource: 'productattrvalue',
    infoKey: 'productAttrValue',
    idField: 'id',
    tableFields: [
      field('id', 'ID', { width: 90 }),
      field('spuName', 'SPU 名称', { minWidth: 180 }),
      field('attrName', '属性名', { minWidth: 150 }),
      field('attrValue', '属性值', { minWidth: 180, showOverflowTooltip: true }),
      field('attrSort', '排序', { width: 90 }),
      field('quickShow', '快速展示', { width: 110, type: 'tag', options: yesNoOptions })
    ],
    formFields: [
      field('spuId', 'SPU 名称', { type: 'spu', required: true, nameProp: 'spuName' }),
      field('attrId', '属性名', { type: 'attr', required: true, nameProp: 'attrName' }),
      field('attrValue', '属性值'),
      field('attrSort', '排序', { type: 'number', defaultValue: 0 }),
      field('quickShow', '快速展示', { type: 'switch', defaultValue: 0 })
    ]
  },
  skusaleattrvalue: {
    title: 'SKU 销售属性',
    resource: 'skusaleattrvalue',
    infoKey: 'skuSaleAttrValue',
    idField: 'id',
    tableFields: [
      field('id', 'ID', { width: 90 }),
      field('skuName', 'SKU 名称', { minWidth: 180 }),
      field('attrName', '属性名', { minWidth: 150 }),
      field('attrValue', '属性值', { minWidth: 180 }),
      field('attrSort', '排序', { width: 90 })
    ],
    formFields: [
      field('skuId', 'SKU 名称', { type: 'sku', required: true, nameProp: 'skuName' }),
      field('attrId', '属性名', { type: 'attr', required: true, nameProp: 'attrName' }),
      field('attrValue', '属性值'),
      field('attrSort', '排序', { type: 'number', defaultValue: 0 })
    ]
  },
  spucomment: {
    title: '商品评价',
    resource: 'spucomment',
    infoKey: 'spuComment',
    idField: 'id',
    nameField: 'spuName',
    tableFields: [
      field('id', 'ID', { width: 90 }),
      field('spuName', '商品名', { minWidth: 160 }),
      field('memberNickName', '会员昵称', { width: 130 }),
      field('star', '评分', { width: 80 }),
      field('showStatus', '显示', { width: 90, type: 'tag', options: showOptions }),
      field('likesCount', '点赞', { width: 90 }),
      field('replyCount', '回复', { width: 90 }),
      field('content', '内容', { minWidth: 260, showOverflowTooltip: true }),
      field('createTime', '创建时间', { width: 170 })
    ],
    formFields: [
      field('skuId', 'SKU 名称', { type: 'sku', nameProp: 'skuName' }),
      field('spuId', '商品名', { type: 'spu', nameProp: 'spuName' }),
      field('memberNickName', '会员昵称'),
      field('star', '评分', { type: 'number', defaultValue: 5 }),
      field('showStatus', '是否显示', { type: 'switch', defaultValue: 1 }),
      field('likesCount', '点赞数', { type: 'number', defaultValue: 0 }),
      field('replyCount', '回复数', { type: 'number', defaultValue: 0 }),
      field('commentType', '评价类型', { type: 'select', options: commentTypeOptions, defaultValue: 0 }),
      field('memberIp', '会员 IP'),
      field('memberIcon', '会员头像'),
      field('spuAttributes', '购买属性', { type: 'textarea', span: 2 }),
      field('resources', '资源地址', { type: 'textarea', span: 2 }),
      field('content', '评价内容', { type: 'textarea', span: 2 })
    ]
  },
  commentreplay: {
    title: '评价回复',
    resource: 'commentreplay',
    infoKey: 'commentReplay',
    idField: 'id',
    tableFields: [
      field('id', 'ID', { width: 90 }),
      field('commentContent', '评价内容', { minWidth: 220, showOverflowTooltip: true }),
      field('replyContent', '回复内容', { minWidth: 220, showOverflowTooltip: true })
    ],
    formFields: [
      field('commentId', '评价ID', { type: 'number', required: true }),
      field('replyId', '回复ID', { type: 'number', required: true })
    ]
  }
}
