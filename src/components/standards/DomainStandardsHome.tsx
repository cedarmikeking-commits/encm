import React, { useState, useEffect, useRef } from 'react';
import { Spin, message } from 'antd';
import { Search, ChevronDown, ChevronUp, X } from 'lucide-react';
import { careerTree, useCareerTree } from '@/hooks/useCareerTree';
import { getCareerStatus, getCareerSystemLevelList } from '@/api/courseSystemLevel';
import { CourseSystemLevel, IndustryCategory, IndustryConfigStatus } from '@/types/framework';

const INDUSTRY_STATUS_DOT: Record<IndustryConfigStatus, { color: string; label: string }> = {
  0: { color: '#d9d9d9', label: '未配置' },
  1: { color: '#1677ff', label: '配置中' },
  2: { color: '#52c41a', label: '已发布' },
};

interface Props {
  onStartConfig: (industry: IndustryCategory | null, courseSystemLevel: CourseSystemLevel) => void;
  initialIndustry?: IndustryCategory | null;
  onIndustryChange?: (industry: IndustryCategory | null) => void;
}

const STATUS_CONFIG = {
  0: {
    label: '未配置',
    tagBg: '#f5f5f5',
    tagColor: '#8c8c8c',
    tagBorder: '#d9d9d9',
    showProgress: false,
    btnLabel: '设置框架',
    cardBorder: '#e8e8e8',
  },
  1: {
    label: '配置中',
    tagBg: '#e6f4ff',
    tagColor: '#1677ff',
    tagBorder: '#91caff',
    showProgress: true,
    btnLabel: '查看/编辑详情',
    cardBorder: '#1677ff',
  },
  2: {
    label: '已发布',
    tagBg: '#f6ffed',
    tagColor: '#52c41a',
    tagBorder: '#b7eb8f',
    showProgress: true,
    btnLabel: '查看框架详情',
    cardBorder: '#b7eb8f',
  },
};

const STATUS_ACCENT_COLORS: Record<string, string> = {
  0: '#8c8c8c',
  1: '#1677ff',
  2: '#52c41a',
};

const DomainStandardsHome: React.FC<Props> = ({ onStartConfig, initialIndustry, onIndustryChange }) => {
  const [loading, setLoading] = useState(false);
  const [levels, setLevels] = useState<CourseSystemLevel[]>([]);
  const [industries, setIndustries] = useState<IndustryCategory[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryCategory | null>(initialIndustry ?? null);
  const [searchText, setSearchText] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { featchCareerTreeNoCache } = useCareerTree();

  const handleSelectIndustry = (industry: IndustryCategory | null) => {
    setSelectedIndustry(industry);
    onIndustryChange?.(industry);
  };

  useEffect(() => {
      fetchIndustries();
  }, []);

  useEffect(() => {
    if (selectedIndustry) {
      fetchLevelStats(selectedIndustry);
    } else {
      setLevels([]);
    }
  }, [selectedIndustry]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setSearchText('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchIndustries = async () => {
    setLoading(true);
    const enriched =await featchCareerTreeNoCache();
    let treeData: careerTree[] = [];
    //取出所有三级数据
    enriched.forEach((one) => {
      if (one.children) {
        one.children.forEach((two) => {
          if (two.children) {
            treeData.push(...two.children);
          }
        });
      }
    })
    let IndustryCategoryList: IndustryCategory[] = [];
    //取对应状态
    getCareerStatus({ careerIds: treeData.map(item => item.id).join(',') }).then((res) => {
      treeData.forEach((item) => {
        //取出对应的一二级名称
        let parentName = '';
        let grandparentName = '';
        enriched.forEach((one) => {
          if (one.children) {
            one.children.forEach((two) => {
              if (two.id === item.parentId) {
                parentName = two.name;
                grandparentName = one.name;
                return;
              }
            });
          }
        });
        IndustryCategoryList.push({
          ...item,
          configStatus: res[item.id] as IndustryConfigStatus,
          parentName,
          grandparentName
        });
      })
      setIndustries(IndustryCategoryList);
    }).catch((err) => {
      message.error('获取职业领域数据失败:' + err.response?.data?.message || err.message || '未知错误');
    }).finally(() => {
      setLoading(false);
    });

  };

  const fetchLevelStats = async (industry: IndustryCategory) => {
    setLoading(true);
    getCareerSystemLevelList({ careerId: industry.id }).then((res) => {
      setLevels(res);
    }).catch((err) => {
      message.error('获取职业领域数据失败:' + err.response?.data?.message || err.message || '未知错误');
    }).finally(() => {
      setLoading(false);
    })
  }

  const filteredIndustries = industries.filter(i =>
    i.name.includes(searchText)
  );

  const grouped: Record<string, { parentName: string; items: IndustryCategory[] }[]> = {};
  filteredIndustries.forEach(i => {
    if (!grouped[i.grandparentName]) grouped[i.grandparentName] = [];
    let group = grouped[i.grandparentName].find(g => g.parentName === i.parentName);
    if (!group) {
      group = { parentName: i.parentName, items: [] };
      grouped[i.grandparentName].push(group);
    }
    group.items.push(i);
  });

  const grandparentNames = Object.keys(grouped);
  const PREVIEW_COUNT = 10;
  const recentItems = industries.slice(0, PREVIEW_COUNT);

  return (
    <div>
      {/* Industry Selector */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e8e8e8',
          borderRadius: 12,
          padding: '20px 24px',
          marginBottom: 24,
          boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>职业领域</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
              <span style={{ fontSize: 12, color: '#666' }}>选择职业领域查看对应课程框架</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {([0, 1, 2] as IndustryConfigStatus[]).map(s => (
                  <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: INDUSTRY_STATUS_DOT[s].color,
                      display: 'inline-block',
                      boxShadow: s !== 0 ? `0 0 0 2px ${INDUSTRY_STATUS_DOT[s].color}33` : 'none',
                    }} />
                    <span style={{ fontSize: 11, color: '#595959' }}>{INDUSTRY_STATUS_DOT[s].label}</span>
                  </span>
                ))}
              </span>
            </div>
          </div>
          {selectedIndustry && (
            <button
              onClick={() => handleSelectIndustry(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 12px',
                borderRadius: 20,
                border: '1px solid #d9d9d9',
                background: '#fafafa',
                color: '#595959',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              <X size={12} />
              清除选择
            </button>
          )}
        </div>

        {/* Selected display */}
        {selectedIndustry && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              background: '#e6f4ff',
              borderRadius: 8,
              border: '1px solid #91caff',
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#1677ff',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 13, color: '#595959' }}>
              {selectedIndustry.grandparentName}
              <span style={{ margin: '0 6px', color: '#ccc' }}>/</span>
              {selectedIndustry.parentName}
              <span style={{ margin: '0 6px', color: '#ccc' }}>/</span>
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1677ff' }}>{selectedIndustry.name}</span>
            <span
              style={{
                marginLeft: 4,
                fontSize: 11,
                color: '#91caff',
                background: '#f0f7ff',
                border: '1px solid #bae0ff',
                borderRadius: 4,
                padding: '1px 6px',
              }}
            >
              {selectedIndustry.code}
            </span>
          </div>
        )}

        {/* Quick pill selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {(expanded ? industries : recentItems).map(ind => {
            const dot = INDUSTRY_STATUS_DOT[ind.configStatus];
            const isSelected = selectedIndustry?.id === ind.id;
            return (
              <button
                key={ind.id}
                onClick={() => {
                  handleSelectIndustry(isSelected ? null : ind);
                  setDropdownOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 20,
                  border: `1px solid ${isSelected ? '#1677ff' : '#e8e8e8'}`,
                  background: isSelected ? '#e6f4ff' : '#fafafa',
                  color: isSelected ? '#1677ff' : '#595959',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontWeight: isSelected ? 600 : 400,
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#91caff';
                    e.currentTarget.style.color = '#1677ff';
                    e.currentTarget.style.background = '#f0f7ff';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#e8e8e8';
                    e.currentTarget.style.color = '#595959';
                    e.currentTarget.style.background = '#fafafa';
                  }
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: dot.color,
                    flexShrink: 0,
                    display: 'inline-block',
                    boxShadow: ind.configStatus !== 0 ? `0 0 0 2px ${dot.color}33` : 'none',
                  }}
                />
                {ind.name}
              </button>
            );
          })}

          {/* Expand/collapse */}
          {industries.length > PREVIEW_COUNT && (
            <button
              onClick={() => setExpanded(v => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '5px 14px',
                borderRadius: 20,
                border: '1px dashed #d9d9d9',
                background: 'transparent',
                color: '#8c8c8c',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {expanded ? '收起' : `更多 (${industries.length - PREVIEW_COUNT})`}
            </button>
          )}

          {/* Advanced dropdown search */}
          <div ref={dropdownRef} style={{ position: 'relative', marginLeft: 'auto' }}>
            <button
              onClick={() => { setDropdownOpen(v => !v); setSearchText(''); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 14px',
                borderRadius: 20,
                border: '1px solid #d9d9d9',
                background: dropdownOpen ? '#f0f7ff' : '#fff',
                color: '#595959',
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Search size={14} />
              搜索领域
            </button>

            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  width: 380,
                  background: '#fff',
                  border: '1px solid #e8e8e8',
                  borderRadius: 10,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  zIndex: 1000,
                  overflow: 'hidden',
                }}
              >
                {/* Search input */}
                <div style={{ padding: '12px 14px', borderBottom: '1px solid #f0f0f0' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '7px 12px',
                      background: '#f5f5f5',
                      borderRadius: 8,
                    }}
                  >
                    <Search size={14} color="#aaa" />
                    <input
                      autoFocus
                      value={searchText}
                      onChange={e => setSearchText(e.target.value)}
                      placeholder="搜索职业领域名称或代码..."
                      style={{
                        border: 'none',
                        background: 'transparent',
                        outline: 'none',
                        flex: 1,
                        fontSize: 13,
                        color: '#1a1a1a',
                      }}
                    />
                    {searchText && (
                      <X
                        size={14}
                        color="#aaa"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSearchText('')}
                      />
                    )}
                  </div>
                </div>

                {/* Results */}
                <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                  {grandparentNames.length === 0 ? (
                    <div style={{ padding: '24px 0', textAlign: 'center', color: '#aaa', fontSize: 13 }}>
                      未找到相关领域
                    </div>
                  ) : (
                    grandparentNames.map(gpName => (
                      <div key={gpName}>
                        <div
                          style={{
                            padding: '8px 14px 4px',
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#aaa',
                            letterSpacing: 0.5,
                            textTransform: 'uppercase',
                            background: '#fafafa',
                            borderBottom: '1px solid #f5f5f5',
                          }}
                        >
                          {gpName}
                        </div>
                        {grouped[gpName].map(group => (
                          <div key={group.parentName}>
                            <div
                              style={{
                                padding: '6px 14px 3px 20px',
                                fontSize: 11,
                                color: '#bbb',
                                fontWeight: 600,
                              }}
                            >
                              {group.parentName}
                            </div>
                            {group.items.map(ind => (
                              <div
                                key={ind.id}
                                onClick={() => {
                                  handleSelectIndustry(selectedIndustry?.id === ind.id ? null : ind);
                                  setDropdownOpen(false);
                                  setSearchText('');
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '8px 14px 8px 28px',
                                  cursor: 'pointer',
                                  background: selectedIndustry?.id === ind.id ? '#e6f4ff' : 'transparent',
                                  transition: 'background 0.1s',
                                }}
                                onMouseEnter={e => {
                                  if (selectedIndustry?.id !== ind.id) e.currentTarget.style.background = '#f5f9ff';
                                }}
                                onMouseLeave={e => {
                                  if (selectedIndustry?.id !== ind.id) e.currentTarget.style.background = 'transparent';
                                }}
                              >
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span
                                    style={{
                                      width: 7,
                                      height: 7,
                                      borderRadius: '50%',
                                      background: INDUSTRY_STATUS_DOT[ind.configStatus].color,
                                      flexShrink: 0,
                                      display: 'inline-block',
                                      boxShadow: ind.configStatus !== 0 ? `0 0 0 2px ${INDUSTRY_STATUS_DOT[ind.configStatus].color}33` : 'none',
                                    }}
                                  />
                                  <span
                                    style={{
                                      fontSize: 13,
                                      color: selectedIndustry?.id === ind.id ? '#1677ff' : '#333',
                                      fontWeight: selectedIndustry?.id === ind.id ? 600 : 400,
                                    }}
                                  >
                                    {ind.name}
                                  </span>
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                  {ind.configStatus !== 0 && (
                                    <span
                                      style={{
                                        fontSize: 10,
                                        color: INDUSTRY_STATUS_DOT[ind.configStatus].color,
                                        background: ind.configStatus === 2 ? '#f6ffed' : '#e6f4ff',
                                        border: `1px solid ${ind.configStatus === 2 ? '#b7eb8f' : '#91caff'}`,
                                        borderRadius: 3,
                                        padding: '1px 5px',
                                        fontWeight: 500,
                                      }}
                                    >
                                      {INDUSTRY_STATUS_DOT[ind.configStatus].label}
                                    </span>
                                  )}
                                  <span
                                    style={{
                                      fontSize: 11,
                                      color: '#bbb',
                                      background: '#f5f5f5',
                                      border: '1px solid #eee',
                                      borderRadius: 4,
                                      padding: '1px 6px',
                                    }}
                                  >
                                    {ind.code}
                                  </span>
                                </span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>

                {filteredIndustries.length > 0 && (
                  <div
                    style={{
                      padding: '8px 14px',
                      borderTop: '1px solid #f0f0f0',
                      fontSize: 11,
                      color: '#bbb',
                      textAlign: 'right',
                    }}
                  >
                    共 {filteredIndustries.length} 个职业领域
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Level Cards */}
      {!selectedIndustry ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '72px 0',
            background: '#fff',
            border: '1.5px dashed #d9d9d9',
            borderRadius: 12,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#f0f7ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1677ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 6 }}>请先选择职业领域</div>
          <div style={{ fontSize: 13, color: '#aaa' }}>选择上方职业领域后，将显示对应的分级课程框架</div>
        </div>
      ) : loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : levels.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#8c8c8c', fontSize: 16 }}>
          暂无职业领域分级课程框架数据
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 20,
          }}
        >
          {levels.map(level => {

            const cfg = STATUS_CONFIG[level.status as 0 | 1 | 2];
            const accentColor = STATUS_ACCENT_COLORS[level.status] ?? '#8c8c8c';
            let proTotal: number = 0;
            let proCount = 0;
            let actTotal = 0;
            let actCount = 0;
            level.abilityList.forEach(ability => {
              if (!ability.oneMergeFlag && ability.twoCareerCourseFlag) {
                proTotal = ability.courseNum;
                proCount = ability.courseList?.length ?? 0;
              }
              if (ability.oneMergeFlag) {
                actTotal = ability.courseNum;
                actCount = ability.courseList?.length ?? 0;
              }
            })
            const proPercent = proTotal > 0 ? Math.min(100, (proCount / proTotal) * 100) : 0;
            const actPercent = actTotal > 0 ? Math.min(100, (actCount / actTotal) * 100) : 0;
            const levelLabel = '分级课程框架';

            return (
              <div
                key={level.levelId}
                style={{
                  background: '#fff',
                  border: `1.5px solid ${cfg.cardBorder}`,
                  borderRadius: 12,
                  padding: '20px 22px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: '#aaa', fontWeight: 700, letterSpacing: 1.5 }}>
                    {levelLabel}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {level.status === 2 && (() => {
                      const reviewCfg: Record<string, { label: string; bg: string; color: string; border: string }> = {
                        0: { label: '待审核', bg: '#fff7e6', color: '#fa8c16', border: '#ffd591' },
                        1: { label: '审核通过', bg: '#f6ffed', color: '#52c41a', border: '#b7eb8f' },
                        2: { label: '审核不通过', bg: '#fff1f0', color: '#ff4d4f', border: '#ffccc7' },
                      };
                      const rc = reviewCfg[level.auditStatus] || reviewCfg.pending;
                      return (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 500,
                            padding: '2px 8px',
                            borderRadius: 20,
                            background: rc.bg,
                            color: rc.color,
                            border: `1px solid ${rc.border}`,
                          }}
                        >
                          {rc.label}
                        </span>
                      );
                    })()}
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        padding: '2px 12px',
                        borderRadius: 20,
                        background: cfg.tagBg,
                        color: cfg.tagColor,
                        border: `1px solid ${cfg.tagBorder}`,
                      }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', marginBottom: 18 }}>
                  {level.levelName}
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: '#595959' }}>专业能力</span>
                    <span style={{ fontSize: 13, color: '#999' }}>
                      {proCount}/{proTotal}
                    </span>
                  </div>
                  <div style={{ height: 7, borderRadius: 4, background: '#ebebeb', overflow: 'hidden' }}>
                    {cfg.showProgress && (
                      <div
                        style={{
                          height: '100%',
                          width: `${proPercent}%`,
                          background: accentColor,
                          borderRadius: 4,
                          transition: 'width 0.4s ease',
                        }}
                      />
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: '#595959' }}>行动能力</span>
                    <span style={{ fontSize: 13, color: '#999' }}>
                      {actCount}/{actTotal}
                    </span>
                  </div>
                  <div style={{ height: 7, borderRadius: 4, background: '#ebebeb', overflow: 'hidden' }}>
                    {cfg.showProgress && (
                      <div
                        style={{
                          height: '100%',
                          width: `${actPercent}%`,
                          background: accentColor,
                          borderRadius: 4,
                          transition: 'width 0.4s ease',
                        }}
                      />
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, marginBottom: 18 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <span style={{ fontSize: 11, color: '#aaa' }}>课程</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>{level.courseNum}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <span style={{ fontSize: 11, color: '#aaa' }}>学分</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: accentColor }}>{level.totalCourseCredit}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <span style={{ fontSize: 11, color: '#aaa' }}>学时</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>{level.totalCourseHour}</span>
                  </div>
                </div>

                <button
                  onClick={() => onStartConfig(selectedIndustry, level)}
                  style={{
                    width: '100%',
                    padding: '11px 0',
                    borderRadius: 8,
                    border: `1.5px solid ${accentColor}`,
                    background: accentColor,
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                >
                  {cfg.btnLabel}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DomainStandardsHome;
