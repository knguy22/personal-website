import './coin.css'

export default function CoinFlip() {
  return (
    <div className="flex flex-col items-center justify-start h-screen pt-20">
      <div id='coin' className="relative w-60 h-60">
        <div id='heads' className="bg-red-800">
          <p className='coin-text'>
            Heads
          </p>
        </div>
        <div id='tails' className="bg-green-800">
          <p className='coin-text'>
            Tails
          </p>
        </div>
      </div>
      <p className="text-4xl flex-col items-center text-center justify-between pt-10">
        Flip the coin!
      </p>
    </div>
  );
}
