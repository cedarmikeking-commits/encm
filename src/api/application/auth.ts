import { http } from "../http"
import { PageParams, ResPage } from "../type"
import { Authorization } from "./type"

export const queryPage = (params: PageParams): Promise<ResPage<Authorization>> => {
    return http.get('/blade-system/role/szxy/roleMenuList', params)
}

export const queryMenuTree = (clientId: string): Promise<any> => {
    return http.get('/blade-system/menu/grant-tree', { clientId })
}
export const queryMenuList = (clientId: string): Promise<any[]> => {
    return http.get('/blade-system/menu/szxy/allMenuList', { clientId })
}

export const saveOrUpdateAuthorization = (data: { id: string, menuId: string }[]): Promise<void> => {
    return http.post('/blade-system/role/szxy/roleMenuSubmit', data)
}

export const getAuthorizationDetail = (id: string): Promise<any> => {
    return http.get('/blade-system/role/szxy/roleMenuDetail', { id })
}

export const deleteAuthorization = (data: { id: string; clientId: string }): Promise<void> => {
    return http.post('/blade-system/role/szxy/roleMenuRemove', data)
}