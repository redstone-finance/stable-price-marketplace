export default function Card(props) {
  return (
    <div className="card nft-card increase-on-hover">
      <div className="left">
        <img className="nft-icon" src={props.image} />
        <div className="nft-token-id">
          NFT #{props.tokenId}
        </div>
      </div>
      
      <div className="post-sell-order-button-container">
        <a
          className="button"
          href="#"
          style={{color: props.buttonTextColor}}
          onClick={() => alert(props)}
        >
          {props.buttonText}
        </a>
      </div>
    </div>
  );
}
