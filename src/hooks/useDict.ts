import { useState, useEffect, useCallback, useMemo } from 'react';

import { http } from '@/api/http';

// 字典项类型
export type DictItem = {
  key: string | number;
  label: string;
  [key: string]: any; // 支持扩展字段
};

// 字典缓存格式（包含时间戳，可选过期策略）
type DictCache = {
  data: Record<string, DictItem[]>; // 字典数据：{ 类型: 列表 }
  timestamp: number; // 缓存时间戳
};
// 缓存键名（避免与其他存储冲突）
const DICT_CACHE_KEY = 'szxy_dict_cache';
// 缓存有效期（可选，这里设为12小时，单位：毫秒）
const CACHE_EXPIRE = 12 * 60 * 60 * 1000;
//资源状态
const resource_status = [
  { key: 0, label: '待审核', value: 0 },
  { key: 1, label: '已提交', value: 1 },
  { key: 2, label: '已发布', value: 2 }
];

//课程内容状态
const course_content_status = [
  { key: 0, label: '未开发', value: 0 },
  { key: 1, label: '草稿', value: 1 },
  { key: 2, label: '已发布', value: 2 }
];
/**
 * 从接口获取字典数据（固定接口）
 * @param types 字典类型数组
 * @returns 接口返回的字典数据 { 类型: 列表 }
 */
const fetchDictsByApi = async (types: string[]): Promise<Record<string, DictItem[]>> => {
  if (types.length === 0) return {};
  const response = await http.get(`/blade-system/dict/dictionary-map?types=${types.join(',')}`);
  // 接口返回格式：{  gender: [...], status: [...]  }

  return response;
};

/**
 * 从localStorage读取缓存
 * @returns 有效的缓存数据（未过期且存在）
 */
const getDictCache = (): Record<string, DictItem[]> => {
  const cacheStr = localStorage.getItem(DICT_CACHE_KEY);
  if (!cacheStr) return {};

  try {
    const cache: DictCache = JSON.parse(cacheStr);
    // 检查是否过期
    if (Date.now() - cache.timestamp > CACHE_EXPIRE) {
      localStorage.removeItem(DICT_CACHE_KEY); // 过期则清除缓存
      return {};
    }
    return cache.data;
  } catch (e) {
    console.error('解析字典缓存失败', e);
    localStorage.removeItem(DICT_CACHE_KEY);
    return {};
  }
};

/**
 * 更新localStorage缓存
 * @param newData 新获取的字典数据（{ 类型: 列表 }）
 */
const updateDictCache = (newData: Record<string, DictItem[]>) => {
  const existingCache = getDictCache();
  // 合并新数据到现有缓存（新数据覆盖旧数据）
  const updatedData = { ...existingCache, ...newData };
  const cache: DictCache = {
    data: updatedData,
    timestamp: Date.now(),
  };
  localStorage.setItem(DICT_CACHE_KEY, JSON.stringify(cache));
};

/**
 * 字典Hook
 * @param types 字典类型（单个字符串或字符串数组）
 * @returns 字典数据及操作方法
 */
export function useDict(types: string | string[]) {
  // 标准化类型为数组（支持单个类型传入）
  const dictTypes = useMemo(() => (Array.isArray(types) ? types : [types]), [types]);

  // 从缓存初始化字典数据
  const [dictMap, setDictMap] = useState<Record<string, DictItem[]>>(() => {
    const cache = getDictCache();
    // 只保留当前需要的类型（避免缓存中无关数据占用内存）
    return dictTypes.reduce(
      (acc, type) => {
        if (type == 'resource_status') acc[type] = resource_status;
        if (cache[type]) acc[type] = cache[type];
        return acc;
      },
      {} as Record<string, DictItem[]>
    );
  });

  // 过滤出需要请求的类型（缓存中不存在的）
  const typesToFetch = useMemo(
    () => dictTypes.filter((type) => !dictMap[type]),
    [dictTypes, dictMap]
  );

  // 加载字典（仅请求需要的类型）
  useEffect(() => {
    if (typesToFetch.length === 0) return;

    let isMounted = true;

    fetchDictsByApi(typesToFetch)
      .then((newData) => {
        if (!isMounted) return;
        if (Object.keys(newData).length > 0) {
          // 更新内存中的字典数据
          setDictMap((prev) => ({ ...prev, ...newData }));
          // 更新缓存
          updateDictCache(newData);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        throw new Error(err instanceof Error ? err.message : '获取字典失败');
      })
      .finally(() => {
        if (!isMounted) return;
      });

    return () => {
      isMounted = false; // 组件卸载后停止更新状态
    };
  }, [typesToFetch]);

  /**
   * 获取指定类型的字典列表
   * @param type 字典类型
   * @returns 字典列表（默认空数组）
   */
  const getDict = useCallback((type: string): DictItem[] => dictMap[type] || [], [dictMap]);

  /**
   * 根据类型和key获取label
   */
  const getLabel = useCallback(
    (type: string, key: string | number, defaultValue = ''): string => {
      const items = getDict(type);
      const item = items.find((item) => item.key === key);
      return item?.label ?? defaultValue;
    },
    [getDict]
  );

  /**
   * 根据类型和label获取key
   */
  const getKey = useCallback(
    (type: string, label: string, defaultValue: string | number = ''): string | number => {
      const items = getDict(type);
      const item = items.find((item) => item.label === label);
      return item?.key ?? defaultValue;
    },
    [getDict]
  );

  /**
   * 格式化为Select组件的options格式
   */
  const formatOptions = useCallback(
    (type: string, valueKey: keyof DictItem = 'key', labelKey: keyof DictItem = 'label') =>
      getDict(type).map((item) => ({
        ...item,
        value: item[valueKey],
        label: item[labelKey],
      })),
    [getDict]
  );

  /**
   * 强制刷新指定字典类型（忽略缓存）
   * @param types 要刷新的类型（默认当前传入的类型）
   */
  const refreshDict = useCallback(
    async (types?: string | string[]) => {
      const typesToRefresh = types ? (Array.isArray(types) ? types : [types]) : dictTypes;

      try {
        const newData = await fetchDictsByApi(typesToRefresh);
        setDictMap((prev) => ({ ...prev, ...newData }));
        updateDictCache(newData); // 更新缓存
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : '刷新字典失败');
      }
    },
    [dictTypes]
  );

  return {
    // 工具方法
    getDict,
    getLabel,
    getKey,
    formatOptions,
    // 主动刷新方法
    refreshDict,
  };
}

//用例：
//1、 const { loading, error, formatOptions } = useDict('gender');
// 格式化选项给Select组件
//   return <Select options={formatOptions('gender')} placeholder="请选择性别" />;

//2、 同时加载 'status' 和 'priority' 两个字典
//   const { getLabel, getDict } = useDict(['status', 'priority']);
//   // 获取状态为 'active' 的label
//   const activeLabel = getLabel('status', 'active', '未知状态');

//   // 获取优先级列表
//   const priorityList = getDict('priority');
//   return (
//     <div>
//       <p>活跃状态显示：{activeLabel}</p>
//       <ul>
//         {priorityList.map(item => (
//           <li key={item.key}>{item.label}</li>
//         ))}
//       </ul>
//     </div>
//   );
