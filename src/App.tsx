import React, { useState, useEffect } from 'react'
import { Button, Box, Spinner, useTheme } from '@0xsequence/design-system'
import { useOpenConnectModal } from '@0xsequence/kit'
import { useDisconnect, useAccount } from 'wagmi'
import maze from './assets/maze.png'
import { useOpenWalletModal } from '@0xsequence/kit-wallet'
import Grids from './Grids.tsx'
import './App.css'
import './lootExpanse/styles.css'
import playImage from './assets/play.svg'
// const ENDPOINT = "http://localhost:8787/"; 
import { SequenceIndexer } from '@0xsequence/indexer'
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';

const ENDPOINT = "https://proud-darkness-022a.yellow-shadow-d7ff.workers.dev"; 

const PROJECT_ACCESS_KEY = import.meta.env.VITE_PROJECT_ACCESS_KEY!
const indexer = new SequenceIndexer('https://arbitrum-nova-indexer.sequence.app', PROJECT_ACCESS_KEY)
 
let count = 0
let live = false;
let txHash: any = ''
let cancelled = false
let address: any = null
let loadingTreasure: boolean = false
import sequence from './SequenceEmbeddedWallet.ts'

export function useSessionHash() {
    const [sessionHash, setSessionHash] = useState("")
    const [error, setError] = useState<any>(undefined)

    useEffect(() => {
        const handler = async () => {
            try {
                setSessionHash(await sequence.getSessionHash())
            } catch (error) {
                console.error(error)
                setError(error)
            }
        }
        handler()
        return sequence.onSessionStateChanged(handler)
    }, [setSessionHash, setError])

    return {
        sessionHash,
        error,
        loading: !!sessionHash,
    }
}

const ProgressBar = ({ completed, bgcolor }: any) => {
  return (
    <div className="progress-container">
      <div className="progress-bar" style={{ width: `${completed}%`, backgroundColor: bgcolor }}>
      </div>
    </div>
  );
};

function LoginScreen({ setIsLoggingIn, setIsConnected } : any) {
  const { sessionHash } = useSessionHash()

  const handleGoogleLogin = async (tokenResponse: CredentialResponse) => {
    console.log(tokenResponse)
    const res = await sequence.signIn({
      idToken: tokenResponse.credential!
    }, "Dungeon Minter")
 
    address = res.wallet
    setIsConnected(true)
    setIsLoggingIn(false)
  }

  const [googleHover, setGoogleHover] = useState(false)
  useEffect(() => {

  }, [googleHover])
  return (
    <div className="login-container">
      <div className="dashed-box-login-box">
        <h1 className="title">Dungeon Minter</h1>
        <span style={{color: 'grey', position: 'absolute', marginTop: '-80px'}}>SIGN IN VIA</span>
        <br/>
        <div className='dashed-box-google'>
            <p className='content' style={{position:'relative'}}>
              <div className='gmail-login' onMouseLeave={() => setGoogleHover(false)} onMouseEnter={() => {setGoogleHover(true)}} style={{overflow: 'hidden', opacity: '0',width: '90px', position: 'absolute', zIndex: 1, height: '100px'}}>

                {googleHover&&<GoogleLogin 
                nonce={sessionHash}
                key={sessionHash}
                onSuccess={handleGoogleLogin} shape="circle" width={230} /> }
              </div>

                <span className='gmail-login'>Gmail</span>
                {googleHover&&<img src={playImage} alt="Play" className="play-image-gmail" />}
            </p>
        </div>
        <div className='dashed-box-apple'>
          <p className='content' style={{position:'relative'}}>
              <span className='apple-login'>Apple</span>
              <img src={playImage} alt="Play" className="play-image-apple" />
          </p>
        </div>
      <span style={{color: 'grey', position: 'absolute', marginTop: '180px', marginLeft: '5px'}}>(email login coming soon)</span>
      </div>

    </div>
  );
}

const MiniMap = ({x,y, map, steps, playerPosition, coloredCells, size = 9, isTopLeft }: any) => {
  const miniMapStyle = isTopLeft ? { top: '10px', left: '10px' } : { top: '10px', right: '10px' };

  const halfSize = Math.floor(size / 2);
  const maxX = map[0].length - 1;
  const maxY = map.length - 1;

  // Calculate start and end coordinates ensuring they stay within the map bounds
  const startX = Math.max(0, Math.min(playerPosition.x - halfSize, maxX - size + 1));
  const startY = Math.max(0, Math.min(playerPosition.y - halfSize, maxY - size + 1));
  const endX = startX + size;
  const endY = startY + size;

  // Extract the portion of the map to display based on player position
  const getMiniMap = () => {
      const miniMap = [];
      for (let y = startY; y < endY; y++) {
          const row = [];
          for (let x = startX; x < endX; x++) {
              // Check bounds to avoid undefined access
              const isInsideMap = x >= 0 && x < map[0].length && y >= 0 && y < map.length;
              const cellValue = isInsideMap ? map[y][x] : 0;  // Default to 0 if out-of-bounds
              const coloredCell = isInsideMap ? coloredCells.find((cell: any) => cell.x === x && cell.y === y) : null;
              row.push({ value: cellValue, color: coloredCell ? coloredCell.color : null });
          }
          miniMap.push(row);
      }
      return miniMap;
  };

  const miniMap = getMiniMap();
  useEffect(() => {

  }, [playerPosition, steps,x,y])

  return (
      <div className="mini-map" style={miniMapStyle}>
          {miniMap.map((row, i) => (
              <div key={i} className="row">
                  {row.map((cell, j) => (
                      <div
                          key={`${i}-${j}`}
                          className={`cell ${cell.value === 1 ? 'obstacle' : ''}`}
                      >
                          {cell.color && (
                              <div 
                                  className="color-marker" 
                                  style={{ backgroundColor: cell.color }}
                              />
                          )}
                          {i === halfSize && j === halfSize ? <div className="player-marker" style={{transform: `translate(-50%, -50%) rotate(${playerPosition.rotation}deg)`}}/> : null}
                      </div>
                  ))}
              </div>
          ))}
      </div>
  );
};


function ImageGallery({ items, setCollectibleViewable }: any) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      width: '350px',
      overflowY: 'auto',
      height: '300px',
      justifyContent: 'space-around'
    }}>
      {items.map((item: any, index: any) => (
        <div key={item.tokenId} 
        onClick={() => setCollectibleViewable(item)}
        style={{
          width: '100px', // Two columns
          display: 'flex',
          height: '150px',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '10px',
          cursor: 'pointer',
          marginTop: (index == 1 || index == 0) ? '-80px' :''
        }}>
          <div className="view" style={{scale: '0.45'}}>
          <img src={item.url} alt={`Token ${item.tokenId}`} style={{ width: '100%', height: 'auto' }} />
          </div>
          <span>{item.tokenId}</span>
        </div>
      ))}
    </div>
  );
}

function Collectible({ collectibleViewable }: any) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      width: '340px',
      marginTop: '-100px',
      justifyContent: 'center'
    }}>
      <div
        style={{
          width: '100px', // Two columns
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '10px',
          cursor: 'pointer',
        }}>
          <div className="view" style={{scale: '0.45'}}>
          <img src={collectibleViewable.url} alt={`Token`} style={{ width: '100%', height: 'auto' }} />
          </div>
          <p style={{width: '300px', 
          marginTop: '-70px',
          textAlign: 'center'}} className='content'>{collectibleViewable.name}</p>
      </div>
    </div>
  );
}

function App() {
  // const { isConnected, address } = useAccount()
  const [color, setColor] = useState<any>(null)
  const [isLoggingIn, setIsLoggingIn] = useState<any>(false)
  const [isConnected, setIsConnected] = useState<boolean>(true)
  // const [address, setAddress] = useState<any>(null)
  const {setTheme} = useTheme()
  // const [loadingTreasure, setLoadingTreasure] = useState(false)
  const [exploring, setExploring] = useState(false)
  const [_, setShowElement] = useState(true);
  const [mintLoading, setMintLoading] = useState(false);
  const [progressStep, setProgressStep] = useState(1);
  const [progressValue, setProgressValue] = useState(0);
  const [progressDescription, setProgressDescription] = useState('SCENARIO.GG AI GENERATION...');
  const [dailyMax, setDailyMax] = useState(false)
  const [isMobile, setIsMobile] = useState(false);
  const [collectibleViewable, setCollectibleViewable] = useState<any>(null)

  setTheme('dark')

  const [items, setItems] = useState<any>([])
  const [loaded, setLoaded] = useState(false);

  useEffect(() =>{

  }, [isConnected, isLoggingIn, progressStep, progressValue, progressDescription, items, loaded, exploring, loadingTreasure, mintLoading, txHash])

  const [loadCount, setLoadCount] = useState(0);

  const handleImageLoaded = () => {
    setLoadCount(prevCount => prevCount + 1);
  };

  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, [isConnected])


  useEffect(() => {
    window.addEventListener('message', (event) => {

      // if (event.origin !== 'https://maze-inky.vercel.app') {
          // Security check: Ensure that the message is from a trusted source
          // return;
      // 

      if(event.data.portal == 'loot' && count == 0 && isConnected){
        console.log(event.data.color)
        setColor(event.data.color)
        setExploring(false)
        generate()
        count++
      }
    });
  }, [isConnected])

  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Calculate if the scroll is below 90% of the page
    if ((scrollPosition + windowHeight) / documentHeight > 0.9) {
      setShowElement(false);
    } else {
      setShowElement(true);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const triggerProgressBar = async () => {
    const wait = (ms: any) => new Promise((res) => setTimeout(res, ms));
    const times = [10000, 8000, 2000, 5000];
    const steps = [1, 1, 2, 2];
    const totalDuration = times.reduce((prev, val) => prev + val, 0); // Calculate total duration once

    // Calculate cumulative progress values
    let cumulativeTime = 0; // Initialize cumulative time
    const progressValues = times.map((el) => {
        cumulativeTime += el; // Update cumulative time at each step
        return cumulativeTime / totalDuration; // Calculate cumulative progress
    });

    const progressDescriptions = ['SCENARIO.GG AI GENERATION...', 'SCENARIO.GG AI GENERATION...', 'UPLOADING METADATA TO SEQUENCE...', 'UPLOADING METADATA TO SEQUENCE...'];

    await wait(1000); // Initial wait before starting the loop

    for (let i = 0; i < times.length; i++) {
        setProgressStep(steps[i]);
        console.log(progressValues[i])
        setProgressValue(progressValues[i]);
        setProgressDescription(progressDescriptions[i]);
        await wait(times[i]); // Wait for the duration of the current step
        if(cancelled) break;
    }
};


  const mint = async () => {
    setMintLoading(true)

    const data = {
      address: address,
      mint: true,
      tokenID: items[0].tokenID
    };

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    console.log(json)
    txHash = json.txnHash
    setMintLoading(false)
  }

  const generate = async () => {
    cancelled = false
    triggerProgressBar()

    // setLoadingTreasure(true)

    loadingTreasure = true
    // alert(loadingTreasure)
    console.log(address)

    const data = {
      address: address,
      mint: false
    };

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if(res.status == 400){
      console.log('reached daily max')
      setDailyMax(true)
    } else {
      const json = await res.json()
      console.log(json)
      setLoaded(true)
      loadingTreasure = false
      json.loot.loot.url = json.image
      json.loot.loot.tokenID = json.tokenID
      setItems([json.loot.loot])
      txHash=''
    }
  }

  const playDemo = () => {
    setIsLoggingIn(true)
  }

  useEffect(() => {
    console.log(`2px dashed ${color} !important`)
  }, [color])

  useEffect(() => {
    setTimeout(async () => {
      console.log(exploring)
      if(await sequence.isSignedIn()){
        address = await sequence.getAddress()
        if(!loadingTreasure && !loaded) setExploring(true)
      }
    }, 0)
  }, [exploring, isLoggingIn, loaded])

  const [openWallet, setOpenWallet] = useState(false)
  const [collectibles, setCollectibles] = useState([])

  useEffect(()=> {
    console.log(loadingTreasure)
    if(openWallet){
      setTimeout(async () => {
        const accountAddress = address
        const tempCollectibles: any = []
        // query Sequence Indexer for all token balances of the account on Polygon
        const tokenBalances = await indexer.getTokenBalances({
          accountAddress: accountAddress,
          contractAddress: '0xaf8a08bf8b2945c2779ae507dade15985ea11fbc',
          includeMetadata: true
        })
        console.log(tokenBalances)
        tokenBalances.balances.map((token: any) => {
          tempCollectibles.push({
            name: token.tokenMetadata?.name,
            tokenID: token.tokenID,
            url: token.tokenMetadata?.image,
            attributes: token.tokenMetadata.attributes
          })
        })
        setCollectibles(tempCollectibles)
      }, 0)
    }
  }, [loadingTreasure, loaded, openWallet])

  const handleClick = () => {
    // Copy the address to the clipboard
    navigator.clipboard.writeText(address)
      .then(() => {
        console.log('Address copied to clipboard!');
        // Optionally, show a notification or change the UI to indicate success
      })
      .catch(err => {
        console.error('Failed to copy the address: ', err);
        // Optionally, handle errors (e.g., display an error message)
      });
  };

  function capitalizeFirstLetter(string: any) {
      return string.charAt(0).toUpperCase() + string.slice(1);
  }
  const [transferLoading, setTransferLoading] = useState(false)
  const [collectibleTo, setCollectibleTo] = useState(null)

  const sendCollectible = async () => {
    setTransferLoading(true)
    const tx = await sequence.sendERC1155({
      to: collectibleTo!,
      token: "0xaf8a08bf8b2945c2779ae507dade15985ea11fbc", // Skyweaver assets
      values: [
        {
          id: collectibleViewable.tokenID, // Asset ID
          amount: 1, // Amount for this asset
        },
      ],
    });
    console.log(tx)
    // setTimeout(() => {
      setTransferLoading(false)
      setCollectibleViewable(null)
      setOpenWallet(false)
    // }, 4000)
  }

  useEffect(() => {

  }, [transferLoading])

  return (
    <>
      {!isConnected && <Grids/>}
      {
        !
          isConnected 
        ? 
          isLoggingIn ? 
          <>
          <div style={{
              justifyContent: 'center',
              width: '90vw',
              }}
            >

          <LoginScreen setIsLoggingIn={setIsLoggingIn} setIsConnected={setIsConnected}/>
          <div style={{zIndex: 10, width: '300px',color: 'grey', position:'fixed', bottom: '15px', left: '30px'}}>
              <h2 className='network-powered-by'><a href='https://arbitrum.io/anytrust' target='_blank'><img width="200px" src="https://nova.arbiscan.io/images/logo-Arbiscan.svg?v=0.0.5"/></a></h2>
            </div> 
          <div style={{position: 'fixed', bottom: '22px', left: '51.1%', transform: 'translateX(-50%)', width: '45%'}}>
              <p style={{fontSize: '15px', color: 'grey'}} className="content">EMBEDDED WALLET POWERED BY <span style={{color: 'white'}}>SEQUENCE</span> / ARTWORK GENERATION WITH <span style={{color: 'white'}}>SCENARIO.GG</span></p>
            </div>
          </div>

          </>

          :
          <>
            <div style={{
              justifyContent: 'center',
              width: '100vw',
              }}
            >
            <Box justifyContent={'center'}>
              <h1 style={{margin: '-4px'}}>Dungeon Minter</h1>
            </Box>
            <Box justifyContent={'center'}>
              <p className='content'>DISCOVER LOOT BOXES TO MINT A UNIQUE COLLECTIBLE</p>
            </Box>
            <br/>
            <div style={{textAlign:'center'}}>

            <p className='content' style={{position: 'relative'}}>
                <span className='play-demo' onClick={() => playDemo()} >Play demo</span>
                <img src={playImage} alt="Play" className="play-image" />
            </p>
            <p className='content' style={{position: 'relative'}}>
                <span className='read-build-guide'><a className='no-link' href='https://docs.sequence.xyz/guides/lootbox-guide' target='_blank'>Read build guide</a></span>
                <img src={playImage} alt="Play" className="play-image-read-build-guide" />
            </p>
            </div>

            <div style={{zIndex: 10, width: '300px',color: 'grey', position:'fixed', bottom: '15px', left: '30px'}}>
                <h2 className='network-powered-by'><a href='https://arbitrum.io/anytrust' target='_blank'><img width="200px" src="https://nova.arbiscan.io/images/logo-Arbiscan.svg?v=0.0.5"/></a></h2>
              </div> 
            </div>
            <div style={{position: 'fixed', bottom: '22px', left: '51.1%', transform: 'translateX(-50%)', width: '45%'}}>
              <p style={{fontSize: '15px', color: 'grey'}} className="content">EMBEDDED WALLET POWERED BY <span style={{color: 'white'}}>SEQUENCE</span> / ARTWORK GENERATION WITH <span style={{color: 'white'}}>SCENARIO.GG</span></p>
            </div>
          </>
        :
          <>
          {
            <div>
             <div style={{color: 'white', position:'fixed', cursor: 'pointer', top: '15px', right: '30px'}} onClick={async () => {
                setExploring(false)
                setLoaded(false)
                setMintLoading(false)
                loadingTreasure = false
                count = 0
                setItems([]);
                txHash = '';
                live= false
                setDailyMax(false)
                disconnect()
                setIsConnected(false)
                setIsLoggingIn(false)
                try {
                  const sessions = await sequence.listSessions()
                  console.log(sessions)
                  await sequence.dropSession({ sessionId: sessions[0].id })
                }catch(err){
                  console.log(err)
                }
                }}>
              <button className='logout-button'>
                sign out
              </button>
              </div>
              <div style={{height: '100vh'}}>
                {/* <iframe id='maze' src={`https://maze-inky.vercel.app/${ live ? '?refresh=true' : ''}`} width={window.innerWidth} height={window.innerHeight*.76} ></iframe> */}
                <iframe id='maze' src={`http://localhost:8002/${ live ? '?refresh=true' : ''}`} width={window.innerWidth*.988} height={window.innerHeight*.995} ></iframe>
              </div>

              <div style={{zIndex: 10, color: 'white', cursor: 'pointer', position:'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)'}}>
                <div className='dashed-greeting'>
                  <p className='content'>Welcome to Dungeon Minter!
                    Walk around to discover loot boxes and click on a loot box to generate a unique collectible to mint to your Embedded Wallet.</p>
                </div>
              </div> 

              <div style={{zIndex: 10, color: 'white', cursor: 'pointer', position:'fixed', bottom: '30px', right: '30px'}}>
              <button className='open-wallet-button' onClick={() => setOpenWallet(true)}>
                open wallet
              </button>
                {/* <Button label='open wallet' onClick={() => setOpenWalletModal(true)}/> */}
              </div> 
              {
                openWallet 
                && 
                <>
                  <div className="box-generation">
                    <div style={{
                      width: '300px',
                      height: '480px',
                      paddingTop: '20px',
                      backgroundColor: 'black',
                      display: 'flex', /* Use flexbox to align children side by side */
                      justifyContent: 'center', /* Align items to the center */
                      alignItems: 'center', /* Center items vertically */
                      flexDirection: 'column', /* Align children vertically for better control */
                      padding: '50px',
                      boxShadow: `0px 0px 450px 450px ${color}70`,
                      borderWidth: `2px`,
                      borderStyle: `dashed`,
                      borderColor: `${color}`}}>
                        <br/>
                      <p style={{
                        marginTop: '-50px',
                        textAlign: 'center', 
                        paddingTop: '-80px',
                        fontSize: '29px', 
                        width: '100%', /* Make sure it spans the full width */
                        position: 'relative',
                        cursor: 'pointer',
                        marginBottom: '0px'

                        }}
                        onClick={handleClick}
                        >{address.slice(0,8) + '...' + address.slice(address.length - 4, address.length)}</p>
                      <br/>
                      {
                        !collectibleViewable ? 
                          <ImageGallery setCollectibleViewable={setCollectibleViewable} items={collectibles}/>
                        :
                          <Collectible collectibleViewable={collectibleViewable}/>
                      }
                      <br/>
                      <div style={{marginTop: '-50px'}}></div>
                      {collectibleViewable && <><hr className="half" />
                      <ul className="scrollable-item">
                        {collectibleViewable.attributes.map((item_attributes: any, index: any) => {
                          // <React.Fragment key={index}>
                          if(item_attributes.display_type != 'tier' && item_attributes.display_type !='type')
                          if(item_attributes.display_type == 'category'){
                            return <li style={{transform: 'translateY(-15px)'}} className={item_attributes.display_type}>{capitalizeFirstLetter(item_attributes.value)}</li>
                          } else {
                            return <li style={{transform: 'translateY(-15px)'}} >{item_attributes.trait_type +': '+ item_attributes.value}</li>
                          }
                      })}
                      </ul> </>}
                      <br/>
                      <br/>
                      {
                        collectibleViewable && <input className='transfer-to-address-input' onChange={(evt) => setCollectibleTo(evt.target.value as any)} placeholder='transfer to address'></input>
                      }
                      {collectibleViewable && !transferLoading && <button className='send-collectible-button' onClick={() =>sendCollectible()}>send collectible</button>}
                      {collectibleViewable && transferLoading && <p className='content'>Transfer pending...</p>}
                      <p className='content' style={{position:'relative'}} onClick={() => {
                        setOpenWallet(false)
                        setCollectibleViewable(null)
                        }}>
                          <span className='cancel-generation'>Cancel</span>
                          <img src={playImage} alt="Play" className="play-image-cancel" />
                      </p>
                    </div>
                  </div>
                </>
              }
            {!exploring && loadingTreasure && <> 
            <div className="box-generation">
              <div style={{
                width: '340px',
                height: '540px',
                paddingTop: '20px',
                backgroundColor: 'black',
                display: 'flex', /* Use flexbox to align children side by side */
                justifyContent: 'center', /* Align items to the center */
                alignItems: 'center', /* Center items vertically */
                flexDirection: 'column', /* Align children vertically for better control */
                padding: '10px',
                boxShadow: `0px 0px 450px 450px ${color}70`,
                borderWidth: `2px`,
                borderStyle: `dashed`,
                borderColor: `${color}`}}>
                  <br/>
                <p style={{textAlign: 'center', fontSize: '40px', margin: '0px'}}>Lootbox </p><p style={{textAlign: 'center', fontSize: '40px', marginTop: '-10px',marginBottom: '0px'}}>discovered!</p>
                <br/>
                <p style={{textAlign: 'center', margin: '0px'}}>loot that combines elements from diablo<br/>
                it might tell you about your past and what you might need for the future
                <br/>
                take a pass on items
                <br/>
                or unlock what you want in this world
                </p>
                <br/>
                {/* <Box justifyContent={'center'} paddingRight={'16'} paddingLeft={'16'}> */}
                <ProgressBar completed={progressValue*100} bgcolor={color} />

                  {/* <ProgressBar value={progressValue*100} maxValue={100} color={color} /> */}
                {/* </Box> */}
                <Box>
                  <p>{progressDescription}</p>
                </Box>
                <Box>
                  <p>{progressStep}/2 steps</p>
                </Box>
                <p className='content' style={{position:'relative'}} onClick={() => {
                  setProgressValue(0)
                  setProgressDescription('SCENARIO.GG AI GENERATION...')
                  setProgressStep(1)
                  count = 0
                  cancelled= true;
                  setExploring(true)}}>
                    <span className='cancel-generation'>Cancel</span>
                    <img src={playImage} alt="Play" className="play-image-cancel" />
                </p>
              </div>
            </div>
            </>}
            {
              loaded && 
              <div className="box-generation">
              <div style={{
                width: '340px',
                height: '515px',
                paddingTop: '20px',
                backgroundColor: 'black',
                display: 'flex', /* Use flexbox to align children side by side */
                justifyContent: 'center', /* Align items to the center */
                alignItems: 'center', /* Center items vertically */
                flexDirection: 'column', /* Align children vertically for better control */
                padding: '10px',
                boxShadow: `0px 0px 450px 450px ${color}70`,
                borderWidth: `2px`,
                borderStyle: `dashed`,
                borderColor: `${color}`}}>
                 {items.map((item: any, index: any) => {
                  console.log(item)
                //@ts-ignore
                return <div key={index} tier={item.tier}>
                  {/*@ts-ignore*/}
                  <div className="view" tier={item.tier} style={{scale: '0.5'}}>
                    <img
                      style={{ width: '298px' }}
                      src={item.url}
                      onLoad={handleImageLoaded}
                    />
                  </div>
                  <p className={`content`} style={{marginLeft: '40px', marginTop: '-50px'}}>
                    {item.name}
                  </p>
                  <h2 className={`name_${item.tier}`}>
                    {item.tier} {item.type}
                  </h2>
                  <hr className="half" />
                  <ul className="scrollable-list">
                    {item.main_stats.map((stat: any, index: any) => (
                      <React.Fragment key={index}>
                        <li className={item.category}>{stat}</li>
                        {item.stats.map((stat: any, statIndex: any) => (
                          <li key={statIndex}>{stat}</li>
                        ))}
                      </React.Fragment>
                    ))}
                  </ul>
                </div>
                })}
                {!mintLoading && txHash == '' && <p className='content' style={{position:'relative', marginTop: '-10px'}} onClick={() => {
                  mint()
                  count = 0
                  cancelled= true;
                  }}>
                    <span className='mint-generation'>Mint to wallet</span>
                    <img src={playImage} alt="Play" className="play-image-mint" />
                </p> }
                {
                  mintLoading && <p className='content'>Mint pending...</p>
                }
                {
                  txHash && <p onClick={() => window.open(`https://nova.arbiscan.io/tx/${txHash}`)} style={{color: 'orange', cursor: 'pointer'}}>{`see minted hash: ${txHash.slice(0, 4)}... on explorer`}</p>
                }
                <p className='content' style={{position:'relative'}} onClick={() => {
                  setProgressValue(0)
                  setProgressDescription('SCENARIO.GG AI GENERATION...')
                  setProgressStep(1)
                  setLoaded(false)
                  txHash = ''
                  count = 0
                  cancelled= true;
                  setExploring(true)}}>
                    <span className='cancel-generation'>Cancel</span>
                    <img src={playImage} alt="Play" className="play-image-cancel" />
                </p>
              </div>
            </div>
            }
            </div>
          }
        </>
      }
  </>
  );
}

export default App;