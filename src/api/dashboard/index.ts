import { http } from "../http"



/**
 * 
 * @returns 仪表盘-统计
 */
export const getHomeStatistics = (): Promise<any> => {
    return http.get('/blade-system/ybp/home/homeStatistics');
}