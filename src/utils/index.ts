import { CourseSystemAbility } from "@/types/framework";

/**
 * 数组转树形结构
 * @param data 原始扁平数组
 * @param idKey 节点 id 字段名
 * @param parentIdKey 父节点 id 字段名
 * @param childrenKey 子节点字段名
 * @returns 树形结构数组
 */
export const generateTreeData = (
  data: any[],
  idKey: string,
  parentIdKey: string,
  childrenKey: string
) => {
  const treeData: any[] = [];
  const record: { [key: string]: any } = {};

  data.forEach(item => {
    record[item[idKey]] = { ...item, [childrenKey]: [] };
  });

  data.forEach(item => {
    const parentId = item[parentIdKey];
    if (parentId && record[parentId]) {
      record[parentId][childrenKey].push(record[item[idKey]]);
    } else {
      treeData.push(record[item[idKey]]);
    }
  });

  return treeData;
};

/**
 * 返回所有节点从根到该节点的路径组合
 * @param data 原始扁平数组
 * @param idKey 节点 id 字段名
 * @param parentIdKey 父节点 id 字段名
 * @returns 路径组合数组，例如 [[root, a, leaf1], [root, b], ...]
 */
export const findAllParentCombinations = (
  data: any[],
  idKey: string,
  parentIdKey: string
): any[][] => {
  const record: Record<string | number, any> = {};
  data.forEach(item => {
    record[item[idKey]] = item;
  });

  // 记忆化每个节点的"从根到该节点"的路径
  const pathCache: Record<string | number, any[] | undefined> = {};

  const buildPath = (id: string | number): any[] => {
    const cached = pathCache[id];
    if (cached) return cached;

    const node = record[id];
    if (!node) return [];

    const parentId = node[parentIdKey];
    if (!parentId) {
      const path = [node];
      pathCache[id] = path;
      return path;
    }

    const parentPath = buildPath(parentId);
    const path = parentPath.length ? [...parentPath, node] : [node];
    pathCache[id] = path;
    return path;
  };

  const results: any[][] = [];
  data.forEach(item => {
    const id = item[idKey];
    if (item[parentIdKey] === '0') return;
    const path = buildPath(id);
    if (path.length) results.push(path);
  });

  return results;
};
/**
 * 将tree形结构转换为扁平数组
 * @param treeData 树形结构数组
 * @param childrenKey 子节点字段名
 * @returns 扁平数组
 */
export const flattenTreeData = (treeData: any[], childrenKey: string): any[] => {
  const results: any[] = [];

  const traverse = (nodes: any[]) => {
    nodes.forEach(node => {
      const { [childrenKey]: children, ...rest } = node;
      results.push(rest);
      if (children && children.length) {
        traverse(children);
      }
    });
  };

  traverse(treeData);

  return results;
};

/**
 * 根据key值查找节点
 * @param treeData 树形结构数组
 * @param key 查找的key值
 * @param keyName key字段名
 * @param childrenKey 子节点字段名
 * @returns 找到的节点或null
 */
export const findNodeByKey = (
  treeData: any[],
  key: string | number,
  keyName: string,
  childrenKey: string
): any | null => {
  let result: any | null = null;

  const traverse = (nodes: any[]) => {
    for (const node of nodes) {
      if (node[keyName] === key) {
        result = node;
        return;
      }
      if (node[childrenKey] && node[childrenKey].length) {
        traverse(node[childrenKey]);
        if (result) return;
      }
    }
  };

  traverse(treeData);

  return result;
};


/** 处理合并的行 */
export const calculateRowSpan = (abilities: CourseSystemAbility[]): CourseSystemAbility[] => {
  abilities.forEach(ability => {
    if (ability.oneMergeFlag) {
      //合并标识说明：1领域课程；2按照二级能力数合并
      //类别和数量都按照这个合并
      ability.rowSpan_1 = abilities.filter(item => item.abilityOneId === ability.abilityOneId).length;
      ability.rowSpan_3 = ability.rowSpan_1;
      ability.rowSpan_2 = 1;
    } else {
      let oneList = abilities.filter(item => item.abilityOneId === ability.abilityOneId);
      let num = 0;
      oneList.filter(item => !item.twoCareerCourseFlag).forEach(item => {
        num += item.courseNum;
      });
      ability.rowSpan_1 = oneList.filter(item => item.twoCareerCourseFlag).length + num;
      ability.rowSpan_2 = ability.twoCareerCourseFlag ? 1 : ability.courseNum;
      ability.rowSpan_3 = 1;
    }
  });
  //把标准课按照课程数量拆开，并且按照abilityOneCode，abilityTwoCode排序，保证同一类别的课程在一起
  let expandedList: CourseSystemAbility[] = [];
  abilities.forEach((ability, index) => {
    if (!ability.twoCareerCourseFlag && ability.courseNum > 1) {
      for (let i = 0; i < ability.courseNum; i++) {
        expandedList.push({ ...ability, key: index, inKey:i, courseNum: 1, courseCredit: ability.courseCredit / ability.courseNum, courseHour: ability.courseHour / ability.courseNum });
      }
    } else {
      expandedList.push({ ...ability, key: index });
    }
  });
  expandedList.sort((a, b) => {
    if (a.abilityOneCode === b.abilityOneCode) {
      return a.abilityTwoCode.localeCompare(b.abilityTwoCode);
    }
    return a.abilityOneCode.localeCompare(b.abilityOneCode);
  });
  //不展示的字段设置成0
  const processedOneId = new Set<string>();
  const processedTwoId = new Set<string>();
  expandedList.forEach(item => {
    if (!processedOneId.has(item.abilityOneCode)) {
      processedOneId.add(item.abilityOneCode);
    } else {
      if (item.oneMergeFlag) {
        item.rowSpan_3 = 0;
        item.courseHour = 0;
        item.courseCredit = 0;
        item.courseNum = 0;
      }
      item.rowSpan_1 = 0;
    }
    if (!processedTwoId.has(item.abilityTwoCode)) {
      processedTwoId.add(item.abilityTwoCode);
    } else {
      item.rowSpan_2 = 0;
    }


  });
  return expandedList;
}

/**
 * 获取资源类型对应的支持上传文件格式数组（用于Ant Design上传组件）
 * @param resourceType 资源类型：1-视频 2-文档 3-音频 4-图片 5-课件 6-其它
 * @returns 支持的文件格式数组，适用于Ant Design Upload组件的accept属性
 */
export const getResourceFormatByType = (resourceType: number | string): string[] => {
  const type = typeof resourceType === 'string' ? parseInt(resourceType) : resourceType;
  
  switch (type) {
    case 1: // 视频
      return ['.mp4'];//, '.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv', '.m4v'
    case 2: // 文档
      return ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
    case 3: // 音频
      return ['.mp3', '.wav'];//, '.aac', '.flac', '.m4a', '.ogg'
    case 4: // 图片
      return ['.jpg', '.png', '.jpeg', '.gif'];
    case 5: // 课件
      return ['.ppt', '.pptx'];
    case 6: // 其它
      return ['.zip', '.rar'];
    default:
      return [];
  }
}

/**
 * 根据文件扩展名或MIME类型判断资源类型
 * @param fileExtensionOrMimeType 文件扩展名（如'pdf', 'mp4'）或MIME类型（如'application/pdf', 'video/mp4'）
 * @returns 资源类型编号：1-视频 2-文档 3-音频 4-图片 5-课件 6-其它
 */
export const getResourceTypeByFile = (fileExtensionOrMimeType: string): any => {
  if (!fileExtensionOrMimeType) return 6; // 如果没有提供类型，默认为"其它"

  // 转换为小写进行比较
  const type = fileExtensionOrMimeType.toLowerCase();

  // 视频类型
  if ([
    'mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v',
    'video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm', 
    'video/flv', 'video/wmv', 'video/m4v', 'video/x-msvideo', 'video/quicktime'
  ].includes(type)) {
    return 1; // 视频
  }

  // 文档类型
  if ([
    'pdf', 'doc', 'docx', 'xls', 'xlsx',
    'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ].includes(type)) {
    return 2; // 文档
  }

  // 音频类型
  if ([
    'mp3', 'wav', 'aac', 'flac', 'm4a', 'ogg',
    'audio/mp3', 'audio/wav', 'audio/aac', 'audio/flac', 'audio/m4a', 'audio/ogg',
    'audio/mpeg'
  ].includes(type)) {
    return 3; // 音频
  }

  // 图片类型
  if ([
    'jpg', 'png', 'jpeg', 'gif',
    'image/jpg', 'image/png', 'image/jpeg', 'image/gif'
  ].includes(type)) {
    return 4; // 图片
  }

  // 课件类型
  if ([
    'ppt', 'pptx',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ].includes(type)) {
    return 5; // 课件
  }

  // 其它类型
  if (['zip', 'rar', 'application/zip'].includes(type)) {
    return 6; // 其它
  }

  // 默认返回"其它"类型
  return 6;
}

export default {
  calculateRowSpan,
  getResourceFormatByType,
  getResourceTypeByFile
};