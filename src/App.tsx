import React, { useState, useEffect } from 'react'
import { Button, Box, Spinner, useTheme, Progress } from '@0xsequence/design-system'
import { useOpenConnectModal } from '@0xsequence/kit'
import { useDisconnect, useAccount } from 'wagmi'
import maze from './assets/maze.png'
import { useOpenWalletModal } from '@0xsequence/kit-wallet'
import Grids from './Grids.tsx'
import './App.css'
import './lootExpanse/styles.css'
import playImage from './assets/play.svg'
const ENDPOINT = "http://localhost:8787/"; 
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';

// const ENDPOINT = "https://proud-darkness-022a.yellow-shadow-d7ff.workers.dev"; 
import { useGoogleLogin } from '@react-oauth/google';
let count = 0
let live = false;
let txHash: any = ''

const PROJECT_ACCESS_KEY = import.meta.env.VITE_PROJECT_ACCESS_KEY!

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
function LoginScreen({ setAddress, isLoggingIn, setIsConnected } : any) {
  const { sessionHash } = useSessionHash()
  // const login = useGoogleLogin({
  //   onSuccess: async (tokenResponse: any) => {
  //     const idToken = tokenResponse.access_token
  //     console.log(tokenResponse)
  //     // const res = await waas.signIn({ idToken }, "Dungeon Minter")
  //     // console.log(tokenResponse)

  //   },
  // });

  const handleGoogleLogin = async (tokenResponse: CredentialResponse) => {
    console.log(tokenResponse)
    const res = await sequence.signIn({
      idToken: tokenResponse.credential!
    }, "Dungeon Minter")
 
    setAddress(res.wallet)
    setIsConnected(true)
    isLoggingIn(false)
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

function App() {
  const { setOpenConnectModal } = useOpenConnectModal()
  // const { isConnected, address } = useAccount()
  const [isLoggingIn, setIsLoggingIn] = useState<any>(false)
  const [isConnected, setIsConnected] = useState<boolean>(true)
  const [address, setAddress] = useState<any>(null)
  const { disconnect } = useDisconnect()
  const {setTheme} = useTheme()
  const [loadingTreasure, setLoadingTreasure] = useState(false)
  const [exploring, setExploring] = useState(true)
  const { setOpenWalletModal } = useOpenWalletModal()
  const [_, setShowElement] = useState(true);
  const [mintLoading, setMintLoading] = useState(false);
  const [progressStep, setProgressStep] = useState(1);
  const [progressValue, setProgressValue] = useState(0);
  const [progressDescription, setProgressDescription] = useState('Secenario.gg AI Generation');
  const [dailyMax, setDailyMax] = useState(false)
  const [isMobile, setIsMobile] = useState(false);

  setTheme('dark')

  const [items, setItems] = useState<any>([])
  const [loaded, setLoaded] = useState(false);
  const [space, setSpace] = useState(false);

  useEffect(() =>{

  }, [isConnected, setIsLoggingIn, progressStep, progressValue, progressDescription, items, loaded, exploring, loadingTreasure, mintLoading, txHash])

  const [loadCount, setLoadCount] = useState(0);

  const handleImageLoaded = () => {
    setLoadCount(prevCount => prevCount + 1);
  };

  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  useEffect(() => {
    setIsMobile(isMobileDevice());
    setExploring(true)
  }, [isConnected])

  useEffect(() => {
    if (loadCount === items.length) {
      setLoaded(true);
      setSpace(true)
      console.log('loaded', loaded)
    const elements = document.querySelectorAll('.standin');

    elements.forEach((el: any) => {
      el?.parentNode?.removeChild(el);
    });
    }
  }, [loadCount, items.length, space]);

  useEffect(() => {
    window.addEventListener('message', (event) => {

      // if (event.origin !== 'https://maze-inky.vercel.app') {
          // Security check: Ensure that the message is from a trusted source
          // return;
      // }
    
      if(event.data.portal == 'loot' && count == 0 && isConnected){
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

  const onClick = () => {
    setOpenConnectModal(true)
  }

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

    const progressDescriptions = ['Scenario.gg AI Generation', 'Scenario.gg AI Generation', 'Uploading Metadata to Sequence', 'Uploading Metadata to Sequence'];

    await wait(1000); // Initial wait before starting the loop

    for (let i = 0; i < times.length; i++) {
        setProgressStep(steps[i]);
        setProgressValue(progressValues[i]);
        setProgressDescription(progressDescriptions[i]);
        await wait(times[i]); // Wait for the duration of the current step
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
    triggerProgressBar()

    setLoadingTreasure(true)

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
      setLoaded(true)
      setLoadingTreasure(false)
      json.loot.loot.url = json.image
      json.loot.loot.tokenID = json.tokenID
      setItems([json.loot.loot])
      txHash=''
    }
  }

  const playDemo = () => {
    setIsLoggingIn(true)
  }

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

          <LoginScreen setAddress={setAddress} isLoggingIn={isLoggingIn} setIsConnected={setIsConnected}/>
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
             <div style={{color: 'white', position:'fixed', cursor: 'pointer', top: '15px', right: '30px'}} onClick={async () => {setInDungeon(true);
                setExploring(false)
                setLoaded(false)
                setMintLoading(false)
                setLoadingTreasure(false)
                count = 0
                setItems([]);
                txHash = '';
                live= false
                setDailyMax(false)
                disconnect()
                setIsConnected(false)
                const sessions = await sequence.listSessions()
                await sequence.dropSession({ sessionId: sessions[0].id })
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
              <button className='open-wallet-button'>
                open wallet
              </button>
                {/* <Button label='open wallet' onClick={() => setOpenWalletModal(true)}/> */}
              </div> 
            {!exploring && <> 
            <div className="box-generation">
              <div className="dashed-box-generation-box">
                hi
              </div>
            </div>
            </>}
            </div>
            // :
            // <>
            // <br/>
            // {!isMobile && !exploring ? <div style={{color: 'white', position:'fixed', cursor: 'pointer', top: '30px', right: '30px'}} onClick={() => {setExploring(false)
            //     setLoaded(false)
            //     setMintLoading(false)
            //     setLoadingTreasure(false)
            //     count = 0
            //     setItems([]);
            //     txHash = '';
            //     live= false
            //     setDailyMax(false)
            //     disconnect()}}>
            //   <h1>sign out</h1>
            // </div> : null }
            // { 
            // !loadingTreasure
            // // true 
            // ? <div style={{zIndex: 10, color: 'white', cursor: 'pointer', position:'fixed', bottom: '30px'}} onClick={() => {setProgressValue(0);setProgressDescription('Scenario.gg AI Generation');setProgressStep(1);txHash = '';live=true;setInDungeon(true);count=0;setItems([])}}>
            //   <Button label='back to maze?'/>
            // </div> : null}
            // <br/>
            // {
            //     loadingTreasure 
            //   ? 
            //     <div style={{
            //       position: 'fixed', 
            //       top: '40%',       
            //       left: '47%',   
            //       transform: 'translate(-40%, -40%)',
            //       zIndex: 1,
            //     }}
            //     >
            //       {/* @ts-ignore */}
            //       {!dailyMax ? <div className="frame" tier={'Note'} style={{textAlign: 'center'}}>
            //         <h1 className="name_Devils_Note devils-note">
            //         <br/>
            //           loot that combines elements from diablo
            //           <br/>
            //           <br/>
            //           it might tell you about your past and what you might need for the future
            //           <br/>
            //           <br/>

            //           take a pass <br/>on items
            //           <br/>
            //           <br/>

            //           or unlock what you want in this world
            //         </h1>
            //         <br/>
            //         <Box justifyContent={'center'} padding={'2'} paddingRight={'16'} paddingLeft={'16'}>
            //           <Progress value={progressValue}/>
            //         </Box>
            //         <Box paddingTop={'8'}>
            //           <p>{progressDescription}</p>
            //         </Box>
            //         <Box paddingBottom={'8'}>
            //           <p>{progressStep}/2 steps</p>
            //         </Box>
            //       </div> :
            //       <>
            //       {/* @ts-ignore */}
            //       <div className="frame" tier={'Max'} style={{textAlign: 'center'}}>
            //         <h1 className="name_Devils_Note devils-note">
            //         <br/>
            //           you've reached your daily max
            //           <br/>
            //           <br/>
            //           please allow some time to cool down
            //           <br/>
            //           <br/>
            //           <br/>
            //           <Button label="open wallet" onClick={() => setOpenWalletModal(true)}></Button>
            //         </h1>
            //         <br/>
            //       </div>
            //       </>
            //       }
            //       </div>
            //   : 
            //     null
            // }
            // <div className='doesnt-work' style={{
            //       display: 'flex',
            //     justifyContent: 'center',
            //     alignItems: 'center',
            //     width: '100vw',
            //   }}
            //    >
            //     <br/>
            //     <br/>
            //     {loaded ? <div className={`items-container fade-in`} style={{width: '100vw', marginTop: '35px', overflow: 'auto'}}>
            //     { !loadingTreasure ? <div style={{zIndex: 10, color: 'white', cursor: 'pointer', position:'fixed', top: '30px'}}>
            //     { mintLoading ? <div style={{
            //       position: 'fixed', 
            //       left: '50%',      
            //       zIndex: 1000,
            //     }}
            //     >
            //       <Spinner/>
            //     </div> : txHash != '' ? <div style={{
            //       zIndex: 1000,
            //     }}
            //     >
            //       <Button onClick={() => window.open(`https://nova.arbiscan.io/tx/${txHash}`)} label={`see minted hash: ${txHash.slice(0, 4)}... on explorer`} style={{color: 'orange'}}>
            //       </Button>
            //         {/* <a style={{color: 'orange'}} href={`https://nova.arbiscan.io/tx/${txHash}`} target='_blank'>&nbsp;Minted Tx Hash: {txHash.slice(0, 4)}...</a> */}
            //       </div>
            //       : <div style={{margin: 'auto', textAlign: 'center'}}><Box marginBottom={'2'} justifyContent={'center'}> <p>would you like to mint this item?</p></Box><Button label='mint' onClick={() => mint()}/></div> }
            //     {/* ><p style={{color: 'orange'}}><a style={{color: 'orange'}} href={`https://nova.arbiscan.io/tx/${txHash}`} target='_blank'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Tx Hash: {txHash.slice(0, 4)}...</a></p></div>: <Button label='mint' onClick={() => mint()}/> } */}
            //     </div> : null }
            //     <br/>
            //     <br/>
            //     <br/>
            //     <br/>
            //     {items.map((item: any, index: any) => (
            //       //@ts-ignore
            //       <div key={index} className="frame" tier={item.tier}>
            //         {/*@ts-ignore*/}
            //         <div className="view" tier={item.tier}>
            //           <img
            //             style={{ width: '298px' }}
            //             src={item.url}
            //             onLoad={handleImageLoaded}
            //           />
            //           <div className='standin' style={{ width: '266px', height: '266px'}} ></div>
            //         </div>
            //         <h1 className={`name_${item.tier}`}>
            //           {item.name}
            //         </h1>
            //         <h2 className={`name_${item.tier}`}>
            //           {item.tier} {item.type}
            //         </h2>
            //         <hr className="half" />
            //         <ul>
            //           {item.main_stats.map((stat: any, index: any) => (
            //             <React.Fragment key={index}>
            //               <li className={item.category}>{stat}</li>
            //               {item.stats.map((stat: any, statIndex: any) => (
            //                 <li key={statIndex}>{stat}</li>
            //               ))}
            //             </React.Fragment>
            //           ))}
            //         </ul>
            //       </div>
            //     ))}
            //       { !loadingTreasure ? 
            //       <div style={{zIndex: 10, color: 'white', cursor: 'pointer', position:'fixed', bottom: '30px', right: '30px'}}>
            //         <Button label='open wallet' onClick={() => setOpenWalletModal(true)}/>
            //       </div> 
            //       : null }
            //   </div> : null }
            // </div>
            // </>
          }
          </>
      }
  </>
  );
}

export default App;