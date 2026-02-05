'use client';

import { useState, useEffect } from 'react';

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
    name: 'EMOTION FACTORY',
    title: '이모션 팩토리',
    story: [
      '수많은 색색깔의 비즈들이 바닥에 흩어져 있다.',
      '무질서하게 뒤섞인 감정들.',
      '당신은 이것들을 분류해야 한다.',
      '',
      '뒤섞인 감정의 비즈를 분류하여',
      '무기력 아래 숨겨진 당신의 진짜 마음을',
      '데이터 팩에 담아라.'
    ],
    clue: '뒤섞인 감정 아래, 진실이 숨어있다'
  },
  bakery: {
    name: 'TINY TINY BAKERY',
    title: '티니 타이니 베이커리',
    story: [
      '작은 오븐에서 열기가 피어오른다.',
      '거대했던 근심과 불안.',
      '이제 그것들을 압축할 시간이다.',
      '',
      '거대했던 근심과 불안을 뜨거운 열로 압축해서',
      '한 손에 쏙 들어오는 단단한 키링으로',
      '만들어라.'
    ],
    clue: '압축된 근심은 단단한 힘이 된다'
  }
};

const BOOTHS2 = {
  tarot: {
    name: 'FORTUNE HOUSE - TAROT',
    title: '포춘 하우스 - 타로',
    story: [
      '서양의 신비로운 카드들이 펼쳐진다.',
      '각 카드마다 당신의 운명이 새겨져 있다.',
      '',
      '당신의 운명에 발생한 작은 글리치들을',
      '타로 카드로 확인하라.'
    ],
    clue: '서양의 카드가 운명의 글리치를 보여준다'
  },
  saju: {
    name: 'FORTUNE HOUSE - SAJU',
    title: '포춘 하우스 - 사주',
    story: [
      '동양의 만세력이 펼쳐진다.',
      '시간과 공간에 새겨진 당신의 운명.',
      '',
      '당신의 운명에 발생한 작은 글리치들을',
      '사주 만세력으로 확인하라.'
    ],
    clue: '동양의 만세력이 운명의 글리치를 보여준다'
  }
};

const INTRO_STORY = [
  '당신은 비버입니다.',
  '',
  '어느 날, 당신의 무기력이',
  '세상을 게임으로 바꾸어버렸다.',
  '',
  '반복되는 무기력증에 걸린 비버.',
  '그는 쏟아지는 현실의 짐을 피해',
  '낯선 플스방으로 숨어든다.',
  '',
  '게임 패드를 잡고 잠이 든 찰나,',
  '경쾌한 8비트 사운드와 함께',
  '눈앞의 현실이 픽셀로 조각나기 시작한다.'
];

const FINAL_BOOTH = {
  name: 'ROOM OF TRUTH',
  title: '진실의 방',
  story: [
    '2층의 문이 열린다.',
    '당신이 모은 모든 조각들이',
    '하나로 모이는 곳.',
    '',
    '이곳에서 당신은',
    '진짜 자신을 마주하게 될 것이다.',
    '',
    '당신은 어떤 비버인가?'
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

  // 로컬스토리지 저장/불러오기
  useEffect(() => {
    const saved = localStorage.getItem('beaverGame');
    if (saved) {
      setGameState(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('beaverGame', JSON.stringify(gameState));
  }, [gameState]);

  // 타이핑 효과
  const typeText = (lines: string[], callback?: () => void) => {
    setIsTyping(true);
    setTypedText([]);
    setShowButton(false);

    let currentLine = 0;
    let currentChar = 0;
    const result: string[] = [];

    const typeInterval = setInterval(() => {
      if (currentLine >= lines.length) {
        clearInterval(typeInterval);
        setIsTyping(false);
        setShowButton(true);
        if (callback) callback();
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

  useEffect(() => {
    if (gameState.stage === 'intro') {
      typeText(INTRO_STORY);
    }
  }, [gameState.stage]);

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
  };

  // 오프닝
  if (gameState.stage === 'opening') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-bold text-red-600 mb-12">당신은 갇혔습니다.</h1>
        <button
          onClick={() => setGameState({ ...gameState, stage: 'intro' })}
          className="px-8 py-3 bg-white text-black font-bold border-2 border-white hover:bg-blue-500 hover:text-white hover:border-blue-500"
        >
          시작하기
        </button>
      </div>
    );
  }

  // 인트로 스토리
  if (gameState.stage === 'intro') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <div className="max-w-2xl text-center space-y-2">
          {typedText.map((line, idx) => (
            <p key={idx} className="text-lg leading-relaxed">
              {line}
            </p>
          ))}
        </div>
        {showButton && (
          <button
            onClick={() => setGameState({ ...gameState, stage: 'chapter1' })}
            className="mt-12 px-8 py-3 bg-white text-black font-bold border-2 border-white hover:bg-blue-500 hover:text-white hover:border-blue-500"
          >
            계속하기
          </button>
        )}
      </div>
    );
  }

  // 챕터 1: 첫 번째 부스 선택
  if (gameState.stage === 'chapter1') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <h2 className="text-3xl font-bold mb-4 text-blue-500">CHAPTER 1</h2>
        <h3 className="text-xl mb-12">선택의 갈림길</h3>
        <p className="mb-8 text-center">앞에 두 개의 문이 보입니다.<br />하나를 선택하세요.</p>
        <div className="flex flex-col gap-4 w-full max-w-md">
          {Object.entries(BOOTHS1).map(([key, booth]) => (
            <button
              key={key}
              onClick={() => setGameState({ ...gameState, stage: 'booth1-enter', selectedBooth1: key as Booth1 })}
              className="px-6 py-4 bg-white text-black font-bold border-2 border-white hover:bg-blue-500 hover:text-white hover:border-blue-500"
            >
              {booth.title}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 부스1 진입
  if (gameState.stage === 'booth1-enter' && gameState.selectedBooth1) {
    const booth = BOOTHS1[gameState.selectedBooth1];
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold mb-2 text-blue-500">{booth.name}</h2>
        <h3 className="text-xl mb-8">{booth.title}</h3>
        <div className="max-w-2xl text-center space-y-2 mb-12">
          {booth.story.map((line, idx) => (
            <p key={idx} className="text-lg leading-relaxed">
              {line}
            </p>
          ))}
        </div>
        <button
          onClick={() => setGameState({ ...gameState, stage: 'booth1-wait' })}
          className="px-8 py-3 bg-white text-black font-bold border-2 border-white hover:bg-blue-500 hover:text-white hover:border-blue-500"
        >
          준비 완료
        </button>
      </div>
    );
  }

  // 부스1 체험 대기
  if (gameState.stage === 'booth1-wait' && gameState.selectedBooth1) {
    const booth = BOOTHS1[gameState.selectedBooth1];
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold mb-8 text-blue-500">{booth.title}</h2>
        <p className="mb-12 text-center text-lg">부스 체험을 진행해주세요.</p>
        <button
          onClick={() => {
            const clue = booth.clue;
            setGameState({ ...gameState, stage: 'booth1-complete', clues: [clue] });
          }}
          className="px-8 py-3 bg-blue-500 text-white font-bold border-2 border-blue-500 hover:bg-blue-600"
        >
          체험 완료하기
        </button>
      </div>
    );
  }

  // 부스1 완료
  if (gameState.stage === 'booth1-complete' && gameState.selectedBooth1) {
    const booth = BOOTHS1[gameState.selectedBooth1];
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <div className="text-6xl mb-8">✨</div>
        <h2 className="text-2xl font-bold mb-4 text-blue-500">첫 번째 조각을 발견했습니다</h2>
        <p className="text-lg mb-12 text-center text-blue-500">"{booth.clue}"</p>
        <button
          onClick={() => setGameState({ ...gameState, stage: 'chapter2' })}
          className="px-8 py-3 bg-white text-black font-bold border-2 border-white hover:bg-blue-500 hover:text-white hover:border-blue-500"
        >
          다음으로
        </button>
      </div>
    );
  }

  // 챕터 2: 두 번째 부스 선택
  if (gameState.stage === 'chapter2') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <h2 className="text-3xl font-bold mb-4 text-blue-500">CHAPTER 2</h2>
        <h3 className="text-xl mb-12">운명의 눈</h3>
        <p className="mb-8 text-center">포춘 하우스의 문이 열립니다.</p>
        <div className="flex flex-col gap-4 w-full max-w-md">
          {Object.entries(BOOTHS2).map(([key, booth]) => (
            <button
              key={key}
              onClick={() => setGameState({ ...gameState, stage: 'booth2-enter', selectedBooth2: key as Booth2 })}
              className="px-6 py-4 bg-white text-black font-bold border-2 border-white hover:bg-blue-500 hover:text-white hover:border-blue-500"
            >
              {booth.title}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 부스2 진입
  if (gameState.stage === 'booth2-enter' && gameState.selectedBooth2) {
    const booth = BOOTHS2[gameState.selectedBooth2];
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold mb-2 text-blue-500">{booth.name}</h2>
        <h3 className="text-xl mb-8">{booth.title}</h3>
        <div className="max-w-2xl text-center space-y-2 mb-12">
          {booth.story.map((line, idx) => (
            <p key={idx} className="text-lg leading-relaxed">
              {line}
            </p>
          ))}
        </div>
        <button
          onClick={() => setGameState({ ...gameState, stage: 'booth2-wait' })}
          className="px-8 py-3 bg-white text-black font-bold border-2 border-white hover:bg-blue-500 hover:text-white hover:border-blue-500"
        >
          준비 완료
        </button>
      </div>
    );
  }

  // 부스2 체험 대기
  if (gameState.stage === 'booth2-wait' && gameState.selectedBooth2) {
    const booth = BOOTHS2[gameState.selectedBooth2];
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold mb-8 text-blue-500">{booth.title}</h2>
        <p className="mb-12 text-center text-lg">부스 체험을 진행해주세요.</p>
        <button
          onClick={() => {
            const clue = booth.clue;
            setGameState({ ...gameState, stage: 'booth2-complete', clues: [...gameState.clues, clue] });
          }}
          className="px-8 py-3 bg-blue-500 text-white font-bold border-2 border-blue-500 hover:bg-blue-600"
        >
          체험 완료하기
        </button>
      </div>
    );
  }

  // 부스2 완료
  if (gameState.stage === 'booth2-complete') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <div className="text-6xl mb-8">✨</div>
        <h2 className="text-2xl font-bold mb-4 text-blue-500">두 번째 조각을 발견했습니다</h2>
        <div className="mb-12">
          <p className="text-sm mb-2 text-center">수집한 단서:</p>
          {gameState.clues.map((clue, idx) => (
            <p key={idx} className="text-blue-500 text-center mb-1">
              • {clue}
            </p>
          ))}
        </div>
        <button
          onClick={() => setGameState({ ...gameState, stage: 'chapter3' })}
          className="px-8 py-3 bg-white text-black font-bold border-2 border-white hover:bg-blue-500 hover:text-white hover:border-blue-500"
        >
          다음으로
        </button>
      </div>
    );
  }

  // 챕터 3: 진실의 방
  if (gameState.stage === 'chapter3') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <h2 className="text-3xl font-bold mb-4 text-blue-500">CHAPTER 3</h2>
        <h3 className="text-xl mb-12">진실의 문</h3>
        <p className="mb-8 text-center">
          모든 조각이 모였습니다.<br />
          이제 2층으로 올라가세요.<br />
          <span className="text-blue-500">진실의 방</span>이 당신을 기다리고 있습니다.
        </p>
        <button
          onClick={() => setGameState({ ...gameState, stage: 'finalBooth-enter' })}
          className="px-8 py-3 bg-white text-black font-bold border-2 border-white hover:bg-blue-500 hover:text-white hover:border-blue-500"
        >
          진실의 방으로
        </button>
      </div>
    );
  }

  // 진실의 방 진입
  if (gameState.stage === 'finalBooth-enter') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold mb-2 text-blue-500">{FINAL_BOOTH.name}</h2>
        <h3 className="text-xl mb-8">{FINAL_BOOTH.title}</h3>
        <div className="max-w-2xl text-center space-y-2 mb-12">
          {FINAL_BOOTH.story.map((line, idx) => (
            <p key={idx} className="text-lg leading-relaxed">
              {line}
            </p>
          ))}
        </div>
        <button
          onClick={() => setGameState({ ...gameState, stage: 'finalBooth-wait' })}
          className="px-8 py-3 bg-white text-black font-bold border-2 border-white hover:bg-blue-500 hover:text-white hover:border-blue-500"
        >
          준비 완료
        </button>
      </div>
    );
  }

  // 진실의 방 체험 대기
  if (gameState.stage === 'finalBooth-wait') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold mb-8 text-blue-500">진실의 방</h2>
        <p className="mb-12 text-center text-lg">부스 체험을 진행해주세요.</p>
        <button
          onClick={() => setGameState({ ...gameState, stage: 'ending' })}
          className="px-8 py-3 bg-blue-500 text-white font-bold border-2 border-blue-500 hover:bg-blue-600"
        >
          체험 완료하기
        </button>
      </div>
    );
  }

  // 엔딩
  if (gameState.stage === 'ending') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <div className="text-6xl mb-8">🎮</div>
        <h2 className="text-4xl font-bold mb-8 text-blue-500">탈출 성공!</h2>
        <p className="text-center mb-4">
          당신은 진짜 자신을 발견했습니다.
        </p>
        <p className="text-center mb-12 text-blue-500">
          이제 무기력의 세계에서 벗어났습니다.
        </p>
        <button
          onClick={reset}
          className="px-8 py-3 bg-white text-black font-bold border-2 border-white hover:bg-blue-500 hover:text-white hover:border-blue-500"
        >
          처음으로
        </button>
      </div>
    );
  }

  return null;
}