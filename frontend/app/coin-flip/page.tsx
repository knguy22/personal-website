'use client'

import { useEffect, useState } from 'react';
import './coin.css'

export default function CoinFlip() {
  const [isHeads, setIsHeads] = useState(true);
  const [isFlippingSide, setIsFlippingSide] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  async function flip() {
    const result = Math.random() < 0.5;
    const numFlips = 8 + Number(result);

    setIsFlipping(true);
    let currSide = isHeads;
    for (let i = 0; i < numFlips; i++) {
        setIsFlippingSide(true);
        await new Promise(resolve => setTimeout(resolve, 180));
        setIsFlippingSide(false);
        await new Promise(resolve => setTimeout(resolve, 20));
        setIsHeads(!currSide);
        currSide = !currSide;
    }
    setIsFlipping(false);
  }

  useEffect(() => {
    flip();
  }, [flip]);


  return (
    <div className="flex flex-col items-center justify-start h-screen pt-20">
      <div id='coin' className={`relative w-60 h-60 ${isFlippingSide ? 'flipping' : ''}`}>
        <button 
          id='heads' 
          className={`coin-face ${isHeads ? 'top' : 'bottom'} ${isFlippingSide ? 'flip-heads' : ''}`} 
          onClick={flip} disabled={isFlipping}
        >
          <p className='coin-text'>
            Heads
          </p>
        </button>
        <button 
          id='tails' 
          className={`coin-face ${isHeads ? 'bottom' : 'top'} ${isFlippingSide ? 'flip-tails' : ''}`} 
          onClick={flip} disabled={isFlipping}
        >
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
