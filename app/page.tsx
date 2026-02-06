'use client';

import { useState, useEffect } from 'react';
import './game.css';

type Stage = 
  | 'opening' 
  | 'intro' 
  | 'chapter1' 
  | 'booth1-enter' 
  | 'booth1-wait' 
  | 'booth1-complete' 
  | 'chapter2' 
  | 'booth2-enter' 
  | 'booth2-wait' 
  | 'booth2-complete' 
  | 'chapter3' 
  | 'finalBooth-enter' 
  | 'finalBooth-wait' 
  | 'ending';

type Booth1 = 'emotion' | 'bakery';
type Booth2 = 'tarot' | 'saju';

interface GameState {
  stage: Stage;
  selectedBooth1: Booth1 | null;
  selectedBooth2: Booth2 | null;
  clues: string[];
}

const BOOTHS1 = {
  emotion: {
    name: 'STAGE 01 - EMOTION FACTORY',
    title: '이모션 팩토리',
    story: [
      '수많은 색색깔의 비즈들이 바닥에 흩어져 있다.',
      '무질서하게 뒤섞인 감정들... 당신은 이것들을 분류해야 한다.',
      '',
      '[QUEST] 뒤섞인 감정의 비즈를 분류하여, 숨겨진 당신의 진짜 마음을 데이터 팩에 담아라.'
    ],
    clue: '숨겨진 진짜 감정들을 마주했다. 두려움, 분노, 슬픔... 그것들은 모두 당신의 일부였다.'
  },
  bakery: {
    name: 'STAGE 01 - TINY TINY BAKERY',
    title: '티니 타이니 베이커리',
    story: [
      '작은 오븐에서 열기가 피어오른다.',
      '거대했던 근심과 불안, 이제 그것들을 압축할 시간이다.',
      '',
      '[QUEST] 거대했던 근심과 불안을 뜨거운 열로 압축해서 한 손에 쏙 들어오는 단단한 키링으로 만들어라.'
    ],
    clue: '거대해 보였던 불안들을 작게 압축하고 나니, 그것들이 당신을 지켜온 방어막이었음을 깨달았다.'
  }
};

const BOOTHS2 = {
  tarot: {
    name: 'STAGE 02 - TAROT',
    title: '포춘 하우스 - 타로',
    story: [
      '서양의 신비로운 카드들이 펼쳐진다.',
      '각 카드마다 당신의 운명이 새겨져 있다.',
      '',
      '[QUEST] 당신의 운명에 발생한 작은 글리치들을 타로 카드로 확인하라.'
    ],
    clue: '운명의 카드는 말한다. 당신에게 일어난 일들은 우연이 아니라 필연이었다고. 그 속에서 당신은 계속 선택해왔다.'
  },
  saju: {
    name: 'STAGE 02 - SAJU',
    title: '포춘 하우스 - 사주',
    story: [
      '동양의 만세력이 펼쳐진다.',
      '시간과 공간에 새겨진 당신의 운명.',
      '',
      '[QUEST] 당신의 운명에 발생한 작은 글리치들을 사주 만세력으로 확인하라.'
    ],
    clue: '만세력은 보여준다. 당신이 태어난 시간과 공간이 만든 고유한 패턴. 그것이 당신을 이루는 뼈대였다. 그러나 길을 개척하는 건 당신의 몫이다.'
  }
};

const INTRO_STORY = [
  '당신은 열심히 사는 비버였다.',
  '그러나 아무도 눈치채지 못했다. 당신의 열심 아래에, 무기력이 잠들어 있다는 것을...',
  '어제도, 엊그제도 그런 날 중 하나였다. 열심히 살지만, 근본적으로는 공허한 나날들.',
  '',
  '당신은 쏟아지는 현실의 짐을 피해 낯선 플스방으로 숨어들었다.',
  '게임 패드를 잡고 잠이 든 찰나, 경쾌한 8비트 사운드와 함께...',
  '눈앞의 현실이 픽셀로 조각나기 시작한다.',
  '',
  '탈출하려면 이 세계의 룰을 따라야 한다.',
  '각 관문들을 클리어하고, 당신의 진실을 마주하라.',
  '',
  '[QUEST] 3개의 관문이 감지되었습니다. 순서대로 클리어하세요.'
];

const FINAL_BOOTH = {
  name: 'STAGE 03 - ROOM OF TRUTH',
  title: '진실의 방',
  story: [
    '2층의 문이 열린다.',
    '당신이 모은 모든 조각들이 하나로 모이는 곳.',
    '',
    '감정, 불안, 운명.',
    '이 모든 것이 얽혀 만들어진 존재.',
    '',
    '당신은 어떤 비버인가?',
    '무기력 속에서도 살아남은 당신은 누구인가?',
    '',
    '[QUEST] 당신의 진실과 마주하라.'
  ]
};

export default function BeaverEscape() {
  const [gameState, setGameState] = useState<GameState>({
    stage: 'opening',
    selectedBooth1: null,
    selectedBooth2: null,
    clues: []
  });

  const [typedText, setTypedText] = useState<string[]>([]);
  const [showButton, setShowButton] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [systemMessage, setSystemMessage] = useState<string | null>(null);
  const [showTransition, setShowTransition] = useState(false);
  const [transitionText, setTransitionText] = useState('LOADING...');
  const [showChapterTitle, setShowChapterTitle] = useState(false);
  const [chapterTitleText, setChapterTitleText] = useState('');
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [playTime, setPlayTime] = useState<number>(0);

  // 로컬스토리지 저장/불러오기
  useEffect(() => {
    const saved = localStorage.getItem('beaverGame');
    if (saved) {
      const data = JSON.parse(saved);
      setGameState(data);
      if (data.startTime) {
        setStartTime(data.startTime);
      }
    }
  }, []);

  useEffect(() => {
    const dataToSave = { ...gameState, startTime };
    localStorage.setItem('beaverGame', JSON.stringify(dataToSave));
  }, [gameState, startTime]);

  // 플레이 타임 계산
  useEffect(() => {
    if (gameState.stage === 'ending') {
      setPlayTime(Date.now() - startTime);
    }
  }, [gameState.stage, startTime]);

  // 시스템 메시지 표시
  const showSystemMessage = (message: string) => {
    setSystemMessage(message);
    setTimeout(() => setSystemMessage(null), 3000);
  };

  // 트랜지션 효과
  const showTransitionEffect = (text: string, callback: () => void) => {
    setTransitionText(text);
    setShowTransition(true);
    setTimeout(() => {
      callback();
      setTimeout(() => {
        setShowTransition(false);
      }, 300);
    }, 1000);
  };

  // 챕터 타이틀 효과
  const showChapterTitleEffect = (title: string, callback: () => void) => {
    setChapterTitleText(title);
    setShowChapterTitle(true);
    setTimeout(() => {
      callback();
      setTimeout(() => {
        setShowChapterTitle(false);
      }, 300);
    }, 1000);
  };

  // 타이핑 효과
  useEffect(() => {
    const stageStories: { [key: string]: string[] } = {
      'intro': INTRO_STORY,
      'chapter1': ['앞에 두 개의 문이 보입니다.', '하나를 선택하세요.'],
      'chapter2': ['포춘 하우스의 문이 열립니다.'],
      'chapter3': ['모든 조각이 모였습니다.', '이제 2층으로 올라가세요.', '진실의 방이 당신을 기다리고 있습니다.'],
      'finalBooth-enter': FINAL_BOOTH.story
    };

    if (gameState.stage === 'booth1-enter' && gameState.selectedBooth1) {
      typeText(BOOTHS1[gameState.selectedBooth1].story);
    } else if (gameState.stage === 'booth2-enter' && gameState.selectedBooth2) {
      typeText(BOOTHS2[gameState.selectedBooth2].story);
    } else if (stageStories[gameState.stage]) {
      typeText(stageStories[gameState.stage]);
    }
  }, [gameState.stage, gameState.selectedBooth1, gameState.selectedBooth2]);

  const typeText = (lines: string[]) => {
    setIsTyping(true);
    setTypedText([]);
    setShowButton(false);
    setShowCursor(true);

    let currentLine = 0;
    let currentChar = 0;
    const result: string[] = [];

    const typeInterval = setInterval(() => {
      if (currentLine >= lines.length) {
        clearInterval(typeInterval);
        setIsTyping(false);
        setShowCursor(false);
        setShowButton(true);
        return;
      }

      const line = lines[currentLine];
      
      if (currentChar <= line.length) {
        result[currentLine] = line.slice(0, currentChar);
        setTypedText([...result]);
        currentChar++;
      } else {
        currentLine++;
        currentChar = 0;
      }
    }, 30);

    return () => clearInterval(typeInterval);
  };

  const reset = () => {
    localStorage.removeItem('beaverGame');
    setGameState({
      stage: 'opening',
      selectedBooth1: null,
      selectedBooth2: null,
      clues: []
    });
    setTypedText([]);
    setShowButton(false);
    setStartTime(Date.now());
    setPlayTime(0);
    showSystemMessage('[SYSTEM] 게임이 초기화되었습니다.');
  };

  // HUD 정보 계산
  const getStageInfo = () => {
    const stageMap: { [key: string]: string } = {
      'opening': 'MENU',
      'intro': 'INTRO',
      'chapter1': '1-1',
      'booth1-enter': '1-1',
      'booth1-wait': '1-1',
      'booth1-complete': '1-1',
      'chapter2': '2-1',
      'booth2-enter': '2-1',
      'booth2-wait': '2-1',
      'booth2-complete': '2-1',
      'chapter3': '3-1',
      'finalBooth-enter': '3-1',
      'finalBooth-wait': '3-1',
      'ending': 'CLEAR'
    };
    return stageMap[gameState.stage] || '---';
  };

  // 포맷된 시간 표시
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // ========== 공통 컴포넌트 ==========
  
  const HUD = () => (
    <div className="hud">
      <div className="hud-item">STAGE: {getStageInfo()}</div>
      <div className="hud-item highlight">CLUES: {gameState.clues.length}/4</div>
    </div>
  );

  const MenuPanel = () => (
    <>
      <div className="menu-buttons">
        <button className="menu-button" onClick={() => setMenuOpen(true)}>≡</button>
      </div>
      <div className={`menu-panel ${menuOpen ? 'open' : ''}`}>
        <button className="menu-close" onClick={() => setMenuOpen(false)}>[X]</button>
        <h3 style={{ color: '#0099ff', marginBottom: '20px' }}>수집한 단서</h3>
        {gameState.clues.length === 0 ? (
          <p style={{ color: '#00ff00' }}>아직 수집한 단서가 없습니다.</p>
        ) : (
          gameState.clues.map((clue, idx) => (
            <div key={idx} className="clue-item" style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #0099ff' }}>
              • {clue}
            </div>
          ))
        )}
      </div>
    </>
  );

  const SystemMessage = () => systemMessage ? (
    <div className="system-message">{systemMessage}</div>
  ) : null;

  const Transition = () => showTransition ? (
    <div className="transition-overlay loading">
      <div className="loading-text">{transitionText}</div>
    </div>
  ) : null;

  const ChapterTitle = () => showChapterTitle ? (
    <div className="chapter-title-overlay">
      <div className="chapter-title-text" style={{ whiteSpace: 'pre-line' }}>
        {chapterTitleText}
      </div>
    </div>
  ) : null;

  // 타이핑 텍스트 렌더링
  const TypedText = ({ centerText = false }: { centerText?: boolean }) => (
    <div className={`text-container ${centerText ? 'center-text' : ''}`}>
      {typedText.map((line, idx) => {
        const isQuest = line.startsWith('[QUEST]');
        const className = isQuest ? 'quest-message' : '';
        
        return (
          <p 
            key={idx} 
            className={`text-line ${className}`}
          >
            {line || '\u00A0'}
          </p>
        );
      })}
      {showCursor && <span className="cursor"></span>}
    </div>
  );

  // 스테이지 레이아웃
  const StageLayout = ({ 
    title, 
    subtitle, 
    children, 
    showMenu = false 
  }: { 
    title?: string; 
    subtitle?: string; 
    children: React.ReactNode; 
    showMenu?: boolean;
  }) => (
    <>
      {title && <HUD />}
      <div className="game-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {title && <h2 className="title" style={{ color: '#0099ff' }}>{title}</h2>}
        {subtitle && <h3 className="subtitle">{subtitle}</h3>}
        {children}
      </div>
      {showMenu && <MenuPanel />}
      <ChapterTitle />
      <Transition />
      <SystemMessage />
    </>
  );

  // ========== 스테이지별 렌더링 ==========

  // 오프닝
  if (gameState.stage === 'opening') {
    return (
      <>
        <div className="game-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1 className="title glitch" style={{ color: '#ff0000' }}>당신은 갇혔습니다.</h1>
          <button
            onClick={() => {
              setStartTime(Date.now());
              showTransitionEffect('LOADING...', () => {
                setGameState({ ...gameState, stage: 'intro' });
              });
            }}
            className="pixel-button"
            style={{ maxWidth: '300px' }}
          >
            ▶ 시작하기
          </button>
        </div>
        <Transition />
      </>
    );
  }

  // 인트로 스토리
  if (gameState.stage === 'intro') {
    return (
      <StageLayout>
        <TypedText />
        {showButton && (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button
              onClick={() => {
                showChapterTitleEffect('CHAPTER 1\n선택의 갈림길', () => {
                  setGameState({ ...gameState, stage: 'chapter1' });
                });
              }}
              className="pixel-button"
              style={{ maxWidth: '300px' }}
            >
              ▶ 계속하기
            </button>
          </div>
        )}
      </StageLayout>
    );
  }

  // 챕터 1: 첫 번째 부스 선택
  if (gameState.stage === 'chapter1') {
    return (
      <StageLayout title="CHAPTER 1" subtitle="선택의 갈림길" showMenu>
        <div style={{ marginBottom: '40px' }}>
          <TypedText centerText />
        </div>
        {showButton && (
          <div className="button-container">
            {Object.entries(BOOTHS1).map(([key, booth]) => (
              <button
                key={key}
                onClick={() => {
                  showSystemMessage('[SYSTEM] 세이브 포인트 저장됨');
                  showTransitionEffect('LOADING...', () => {
                    setGameState({ ...gameState, stage: 'booth1-enter', selectedBooth1: key as Booth1 });
                  });
                }}
                className="pixel-button"
              >
                ▶ {booth.title}
              </button>
            ))}
          </div>
        )}
      </StageLayout>
    );
  }

  // 부스1 진입
  if (gameState.stage === 'booth1-enter' && gameState.selectedBooth1) {
    const booth = BOOTHS1[gameState.selectedBooth1];
    return (
      <StageLayout title={booth.name} subtitle={booth.title} showMenu>
        <div style={{ marginBottom: '40px' }}>
          <TypedText />
        </div>
        {showButton && (
          <div className="button-container">
            <button
              onClick={() => setGameState({ ...gameState, stage: 'chapter1', selectedBooth1: null })}
              className="pixel-button"
              style={{ maxWidth: '300px' }}
            >
              ◀ 뒤로가기
            </button>
            <button
              onClick={() => setGameState({ ...gameState, stage: 'booth1-wait' })}
              className="pixel-button"
              style={{ maxWidth: '300px' }}
            >
              ▶ 준비 완료
            </button>
          </div>
        )}
      </StageLayout>
    );
  }

  // 부스1 체험 대기
  if (gameState.stage === 'booth1-wait' && gameState.selectedBooth1) {
    const booth = BOOTHS1[gameState.selectedBooth1];
    return (
      <StageLayout title={booth.title}>
        <div className="text-container center-text" style={{ marginBottom: '40px' }}>
          <p className="text-line">부스 체험을 진행해주세요.<br/>완료 전에는 다음으로 넘어갈 수 없습니다.</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => {
              const clue = booth.clue;
              showSystemMessage('[SYSTEM] 새로운 단서를 발견했습니다!');
              setTimeout(() => {
                setGameState({ ...gameState, stage: 'booth1-complete', clues: [clue] });
              }, 1000);
            }}
            className="pixel-button primary"
            style={{ maxWidth: '300px' }}
          >
            ▶ 체험 완료하기
          </button>
        </div>
      </StageLayout>
    );
  }

  // 부스1 완료
  if (gameState.stage === 'booth1-complete' && gameState.selectedBooth1) {
    const booth = BOOTHS1[gameState.selectedBooth1];
    return (
      <StageLayout title="첫 번째 조각을 발견했습니다" showMenu>
        <div className="clue-box">
          <p className="clue-item">"{booth.clue}"</p>
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={() => {
              showChapterTitleEffect('CHAPTER 2\n운명의 눈', () => {
                setGameState({ ...gameState, stage: 'chapter2' });
              });
            }}
            className="pixel-button"
            style={{ maxWidth: '300px' }}
          >
            ▶ 다음으로
          </button>
        </div>
      </StageLayout>
    );
  }

  // 챕터 2: 두 번째 부스 선택
  if (gameState.stage === 'chapter2') {
    return (
      <StageLayout title="CHAPTER 2" subtitle="운명의 눈" showMenu>
        <div style={{ marginBottom: '40px' }}>
          <TypedText centerText />
        </div>
        {showButton && (
          <div className="button-container">
            {Object.entries(BOOTHS2).map(([key, booth]) => (
              <button
                key={key}
                onClick={() => {
                  showSystemMessage('[SYSTEM] 세이브 포인트 저장됨');
                  showTransitionEffect('LOADING...', () => {
                    setGameState({ ...gameState, stage: 'booth2-enter', selectedBooth2: key as Booth2 });
                  });
                }}
                className="pixel-button"
              >
                ▶ {booth.title}
              </button>
            ))}
          </div>
        )}
      </StageLayout>
    );
  }

  // 부스2 진입
  if (gameState.stage === 'booth2-enter' && gameState.selectedBooth2) {
    const booth = BOOTHS2[gameState.selectedBooth2];
    return (
      <StageLayout title={booth.name} subtitle={booth.title} showMenu>
        <div style={{ marginBottom: '40px' }}>
          <TypedText />
        </div>
        {showButton && (
          <div className="button-container">
            <button
              onClick={() => setGameState({ ...gameState, stage: 'chapter2', selectedBooth2: null })}
              className="pixel-button"
              style={{ maxWidth: '300px' }}
            >
              ◀ 뒤로가기
            </button>
            <button
              onClick={() => setGameState({ ...gameState, stage: 'booth2-wait' })}
              className="pixel-button"
              style={{ maxWidth: '300px' }}
            >
              ▶ 준비 완료
            </button>
          </div>
        )}
      </StageLayout>
    );
  }

  // 부스2 체험 대기
  if (gameState.stage === 'booth2-wait' && gameState.selectedBooth2) {
    const booth = BOOTHS2[gameState.selectedBooth2];
    return (
      <StageLayout title={booth.title}>
        <div className="text-container center-text" style={{ marginBottom: '40px' }}>
          <p className="text-line">부스 체험을 진행해주세요.<br/>완료 전에는 다음으로 넘어갈 수 없습니다.</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => {
              const clue = booth.clue;
              showSystemMessage('[SYSTEM] 새로운 단서를 발견했습니다!');
              setTimeout(() => {
                setGameState({ ...gameState, stage: 'booth2-complete', clues: [...gameState.clues, clue] });
              }, 1000);
            }}
            className="pixel-button primary"
            style={{ maxWidth: '300px' }}
          >
            ▶ 체험 완료하기
          </button>
        </div>
      </StageLayout>
    );
  }

  // 부스2 완료
  if (gameState.stage === 'booth2-complete') {
    return (
      <StageLayout title="두 번째 조각을 발견했습니다" showMenu>
        <div className="clue-box">
          <p className="text-line" style={{ textAlign: 'center', marginBottom: '12px' }}>수집한 단서:</p>
          {gameState.clues.map((clue, idx) => (
            <p key={idx} className="clue-item">
              • {clue}
            </p>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={() => {
              showChapterTitleEffect('CHAPTER 3\n진실의 문', () => {
                setGameState({ ...gameState, stage: 'chapter3' });
              });
            }}
            className="pixel-button"
            style={{ maxWidth: '300px' }}
          >
            ▶ 다음으로
          </button>
        </div>
      </StageLayout>
    );
  }

  // 챕터 3: 진실의 방
  if (gameState.stage === 'chapter3') {
    return (
      <StageLayout title="CHAPTER 3" subtitle="진실의 문" showMenu>
        <div style={{ marginBottom: '40px' }}>
          <TypedText centerText />
        </div>
        {showButton && (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => {
                showSystemMessage('[SYSTEM] 최종 단계 진입');
                showTransitionEffect('LOADING...', () => {
                  setGameState({ ...gameState, stage: 'finalBooth-enter' });
                });
              }}
              className="pixel-button"
              style={{ maxWidth: '300px' }}
            >
              ▶ 진실의 방으로
            </button>
          </div>
        )}
      </StageLayout>
    );
  }

  // 진실의 방 진입
  if (gameState.stage === 'finalBooth-enter') {
    return (
      <StageLayout title={FINAL_BOOTH.name} subtitle={FINAL_BOOTH.title} showMenu>
        <div style={{ marginBottom: '40px' }}>
          <TypedText />
        </div>
        {showButton && (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => setGameState({ ...gameState, stage: 'finalBooth-wait' })}
              className="pixel-button"
              style={{ maxWidth: '300px' }}
            >
              ▶ 준비 완료
            </button>
          </div>
        )}
      </StageLayout>
    );
  }

  // 진실의 방 체험 대기
  if (gameState.stage === 'finalBooth-wait') {
    return (
      <StageLayout title="진실의 방">
        <div className="text-container center-text" style={{ marginBottom: '40px' }}>
          <p className="text-line">부스 체험을 진행해주세요.<br/>완료 전에는 다음으로 넘어갈 수 없습니다.</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => {
              showSystemMessage('[SYSTEM] 모든 단서를 수집했습니다!');
              setTimeout(() => {
                setGameState({ ...gameState, stage: 'ending' });
              }, 1000);
            }}
            className="pixel-button primary"
            style={{ maxWidth: '300px' }}
          >
            ▶ 체험 완료하기
          </button>
        </div>
      </StageLayout>
    );
  }

  // 엔딩
  if (gameState.stage === 'ending') {
    const booth1Name = gameState.selectedBooth1 ? BOOTHS1[gameState.selectedBooth1].title : '선택 안 함';
    const booth2Name = gameState.selectedBooth2 ? BOOTHS2[gameState.selectedBooth2].title : '선택 안 함';
    
    return (
      <StageLayout title="탈출 성공!">
        <div className="text-container center-text" style={{ marginBottom: '40px' }}>
          <p className="text-line">당신은 진짜 자신을 발견했습니다.</p>
          <p className="text-line" style={{ color: '#0099ff' }}>이제 무기력의 세계에서 벗어났습니다.</p>
        </div>

        <div className="result-container">
          <h3 style={{ color: '#0099ff', textAlign: 'center', marginBottom: '16px' }}>YOUR RESULT</h3>
          <div className="result-row">
            <span className="result-label">플레이 타임:</span>
            <span className="result-value">{formatTime(playTime)}</span>
          </div>
          <div className="result-row">
            <span className="result-label">선택한 경로 (1):</span>
            <span className="result-value">{booth1Name}</span>
          </div>
          <div className="result-row">
            <span className="result-label">선택한 경로 (2):</span>
            <span className="result-value">{booth2Name}</span>
          </div>
          <div className="result-row">
            <span className="result-label">수집한 단서:</span>
            <span className="result-value">{gameState.clues.length}/4</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={reset}
            className="pixel-button"
            style={{ maxWidth: '300px' }}
          >
            ▶ 처음으로
          </button>
        </div>
      </StageLayout>
    );
  }

  return null;
}