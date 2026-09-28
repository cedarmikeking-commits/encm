import { useState, useCallback } from 'react';
import COS from 'cos-js-sdk-v5';
import { http } from '@/api/http';
// 定义授权信息类型
interface AuthInfo {
    // 桶编码
    ossCode: string;
    //region
    endpoint: string;
    //sts临时key
    accessKeyId: string;
    //sts临时secret
    accessKeySecret: string;
    //安全token
    securityToken: string;
    //桶名称
    bucketName: string;
    //资源key规则 资源类型 1 = file 一般文件(pdf,doc,excel,txt等) 2 = pic 图片文件 3 = veo 视频文件 4 =auo 音频文件
    resourceRule: any;
}

// 定义上传结果类型
export interface UploadData {
    key: string;//文件再cos上的key，唯一标识
    file: File;
    filePath: string; // 文件在 COS 上的路径
    Location: string; // 文件在 COS 上的完整路径
    resourceId: string;    // 文件的资源Id值
    taskId?: string; // 上传任务 ID
}

/**
 * 定义返回结果类型
 *
 * */

interface UseOssUploadReturn {
    uploadFiles: (file: File[]) => Promise<UploadData[]>;
    cancelUpload: () => void;
    pauseUpload: () => void;
    resumeUpload: () => void;
    uploading: boolean;
    progress: number;
    error: Error | null;
}

// 深圳协议使用osscode值，注每：个系统可能不同，请修改；或者后面沟通统一服务端来处理
// const SZXY_OSS_CODE = 'cos-accessories';
const SZXY_OSS_CODE = 'cos-application'; //注册系统使用的ossCode
/**
 * 从接口获取初始化数据
 */
const fetchAuthInfoByApi = async (): Promise<AuthInfo> => {
    const response = await http.get(`/blade-resource/resource/resourceFile/accessTencent?ossCode=${SZXY_OSS_CODE}`);
    return response;
};
/** 保存资源文件信息 */
const saveResourceFile = async (data: any): Promise<any> => {
    const response = await http.post(`/blade-resource/resource/resourceFile/save`, data);
    return response;
};
// /** 读预留地址 */
export const getResourceFiles = async (ids: any): Promise<any> => {
    const response = await http.post(`/blade-resource/resource/resourceFile/resourceGetByIds`, ids);
    return response;
};
//资源key规则 资源类型 1 = file 一般文件(doc,excel,txt等) 2 = pic 图片文件 3 = veo 视频文件 4 =auo 音频文件 5= compress压缩包 6 pdf文件
//转换文件类型对应的目录
const fileTypeToDirMap: Record<number, string> = {
    1: 'documents',
    2: 'images',
    3: 'videos',
    4: 'audios',
};
/**
 * 根据目录值查找对应的类型ID
 * @param dir 目录值（如 'videos'）
 * @param map 类型映射表
 * @returns 对应的ID（如 3），未找到则返回 undefined
 */
const getTypeIdByDir = (
    dir: string,
    map: Record<number, string>
): number => {
    // 遍历对象的键值对，找到值匹配的键
    const entries = Object.entries(map);
    for (const [key, value] of entries) {
        if (value === dir) {
            return Number(key); // 键是字符串类型，转换为number
        }
    }
    return 1; // 未找到对应值
};
/**
 * 根据文件返回文件类型
 * @param file 上传的文件对象
 * @returns 目录名称（如：PDF、Images、Videos等）
 */
const generateTypeDir = (file: File): string => {
    // --- 1. 定义文件类型与目录的映射关系 ---
    const defaultTypeMap: Record<string, string> = {
        // 文档类
        'application/pdf': 'documents',
        'application/msword': 'documents',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'documents',
        'application/vnd.ms-excel': 'documents',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'documents',
        'application/vnd.ms-powerpoint': 'documents',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'documents',
        // 图片类
        'image/jpeg': 'images',
        'image/png': 'images',
        'image/gif': 'images',
        'image/webp': 'images',
        'image/svg+xml': 'images',
        // 视频类
        'video/mp4': 'videos',
        'video/mpeg': 'videos',
        'video/quicktime': 'videos',
        // 音频类
        'audio/mpeg': 'audios',
        'audio/wav': 'audios',
        'audio/mp3': 'audios',
        // 压缩包
        'application/zip': 'documents',
        'application/x-rar-compressed': 'documents',
        'application/x-7z-compressed': 'documents',
    };


    // --- 2. 确定文件类型目录 ---
    let typeDir = 'others'; // 默认目录（未知类型）
    // 优先通过MIME类型匹配
    if (defaultTypeMap[file.type]) {
        typeDir = defaultTypeMap[file.type];
    } else {
        // 如果MIME类型未匹配，尝试通过文件扩展名匹配（作为降级方案）
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext) {
            // 手动映射常见扩展名（可根据需求扩展）
            const extMap: Record<string, string> = {
                pdf: 'documents',
                doc: 'documents',
                docx: 'documents',
                xls: 'documents',
                xlsx: 'documents',
                ppt: 'documents',
                pptx: 'documents',
                jpg: 'images',
                jpeg: 'images',
                png: 'images',
                gif: 'images',
                webp: 'images',
                svg: 'images',
                mp4: 'videos',
                mp3: 'audios',
                wav: 'audios',
                zip: 'documents',
                rar: 'documents',
            };
            typeDir = extMap[ext] || 'others';
        }
    }
    return typeDir;
}

/**
 * 根据文件类型生成存储路径（格式：文件类型目录/YYYYMMDD/文件名）
 * @param file 上传的文件对象
 * @returns 完整存储路径（如：PDF/20251111/1731324678901.pdf）
 */
const generateStoragePath = (
    file: File,
    auth: AuthInfo
): string => {
    // --- 1. 生成文件类型目录 ---
    const typeDir = generateTypeDir(file);
    // --- 4. 处理文件名（避免特殊字符+加时间戳防重名）---
    const timestamp = Date.now(); // 毫秒级时间戳
    const fileName = file.name;
    const uniqueFileName = `${timestamp}-${fileName}`; // 加时间戳确保唯一

    // --- 5. 组合完整路径 ---
    let num = getTypeIdByDir(typeDir, fileTypeToDirMap);
    return `${auth.resourceRule[num]}/${uniqueFileName}`;
};


/**
 * 腾讯云 OSS 上传 Hook
 * @param options 配置选项
 * @returns 上传相关方法和状态
 */
const useOssUpload = (): UseOssUploadReturn => {
    const [uploading, setUploading] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [error, setError] = useState<Error | null>(null);
    const [authInfo, setAuthInfo] = useState<AuthInfo>({} as AuthInfo)
    const [uploadData, setUpLoadData] = useState<UploadData[]>([]);

    const ensureAuth = async (): Promise<AuthInfo> => {
        if (authInfo && Object.keys(authInfo).length > 0) return authInfo;
        const newAuth = await fetchAuthInfoByApi();
        setAuthInfo(newAuth);
        return newAuth;
    };

    const getCosInstance = (() => {
        let instance: any = null;
        return async (auth: AuthInfo) => {
            if (!instance) {
                if (!auth) throw new Error('无法获取授权信息');
                const startTime = Math.floor(Date.now() / 1000);
                instance = new COS({
                    getAuthorization: async (_, callback) => {
                        try {
                            callback({
                                TmpSecretId: auth.accessKeyId,
                                TmpSecretKey: auth.accessKeySecret,
                                SecurityToken: auth.securityToken,
                                StartTime: startTime,
                                ExpiredTime: startTime + 1800,
                                ScopeLimit: true,
                            });
                        } catch (e) {
                            console.error('getAuthorization failed:', e);
                            callback({ TmpSecretId: '', TmpSecretKey: '', SecurityToken: '', StartTime: 0, ExpiredTime: 0, ScopeLimit: true });
                        }
                    }
                });
            }
            return instance;
        };
    })();

    const getFileList = (files: File[], newData: UploadData[], auth: AuthInfo) => {
        const fileList = files.map((file) => {
            const key = generateStoragePath(file, auth);
            newData.push({
                file: file,
                filePath: '',
                Location: '',
                resourceId: '',
                key: key
            });
            return {
                Bucket: auth.bucketName,
                Region: auth.endpoint,
                Key: key,
                Body: file,
                onTaskReady: (taskId: string) => {
                    console.log(taskId);
                    setUpLoadData(prev => {
                        const newData = [...prev];
                        const index = newData.findIndex(item => item.key === key);
                        if (index !== -1) {
                            newData[index].taskId = taskId;
                        }
                        return newData;
                    });
                },
            }
        });
        return fileList;
    }

    /**
     * 上传文件到 OSS
     * @param files 要上传的文件列表
     * @param customFileName 自定义文件名，不提供则使用原文件名
     * @returns 上传后的文件 URL
     */
    const uploadFiles = useCallback(async (
        files: File[]
    ): Promise<UploadData[]> => {
        if (files.length === 0) {
            throw new Error('请选择文件');
        }
        setUploading(true);
        setProgress(0);
        setError(null);
        setUpLoadData([]);
        try {
            const auth = await ensureAuth();
            return await new Promise((resolve, reject) => {
                const newData: UploadData[] = [];
                getCosInstance(auth).then((cos: any) => {
                    cos.uploadFiles({
                        files: getFileList(files, newData, auth),
                        //大于5MB 分片上传
                        SliceSize: 1024 * 1024 * 5,
                        onProgress: (progressData: any) => {
                            const percent = Math.round(progressData.percent * 100);
                            setProgress(percent);
                        },
                    }, async (err: any, data: any) => {
                        setUploading(false);
                        if (err) {
                            const error = err instanceof Error ? err : new Error('上传过程中发生错误');
                            setError(error);
                            reject(error);
                            return;
                        }
                        let errorFlag: boolean = false;
                        data.files.forEach((file: any) => {
                            if (file.error) {
                                errorFlag = true;
                            }
                        });
                        if (errorFlag) {
                            const error = new Error('上传过程中发生错误');
                            setError(error);
                            reject(error);
                            return;
                        }

                        // 使用 data 更新上传结果并等待所有 saveResourceFile 完成再 resolve
                        const savePromises = data.files.map(async (f: any) => {
                            const matchedKey = f.options.Key;
                            const item = newData.find(nd => nd.key === matchedKey);
                            if (!item) return;
                            // 保存到本地数据库，再返回给调用者
                            const fileType = generateTypeDir(item.file);
                            const resourceData = {
                                ossCode: SZXY_OSS_CODE,
                                resourceName: matchedKey,
                                resourceType: getTypeIdByDir(fileType, fileTypeToDirMap),
                                extensionName: fileType,
                                originalName: item.file.name,
                                resourceSize: item.file.size,
                            };
                            const saveData = await saveResourceFile(resourceData);
                            // //再读取
                            // const resourceFileUrlData = await getResourceFileUrl([saveData.id]);
                            item.filePath = matchedKey;
                            item.Location = saveData.signUrl;
                            item.resourceId = saveData.id;
                        });
                        try {
                            await Promise.all(savePromises);
                            setUpLoadData(newData);
                            resolve(newData);
                        } catch (e) {
                            const error = e instanceof Error ? e : new Error('保存资源信息失败');
                            setError(error);
                            reject(e);
                        }
                    });
                }).catch((e) => {
                    setUploading(false);
                    const error = e instanceof Error ? e : new Error('初始化COS实例失败');
                    setError(error);
                    reject(error);
                });
            });
        } catch (err) {
            setUploading(false);
            const error = err instanceof Error ? err : new Error('获取授权信息失败');
            setError(error);
            throw error;
        }
    }, [authInfo]);

    /**
     * 取消上传
     */
    const cancelUpload = useCallback(() => {
        getCosInstance(authInfo).then((cos: any) => {
            uploadData.forEach(item => {
                if (item.taskId) {
                    cos.cancelTask(item.taskId);
                }
            });
        }).catch(() => {
            // ignore
        });
        setUploading(false);
        setProgress(0);
        setError(null);
    }, [uploadData, authInfo]);

    /** 暂停上传 */
    const pauseUpload = useCallback(() => {
        getCosInstance(authInfo).then((cos: any) => {
            uploadData.forEach(item => {
                if (item.taskId) {
                    cos.pauseTask(item.taskId);
                }
            });
        }).catch(() => {
            // ignore
        });
    }, [uploadData, authInfo]);

    /** 恢复上传 */
    const resumeUpload = useCallback(() => {
        getCosInstance(authInfo).then((cos: any) => {
            uploadData.forEach(item => {
                if (item.taskId) {
                    cos.restartTask(item.taskId);
                }
            });
        }).catch(() => {
            // ignore
        });
    }, [uploadData, authInfo]);

    return {
        uploadFiles,
        cancelUpload,
        pauseUpload,
        resumeUpload,
        uploading,
        progress,
        error
    };
};

export default useOssUpload;
