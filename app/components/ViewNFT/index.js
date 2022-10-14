import Head from 'next/head';
import axios from "axios";
import { Metaplex } from '@metaplex-foundation/js';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

const connection = new Connection(clusterApiUrl(WalletAdapterNetwork.Devnet));
const mx = Metaplex.make(connection);

export default function ViewNFT({wallet}) {
  var address = wallet.publicKey.toJSON();
  const [nftList, setNftList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentView, setCurrentView] = useState(null);
  const perPage = 1;

  useEffect(() => {
    if (!nftList) {
      const fetchNFTs = async () => {
        setLoading(true);
        setCurrentView(null);
        address = "GrERKq7jzCEjnbP1Ttz838YEw12MG3AYgSTZKcHz259i";
        const list = await mx.nfts().findAllByOwner({ owner: new PublicKey(address)});
        setNftList(list);
        setCurrentPage(1);
      }
      fetchNFTs();
      return;
    }

    const execute = async () => {
      const startIndex = (currentPage - 1) * perPage;
      const endIndex = currentPage * perPage;
      await loadData(startIndex, endIndex);

      setCurrentView(nftList.slice(startIndex, endIndex));
      setLoading(false);
    };

    execute();
  }, [nftList, currentPage]);

  const loadData = async (startIndex, endIndex) => {
    const nftsToLoad = nftList.filter((_, index) => (index >= startIndex && index < endIndex))

    const promise = nftsToLoad.map(async (metadata) => {
        const uri = metadata.uri;
        const metafromuri = await axios(uri);
        const image = metafromuri.data.image;
        metadata.image = image;
    })
    await Promise.all(promise)
  };

  const changeCurrentPage = (operation) => {
    setLoading(true);
    if (operation === 'next') {
      setCurrentPage((prevValue) => prevValue + 1);
    } else {
      setCurrentPage((prevValue) => (prevValue > 1 ? prevValue - 1 : 1));
    }
  };

  return (
    <div>
      <div className="vApp">
        <div className="vcontainer">
          {loading ? (
            <img className="vloadingIcon" src="/loading.svg" />
          ) : (
            currentView &&
            currentView.map((nft, index) => (
              <div key={index} className="vnftPreview">
                <h1>{nft.name}</h1>
                {console.log(nft)}
                <img
                  className="vnftImage"
                  src={nft.image || '/fallbackImage.jpeg'}
                  alt="The downloaded illustration of the provided NFT address."
                />
              </div>
            ))
          )}
          {currentView && (
            <div className="vbuttonWrapper">
              <button
                disabled={currentPage === 1}
                className="vstyledButton"
                onClick={() => changeCurrentPage('prev')}
              >
                Prev Page
              </button>
              <button
                disabled={nftList && nftList.length / perPage === currentPage}
                className="vstyledButton"
                onClick={() => changeCurrentPage('next')}
              >
                Next Page
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}