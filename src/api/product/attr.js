//引入二次封装的axios
import request from '@/utils/request'
const API_NAME = '/admin/product'
export default {
    /* 
        通过三个指定id获取属性列表
        GET /admin/product/attrInfoList/{category1Id}/{category2Id}/{category3Id}
    */
    getAttrList(category1Id, category2Id, category3Id) {
        return request.get(`${API_NAME}/attrInfoList/${category1Id}/${category2Id}/${category3Id}`)
    },

    /* 
        根据属性id获取属性列表---数组
        GET /admin/product/getAttrValueList/{attrId}
    */
    getAttrValueList(attrId) {
        return request.get(`${API_NAME}/getAttrValueList/${attrId}`)
    },

    /* 
         根据属性id删除属性
         DELETE /admin/product/deleteAttr/{attrId}
    */
    deleteAttrById(attrId) {
        return request.delete(`${API_NAME}/deleteAttr/${attrId}`)
    },

    /* 
        增加或修改平台属性---参数attr为对象
        POST /admin/product/saveAttrInfo
    */
    saveOrUpdateAttr(attr) {
        return request.post(`${API_NAME}/saveAttrInfo`, attr)
    }

}