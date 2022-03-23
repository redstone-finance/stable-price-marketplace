import { useState, useEffect } from "react";
import Card from "./Card";
import "./styles.scss";

export default function App() {
  const [address, setAddress] = useState('');
  const [orders, setOrders] = useState([
    {
      tokenId: 1,
      price: 55.5,
      status: 'active',
      creator: '0x195bf26a67bBdA2694C5D2E4B4d21701f63977cF',
    },
    {
      tokenId: 2,
      price: 15.2,
      status: 'canceled',
      creator: '0x195bf26a67bBdA2694C5D2E4B4d21701f63977cF',
    },
  ]);
  const [ownedNfts, setOwnedNfts] = useState([
    2,7,9,10
  ]);

  // useEffect()
  async function sellButtonClicked(tokenId) {
    alert(`Token id: ${tokenId}`);
  }

  function shortenAddress(address) {
    return address.slice(0, 5) + '...';
  }

  return (
    <div className="App">
      <div id="main-content" class="card-with-shadow">
        <div id="nft-secion">
          <h2>My tokens</h2>
          <div className="cards-container">
            {ownedNfts.map(nft => (
              <Card
                tokenId={nft}
                image="img/nft-icon.png"
                buttonText="SELL"
              />
            ))}
          </div>
        </div>
        <div id="orders-section">
          <h2>Orders</h2>
          <div className="cards-container">
            {ownedNfts.map(nft => (
              <Card
                tokenId={nft}
                image="img/nft-in-cart-icon.png"
                buttonText={"BUY FOR " + Number.parseFloat(Math.random() * 20).toFixed(2)}
                buttonTextColor="#0F9D58"
              />
            ))}
          </div>
        </div>
      </div>

      <div id="logo" class="card-with-shadow">
        Stable marketplace
      </div>

      <div id="wallet-connector" class="card-with-shadow">
        {address
          ? (address)
          : (<a className="button" href="#" onClick={() => alert('hehe')}>Connect wallet</a>)
        }
      </div>

      <div id="powered-by-redstone">
        <div>
          
        </div>
        Powered by
        <a href="https://redstone.finance">
          <img
            src="img/redstone-logo.png"
            alt="redstone-logo"
            width="100"
          />
        </a>
      </div>
    </div>
  );
}
