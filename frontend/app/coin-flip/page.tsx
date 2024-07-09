'use client'

import { useEffect, useState } from 'react';
import './coin.css'
import { PanelBottom } from 'lucide-react';

export default function CoinFlip() {
  const [headSide, setHeadSide] = useState('top');
  const [tailSide, setTailSide] = useState('bottom');

  function flip() {
    const side = Math.random() < 0.5 ? 'heads' : 'tails';
    if (side === 'heads') {
      setHeadSide('top');
      setTailSide('bottom');
    } else {
      setHeadSide('bottom');
      setTailSide('top');
    }
  }

  useEffect(() => {
    flip();
  }, []);


  return (
    <div className="flex flex-col items-center justify-start h-screen pt-20">
      <div id='coin' className="relative w-60 h-60">
        <button id='heads' className={headSide} onClick={flip}>
          <p className='coin-text'>
            Heads
          </p>
        </button>
        <button id='tails' className={tailSide} onClick={flip}>
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
