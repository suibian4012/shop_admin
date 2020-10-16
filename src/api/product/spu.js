//引入二次封装的axios
import request from '@/utils/request'
const API_NAME = '/admin/product'
export default {
    //获取所有销售属性数据，无参
    getBaseSaleAttrList() {
        return request.get(`${API_NAME}/baseSaleAttrList`)
    },
    //根据spuId删除对应的spuInfo对象
    deleteSpuById(spuId) {
        return request.delete(`${API_NAME}/deleteSpu/${spuId}`)
    },
    //根据spuId获取spuInfo对象
    getSpuInfoById(spuId) {
        return request.get(`${API_NAME}/getSpuById/${spuId}`)
    },
    //增加或修改spuInfo对象
    saveOrUpdateSpuInfo(spuInfo) {
        return request.post(`${API_NAME}/${spuInfo.id ? 'update' : 'save'}SpuInfo`, spuInfo)
    },
    //根据页码及每页条数和三级分类id获取对应页码中的条数的spu信息数据
    getSpuInfoList(page, limit, category3Id) {
        return request.get(`${API_NAME}/${page}/${limit}`, { params: { category3Id } })
    }

}
