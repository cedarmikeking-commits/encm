import { useState, useEffect, useCallback, useMemo } from 'react';

import { http } from '@/api/http';

// 缓存键名（避免与其他存储冲突）
const CAREER_TREE_CACHE = 'career_tree_cache';
// 缓存有效期（可选，这里设为12小时，单位：毫秒）
const CACHE_EXPIRE = 12 * 60 * 60 * 1000;

// 领域类型
export type careerTree = {
  id: number;
  label: string;
  name:string;
  parentId: number;
  code?:string
  children?: careerTree[];
};

// 领域缓存格式（包含时间戳，可选过期策略）
type CareerTreeCache = {
  data: careerTree[]; // 领域数据：{ 类型: 列表 }
  timestamp: number; // 缓存时间戳
};

/**
 * 从接口获取领域数据（固定接口）
 * @returns 接口返回的领域数据 { 类型: 列表 }
 */
const fetchCareerTreeByApi = async (): Promise<careerTree[]> => {
  const response = await http.get(`/blade-system/hyly/career/industryWithCareerTreeByAuth`);
  return response;
};

/**
 * 从localStorage读取缓存
 * @returns 有效的缓存数据（未过期且存在）
 */
const getCareerTreeCache = (): careerTree[] => {
  const cacheStr = localStorage.getItem(CAREER_TREE_CACHE);
  if (!cacheStr) return [];

  try {
    const cache: CareerTreeCache = JSON.parse(cacheStr);
    // 检查是否过期
    if (Date.now() - cache.timestamp > CACHE_EXPIRE) {
      localStorage.removeItem(CAREER_TREE_CACHE); // 过期则清除缓存
      return [];
    }
    return cache.data;
  } catch (e) {
    console.error('解析字典缓存失败', e);
    localStorage.removeItem(CAREER_TREE_CACHE);
    return [];
  }
};

/**
 * 更新localStorage缓存
 * @param newData 新获取的字典数据（{ 类型: 列表 }）
 */
const updateDictCache = (newData: careerTree[]) => {
  // 合并新数据到现有缓存（新数据覆盖旧数据）
  const updatedData = [...newData];
  const cache: CareerTreeCache = {
    data: updatedData,
    timestamp: Date.now(),
  };
  localStorage.setItem(CAREER_TREE_CACHE, JSON.stringify(cache));
};


/**
 * 用户拥有的职业领域Hook
 * @returns 领域数据及操作方法
 */
export function useCareerTree() {
  // 从缓存初始化领域数据

  const [tree, setTree] = useState<careerTree[]>(() => {
    const cache = getCareerTreeCache();
    return cache;
  });
  // 缓存中不存在则需要请求数据
  const toFeach = useMemo(
    () => tree.length === 0,
    [tree]
  );
  // 加载数据
  useEffect(() => {
    if (toFeach) {
     featchCareerTree();
    }
  }, [toFeach]);

  const featchCareerTree = useCallback(async () => {
    try {
      const newData = await fetchCareerTreeByApi();
      setTree(newData);
      // 更新缓存
      updateDictCache(newData);
    }
    catch (err) {
      throw new Error(err instanceof Error ? err.message : '获取领域数据失败');
    }
  }, []);

const prefetchCareerTree = async (): Promise<void> => {
  try {
    const cache = getCareerTreeCache();
    if (cache && cache.length > 0) return;
    const newData = await fetchCareerTreeByApi();
    setTree(newData);
    updateDictCache(newData);
  } catch (err) {
    // 忽略预取错误，页面内使用 hook 时会再尝试
    // console.warn('prefetchCareerTree failed', err);
  }
};
  //树转list
  const treeToList = useCallback((tree: careerTree[] = []) => {
    const list: careerTree[] = [];
    tree.map((item: careerTree) => {
      if (item.children) {
        list.push(...treeToList(item.children));
      }
      list.push(item);
      return '';
    });
    // 返回结果
    return list;
  }, []);

  /**
   * 获取领域树列表
   * @returns 领域树列表（默认空数组）
   */
  const getCareerTree = useCallback((): careerTree[] => tree || [], [tree]);

  /**
   * 获取指定id的标签
   */
  const getLabel = useCallback(
    (key: string | number, defaultValue = ''): string => {
      const list = treeToList(getCareerTree());
      const k = Number(key);
      const item = list.find((item: careerTree) => Number(item.id) === k);
      return item?.label ?? item?.name ?? defaultValue;
    },
    [getCareerTree, treeToList]
  );
  /**
   * 获取指定id的父节点
   */
  const getParent = useCallback(
    (key: string | number): careerTree | null => {
      const list = treeToList(getCareerTree());
      const k = Number(key);
      const item = list.find((item: careerTree) => Number(item.id) === k);
      if (item) {
        const parent = list.find((parentItem: careerTree) => Number(parentItem.id) === Number(item.parentId));
        return parent || null;
      }
      return null;
    },
    [getCareerTree, treeToList]
  );
  const featchCareerTreeNoCache = async () => {
    try {
      return await fetchCareerTreeByApi();
    }
    catch (err) {
      throw new Error(err instanceof Error ? err.message : '获取领域数据失败');
    }
  };
  return {
    prefetchCareerTree,
    getCareerTree,
    getLabel,
    getParent,
    featchCareerTreeNoCache
  };
}
