import React from 'react';
import ItemsCarousels from '../components/custom/ItemsCarousels.js';
const Market = () => {
  return (
    <div className='content'>
      <div className="">
        <div className="page-header" style = {{fontSize: '30px', fontWeight:'Bold'}}>
          <h1>Banana Marketplace</h1>
        </div>
        <ItemsCarousels />
      </div>
    </div>
  );
};

export default Market;
