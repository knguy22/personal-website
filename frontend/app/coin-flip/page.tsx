'use client'

import { useEffect, useState } from 'react';
import './coin.css'

export default function CoinFlip() {
  const [isHeads, setIsHeads] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);

  function flip() {
    setIsFlipping(true);
    setTimeout(() => {
      setIsHeads(Math.random() < 0.5);
      console.log(isHeads);
      setIsFlipping(false);
    }, 2000);
  }

  useEffect(() => {
    flip();
  }, []);


  return (
    <div className="flex flex-col items-center justify-start h-screen pt-20">
      <div id='coin' className={`relative w-60 h-60 ${isFlipping ? 'flipping' : ''}`}>
        <button id='heads' className={`coin-face ${isHeads ? 'top' : 'bottom'} ${isFlipping ? 'flip-heads' : ''}`} onClick={flip} disabled={isFlipping}>
          <p className='coin-text'>
            Heads
          </p>
        </button>
        <button id='tails' className={`coin-face ${isHeads ? 'bottom' : 'top'} ${isFlipping ? 'flip-tails' : ''}`} onClick={flip} disabled={isFlipping}>
          <p className='coin-text'>
            Tails
          </p>
        </button>
      </div>
      <p className="text-4xl flex-col items-center text-center justify-between pt-10">
        Flip the coin!
      </p>
    </div>
  );
}
