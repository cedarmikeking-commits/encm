import { CourseStandardType, CourseType } from '@/pages/course-standards/standard-course-development';
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getUserInfoAndMenu } from '@/api/user';
import { websiteConfig } from '@/config';
import { Spin } from 'antd';


interface CourseStandardEntryProps {
  onSelect: (type: CourseType) => void;
}

const standards: {
  courseType: CourseType;
  type: CourseStandardType;
  badge: string;
  title: string;
  desc: string;
  color: string;
  lightColor: string;
  borderColor: string;
}[] = [
    {
      courseType: 1,
      type: 'vocational',
      badge: '基础能力课程',
      title: '职业素养课程标准',
      desc: '由深圳协议专家委员会统一组织开发',
      color: '#1677ff',
      lightColor: '#e6f4ff',
      borderColor: '#91caff',
    },
    {
      courseType: 2,
      type: 'professional',
      badge: '基础能力课程',
      title: '专业能力课程标准',
      desc: '各职业领域专委会重点负责开发体现本领域特点的专业能力课程',
      color: '#0958d9',
      lightColor: '#eff6ff',
      borderColor: '#adc6ff',
    },
    {
      courseType: 3,
      type: 'action',
      badge: '行动能力课程',
      title: '行动能力课程标准',
      desc: '各职业领域专委会根据本领域职业标准和工作任务完全自主规划和开发',
      color: '#08979c',
      lightColor: '#e6fffb',
      borderColor: '#87e8de',
    },
    {
      courseType: 4,
      type: 'development',
      badge: '发展能力课程',
      title: '发展能力课程标准',
      desc: '由深圳协议专家委员会统一组织开发',
      color: '#389e0d',
      lightColor: '#f6ffed',
      borderColor: '#b7eb8f',
    },
  ];

const CourseStandardEntry: React.FC<CourseStandardEntryProps> = ({ onSelect }) => {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState<CourseStandardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  useEffect(() => {
    fetchUserInfoAndMenu();
    // fetchCompetencyCategories();
    // fetchEducationLevels();
  }, []);
  const selectedItem = standards.find((s) => s.type === selected);
  const fetchUserInfoAndMenu = async () => {
    setLoading(true);
    try {
      const data = await getUserInfoAndMenu({ clientId: websiteConfig.clientId, });
      setUserInfo(data);
    }
    catch (error) {
      console.log(error);
    }
    finally {
      setLoading(false);
    }
  };
  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        minHeight: 'calc(100vh - 120px)',
        background: 'linear-gradient(150deg, #f0f4ff 0%, #f5f7fa 45%, #eef2fb 100%)',
        position: 'relative',
      }}
    >
      <Spin spinning={loading} size="large" tip="加载中..." fullscreen />
      {/* Background blobs */}
      {!loading && <>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: -80, left: -80, width: 360, height: 360, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', bottom: -80, right: 160, width: 380, height: 380, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(96,165,250,0.07) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', top: '45%', left: '40%', width: 260, height: 260, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
          }} />
        </div>

        {/* Left panel — Apple glassmorphism */}
        <div
          style={{
            width: 280,
            flexShrink: 0,
            background: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(20px) saturate(140%)',
            WebkitBackdropFilter: 'blur(20px) saturate(140%)',
            borderRight: '1px solid #e5eaf3',
            boxShadow: '2px 0 16px rgba(59,130,246,0.06)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '48px 32px 44px',
            position: 'relative',
            overflow: 'hidden',
            zIndex: 1,
          }}
        >
          {/* Subtle inner highlight top-left */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.9), rgba(255,255,255,0.2))',
            pointerEvents: 'none',
          }} />
          {/* Soft glow orb */}
          <div style={{
            position: 'absolute', bottom: -70, right: -70, width: 240, height: 240,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(22,119,255,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div>
            <div
              style={{
                display: 'inline-block',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: '#1677ff',
                textTransform: 'uppercase',
                background: 'rgba(22,119,255,0.1)',
                border: '1px solid rgba(22,119,255,0.2)',
                borderRadius: 20,
                padding: '3px 10px',
                marginBottom: 18,
              }}
            >
              Course Standard
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: '#0d1d3a',
                lineHeight: 1.3,
                marginBottom: 10,
                letterSpacing: '-0.3px',
              }}
            >
              研制课程标准
            </div>
            <div
              style={{
                width: 28,
                height: 3,
                borderRadius: 2,
                background: 'linear-gradient(90deg, #1677ff, #36b5ff)',
                marginBottom: 20,
              }}
            />
            <div style={{ fontSize: 13, color: '#5a6e8c', lineHeight: 1.9 }}>
              选择右侧课程标准类型，进入对应研制工作台开始工作。
            </div>
          </div>

          {selectedItem ? (
            <div
              style={{
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: 16,
                padding: '18px 20px',
                border: `1px solid rgba(255,255,255,0.8)`,
                boxShadow: `0 2px 16px ${selectedItem.color}18, inset 0 1px 0 rgba(255,255,255,0.9)`,
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: selectedItem.color,
                  background: `${selectedItem.color}12`,
                  border: `1px solid ${selectedItem.color}30`,
                  borderRadius: 20,
                  padding: '2px 8px',
                  marginBottom: 10,
                }}
              >
                已选择
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0d1d3a', marginBottom: 6 }}>
                {selectedItem.title}
              </div>
              <div style={{ fontSize: 12, color: '#7a8ea8', lineHeight: 1.65 }}>
                {selectedItem.desc}
              </div>
              <button
                onClick={() => onSelect(selectedItem.courseType)}
                style={{
                  marginTop: 16,
                  width: '100%',
                  padding: '10px 0',
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${selectedItem.color}, ${selectedItem.color}cc)`,
                  border: 'none',
                  color: '#fff',
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  letterSpacing: '0.03em',
                  transition: 'opacity 0.15s, transform 0.15s',
                  boxShadow: `0 4px 16px ${selectedItem.color}40, inset 0 1px 0 rgba(255,255,255,0.2)`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = '0.88';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                }}
              >
                进入工作台 →
              </button>
            </div>
          ) : (
            <div
              style={{
                background: 'rgba(255,255,255,0.45)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderRadius: 16,
                padding: '22px 20px',
                border: '1px dashed rgba(22,119,255,0.25)',
                textAlign: 'center',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10, margin: '0 auto 12px',
                background: 'rgba(22,119,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, color: '#a0b4d0',
              }}>←</div>
              <div style={{ fontSize: 12.5, color: '#92a8c4', lineHeight: 1.6 }}>
                点击右侧卡片选择类型
              </div>
            </div>
          )}
        </div>

        {/* Right grid */}
        <div
          style={{
            flex: 1,
            padding: '40px 40px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            overflowY: 'auto',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 13, color: '#8c9ab7' }}>共 {standards.filter((a) => {
              if (userInfo.industryScope && (a.courseType == 2 || a.courseType == 3)) {
                return true;
              }
              else if ((!userInfo.industryScope)) {
                return true;
              }
              return false;
            }).length} 种课程标准类型，点击选择后进入工作台</div>
          </div>

          {standards.filter((a) => {
            if (userInfo.industryScope && (a.courseType == 2 || a.courseType == 3)) {
              return true;
            }
            else if ((!userInfo.industryScope)) {
              return true;
            }
            return false;
          }).map((item) => {
            const isSelected = selected === item.type;

            return (
              <div
                key={item.type}
                onClick={() => setSelected(isSelected ? null : item.type)}
                style={{
                  background: isSelected
                    ? `${item.lightColor}cc`
                    : 'rgba(255,255,255,0.80)',
                  backdropFilter: 'blur(16px) saturate(140%)',
                  WebkitBackdropFilter: 'blur(16px) saturate(140%)',
                  border: isSelected
                    ? `1.5px solid ${item.borderColor}80`
                    : '1.5px solid #e8edf5',
                  borderRadius: 18,
                  padding: '28px 36px',
                  cursor: 'pointer',
                  transition: 'all 0.22s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 28,
                  boxShadow: isSelected
                    ? `0 6px 28px ${item.color}22, inset 0 1px 0 rgba(255,255,255,0.8)`
                    : '0 2px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      right: -30,
                      top: -30,
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      background: `${item.color}0a`,
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {/* Icon block */}
                <div
                  style={{
                    width: 72,
                    height: 72,
                    flexShrink: 0,
                    borderRadius: 18,
                    background: isSelected ? `${item.color}18` : '#f4f6fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s',
                    fontSize: 30,
                    color: item.color,
                  }}
                >
                  {item.type === 'vocational' && (
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke={isSelected ? item.color : '#b0bcd4'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                  {item.type === 'professional' && (
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke={isSelected ? item.color : '#b0bcd4'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" />
                      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                      <line x1="12" y1="12" x2="12" y2="16" />
                      <line x1="10" y1="14" x2="14" y2="14" />
                    </svg>
                  )}
                  {item.type === 'action' && (
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke={isSelected ? item.color : '#b0bcd4'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  )}
                  {item.type === 'development' && (
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke={isSelected ? item.color : '#b0bcd4'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                      <polyline points="16 7 22 7 22 13" />
                    </svg>
                  )}
                </div>

                {/* Text content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        color: isSelected ? item.color : '#8c9ab7',
                        background: isSelected ? `${item.color}15` : '#f0f2f8',
                        borderRadius: 6,
                        padding: '2px 8px',
                        border: `1px solid ${isSelected ? item.borderColor : '#e2e8f0'}`,
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap',
                      }}
                    >
                    </span>

                    {item.badge}

                  </div>
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: isSelected ? item.color : '#1a2540',
                      marginBottom: 6,
                      transition: 'color 0.2s',
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: isSelected ? `${item.color}99` : '#8c9ab7',
                      lineHeight: 1.6,
                      transition: 'color 0.2s',
                    }}
                  >
                    {item.desc}
                  </div>
                </div>

                {/* Right action */}
                <div
                  style={{
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: 12,
                  }}
                >
                  {isSelected ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(item.courseType);
                      }}
                      style={{
                        padding: '10px 24px',
                        borderRadius: 10,
                        background: item.color,
                        border: 'none',
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        boxShadow: `0 4px 16px ${item.color}40`,
                        transition: 'opacity 0.15s',
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.85')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
                    >
                      进入工作台
                    </button>
                  ) : (
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: '#f0f2f8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#b0bcd4',
                        fontSize: 16,
                        transition: 'all 0.2s',
                      }}
                    >
                      →
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </>}
    </div>
  );
};

export default CourseStandardEntry;
