import React, { useEffect, useRef, useState } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { RcFile, UploadProps } from 'antd/es/upload';
import type { UploadFile as AntdUploadFile } from 'antd/es/upload/interface';
import useOssUpload, { getResourceFiles, UploadData } from '@/hooks/useOssUpload';
interface UploadFileProps extends Partial<UploadProps> {
  multiple?: boolean;
  accept?: string;
  maxCount?: number;
  /** 上传完成回调，返回 useOssUpload 的 UploadData 列表 */
  onUploaded?: (data: UploadData[]) => void;
  onUploadError?: (err: Error) => void;
  /** 获取控制方法：cancel/pause/resume */
  getControl?: (ctrl: { cancel: () => void; pause: () => void; resume: () => void }) => void;
  customFileName?: string;
  showUploadList?: boolean;
  /**
   * 当用户从上传列表移除文件时触发；返回 true 表示允许移除，false 阻止移除。
   */
  onRemoveFile?: (data: UploadData, file: RcFile) => Promise<boolean> | boolean;
  uploadResIDs?: string;// 已上传资源ID字符串，逗号分隔
}

/**
 * - 使用 customRequest 调用 useOssUpload.uploadFiles
 * - 暴露简单的控制方法（取消/暂停/恢复）
 */
const UploadFile: React.FC<UploadFileProps> = ({
  multiple = false,
  accept,
  maxCount,
  onUploaded,
  onUploadError,
  getControl,
  customFileName,
  showUploadList = true,
  onRemoveFile,
  children,
  uploadResIDs,
  ...rest
}) => {
  const { uploadFiles, cancelUpload, pauseUpload, resumeUpload, uploading, progress, error } = useOssUpload();

  // 批量上传所需的本地状态与引用
  const [fileListState, setFileListState] = useState<AntdUploadFile[]>([]);
  const [fileUploadList, setFileUploadList] = useState<UploadData[]>([]);
  const pendingRef = useRef<Array<{ file: File; options: any; uid: string }>>([]);
  const activeOptionsRef = useRef<any[]>([]); // 当前正在上传的 options，用于 progress 回调
  const batchUploadingRef = useRef(false);

  // 将控制方法通过回调暴露给父组件（可选）
  useEffect(() => {
    if (getControl) {
      getControl({
        cancel: () => cancelUpload(),
        pause: () => pauseUpload(),
        resume: () => resumeUpload(),
      });
    }

  }, []);
  useEffect(() => {
        //存在已上传资源ID时，初始化已上传文件列表
    if (uploadResIDs) {
      getResourceFiles(uploadResIDs.split(',')).then((res) => {
        if (res) {
          const files: UploadData[] = res;
          const list =files.map((file:any): UploadData=> {
            return {
              key:file.id,
              Location:file.signUrl,
              file:new File([], file.originalName),
              resourceId:file.id,
              filePath:file.resourceName,
            }
          });
          setFileUploadList(list);
          // 初始化 fileListState 以显示在上传列表中
          const initialFileList = files.map((file: any) => {
            file.uid = file.id || String(Math.random());
            file.key = file.id;
            return ({
            uid: file.id || String(Math.random()),
            name: file.originalName,
            status: 'done',
            response: file,
            url: file.signUrl,
            preview: file.signUrl,
          } as AntdUploadFile);}
        );
          setFileListState(initialFileList);

          if (onUploaded) onUploaded(list);
        }
      });
    }
  },[uploadResIDs]);

  // 如果 hook 报错，通知上层
  useEffect(() => {
    if (error && onUploadError) onUploadError(error);
  }, [error, onUploadError]);

  // customRequest 实现（改为收集多次 customRequest 调用并批量上传）
  const customRequest: UploadProps['customRequest'] = (options) => {
    const { file } = options as any;
    const rcFile = file as RcFile;
    const uid = `tmp_${Date.now()}_${Math.random().toString(16).slice(2)}`;

    // 如果 maxCount === 1，则直接替换已有文件：清空 fileListState 和 pending 列表，允许继续添加
    if (typeof maxCount === 'number' && maxCount === 1) {
      pendingRef.current = [];
      setFileListState([]);
      setFileUploadList([]);
    }
    // respect maxCount: 当前列表（已上传+待上传）不能超过 maxCount
    if (typeof maxCount === 'number' && maxCount > 1) {
      const currentTotal = fileListState.length + pendingRef.current.length;
      if (currentTotal >= maxCount) {
        const err = new Error(`最多只能上传 ${maxCount} 个文件`);
        if (options && typeof options.onError === 'function') {
          try { options.onError(err); } catch (_) { }
        }
        message.warning(err.message);
        return;
      }
    }

    // 保存 pending 信息，稍后批量上传时使用
    pendingRef.current.push({ file: rcFile, options, uid });

    // 在 UI 中先显示一个临时 uploading 条目
    const tempFile: AntdUploadFile = {
      uid,
      name: rcFile.name,
      status: 'uploading',
      percent: 0,
    } as AntdUploadFile;
    setFileListState(prev => [...prev, tempFile]);

    // 微任务触发批量上传，合并短时间内连续触发的 customRequest
    Promise.resolve().then(() => {
      (async () => {
        if (batchUploadingRef.current) return;
        if (pendingRef.current.length === 0) return;
        batchUploadingRef.current = true;

        const batch = pendingRef.current.splice(0);
        // 激活的 options，用于 progress 回调
        activeOptionsRef.current = batch.map(b => b.options);
        try {
          const files = batch.map(b => b.file);
          const results = await uploadFiles(files);

          // results 对应 files 顺序，逐个触发对应 options 的 onSuccess
          results.forEach(res => {
            // 找到对应的 pending 项（按 reference 匹配）
            const matched = batch.find(b => b.file === res.file);
            if (matched) {
              const opts = matched.options;
              if (opts.onSuccess) opts.onSuccess(res, matched.file as any);
              // 更新 fileListState：把临时 uid 替换为正式条目
              setFileListState(prev => {
                const withoutTemp = prev.filter(p => p.uid !== matched.uid);
                const newFile: AntdUploadFile = {
                  uid: res.key || String(Math.random()),
                  name: res.file.name,
                  status: 'done',
                  response: res,
                  url: res.Location,
                  preview: res.Location,
                };
                return [...withoutTemp, newFile];
              });
            }
          });
          let list = [...fileUploadList, ...results];
          setFileUploadList(list);
          if (onUploaded) onUploaded(list);
        } catch (err: any) {
          const e = err instanceof Error ? err : new Error(String(err));
          // 批量失败时，按文件调用 onError 并更新 UI 状态
          batch.forEach(b => {
            const opts = b.options;
            if (opts.onError) opts.onError(e);
          });
          setFileListState(prev => prev.map(p => p.uid && p.uid.toString().startsWith('tmp_') ? { ...p, status: 'error' } : p));
          if (onUploadError) onUploadError(e);
          message.error(e.message || '批量上传失败');
        } finally {
          activeOptionsRef.current = [];
          batchUploadingRef.current = false;
        }
      })();
    });
  };

  // 当用户在 Upload 列表中移除文件时调用：
  // - 如果提供了 onRemoveFile 回调，会先调用该回调并等待其返回值（支持 Promise）
  // - 返回 true/false 告知 antd 是否从列表中移除该文件
  const handleRemove: UploadProps['onRemove'] = async (file) => {
    try {
      const af = file as AntdUploadFile;
      const resp = af.response as UploadData | undefined;
      if (resp && typeof onRemoveFile === 'function') {
        const allow = await onRemoveFile(resp, file as RcFile);
        if (!allow) {
          message.info('取消删除');
          return false;
        }
      }

      const next = fileListState.filter(f => f.uid !== af.uid);
      setFileListState(next);
      const nextUploadList = fileUploadList.filter(f => f.key !== resp?.key);
      setFileUploadList(nextUploadList);
      if (onUploaded) {
        onUploaded(nextUploadList);
      }
      return true;
    } catch (e: any) {
      message.error(e?.message || '移除文件时发生错误');
      return false;
    }
  };

  // 把进度回调到 antd（仅在上传中起作用）
  const progressRef = useRef<number>(0);
  useEffect(() => {
    if (uploading && progress !== progressRef.current) {
      // antd 的 Upload 期望的进度单位是 0-100
      progressRef.current = progress;
      // 把全局进度回调给当前活跃的每一个 options（有限的替代 per-file 进度）
      activeOptionsRef.current.forEach((opts) => {
        if (opts && opts.onProgress) {
          try { opts.onProgress({ percent: progress }, opts.file); } catch (_) { }
        }
      });
      // 也更新临时 fileList 的 percent
      setFileListState(prev => prev.map(f => f.uid && f.uid.toString().startsWith('tmp_') ? { ...f, percent: progress } : f));
    }
  }, [progress, uploading]);

  // 点击预览处理
  const handlePreview: UploadProps['onPreview'] = async (file) => {
    try {
      const resp = (file as AntdUploadFile).response as UploadData | undefined;
      const url = resp?.Location || (file as AntdUploadFile).url || (file as AntdUploadFile).thumbUrl;
      if (!url) {
        message.info('该文件暂无可预览的地址');
        return;
      }
      // 打开新窗口/标签预览
      window.open(url as string, '_blank');
    } catch (e: any) {
      message.error(e?.message || '预览文件时发生错误');
    }
  };

  return (
    <Upload.Dragger
      accept={accept}
      multiple={multiple}
      maxCount={maxCount}
      showUploadList={showUploadList}
      customRequest={customRequest}
      fileList={fileListState}
      onRemove={handleRemove}
      onPreview={handlePreview}
      {...rest}
    >
      {children ? (
        // 渲染 props 的 children
        children
      ) : (
        <Button icon={<UploadOutlined />} disabled={uploading}>
          {uploading ? `上传中 ${progress}%` : '点击上传'}
        </Button>
      )}
    </Upload.Dragger>
  );
};

export default UploadFile;
