//引入二次封装的axios
import request from '@/utils/request'
//当前api接口函数中前面的共同地址
const API_NAME = '/admin/product/baseTrademark'

export default {
    //根据id获取某个品牌信息数据对象
    getTrademarkById(id) {
        return request({
            url: `${API_NAME}/get/${id}`,
            method: 'GET',
        })
        // 等价于return request.get(`${API_NAME}/get/${id}`)
    },
    //获取品牌信息列表，无参数
    getTrademarks() {
        return request({
            url: `${API_NAME}/getTrademarkList`,
            method: 'GET',
        })
        // return request.get(`${API_NAME}/getTrademarkList`)
    },
    //根据品牌的id删除对应的某个品牌信息数据
    deleteTrademarkById(id) {
        return request({
            url: `${API_NAME}/remove/${id}`,
            method: 'DELETE',
        })
        // request.delete(`${API_NAME}/remove/${id}`)
    },
    //增加一个品牌信息数据
    addTrademark(trademark) {
        return request({
            url: `${API_NAME}/save`,
            method: 'POST',
            data: trademark
        })
        // request.post(`${API_NAME}/save`,trademark)
    },
    //根据品牌的id修改某个品牌信息数据
    updateTrademark(trademark) {
        return request({
            url: `${API_NAME}/update`,
            method: 'PUT',
            data: trademark
        })
        // request.put(`${API_NAME}/update`,trademark)
    },
    //根据页码和每页条数获取品牌信息列表数据
    getTrademarkList(page, limit) {
        if (page && limit) {
            return request({
                url: `${API_NAME}/${page}/${limit}`,
                method: 'GET',
            })
        } else {
            return request({
                url: `${API_NAME}/getTrademarkList`,
                method: 'GET',
            })
        }
        // request.get(`${API_NAME}/${page}/${limit}`)
    }

}
