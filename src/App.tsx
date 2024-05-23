import React, { useState, useEffect } from 'react'
import { Box, useTheme } from '@0xsequence/design-system'
import Grids from './Grids.tsx'
import './App.css'
import './lootExpanse/styles.css'
import playImage from './assets/play.svg'
// const ENDPOINT = "http://localhost:8787/"; 
import { SequenceIndexer } from '@0xsequence/indexer'
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import AppleSignin from 'react-apple-signin-auth';

const ENDPOINT = "http://localhost:8787"; 
// const ENDPOINT = "https://proud-darkness-022a.yellow-shadow-d7ff.workers.dev"; 

const PROJECT_ACCESS_KEY = import.meta.env.VITE_PROJECT_ACCESS_KEY!
const indexer = new SequenceIndexer('https://arbitrum-nova-indexer.sequence.app', PROJECT_ACCESS_KEY)
 
let count = 0
let live = false;
let txHash: any = ''
let cancelled = false
let address: any = null
// let loadingTreasure: boolean = false
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
    <div className="progress-container" style={{backgroundColor: bgcolor+'80'}}>
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
  const [appleHover, setAppleHover] = useState(false)
  useEffect(() => {

  }, [googleHover, appleHover])

  useEffect(() => {
    var button = document.querySelector('.react-apple-signin-auth-btn');
    if (button) {
        button.innerHTML = '';  // This clears out all the content inside the button
    }

    var button = document.querySelector('.react-apple-signin-auth-btn');
    if (button) {
        // Removing the SVG element
        var svg = button.querySelector('svg');
        if (svg) {
            button.removeChild(svg);
        }
    }

  }, [])

  const handleAppleLogin = async (response: any) => {
    const res = await sequence.signIn({
      idToken: response.authorization.id_token!
    }, "Dungeon Minter")
 
    address = res.wallet
    setIsConnected(true)
    setIsLoggingIn(false)
  }
  return (
    <>
    <div className="login-container">
      <div style={{textAlign: 'center', width: '100%', margin: 'auto'}}>
        <h1 style={{marginTop: '-67px'}}>Dungeon Minter</h1>
        <p className='content' style={{opacity: 0}}>DISCOVER LOOT BOXES TO MINT A UNIQUE COLLECTIBLE</p>
      </div>
      <br/>
      <span style={{color: 'grey', position: 'absolute', marginTop: '-30px'}}>SIGN IN VIA</span>
      <br/>
      <br/>
      <br/>
      </div>
      <div className="login-container" style={{marginTop: '-100px'}}>

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
     <p className='content' 
     onMouseLeave={() => setAppleHover(false)} 
     onMouseEnter={() => {setAppleHover(true)}}
     style={{position:'relative'}}>
         <span className='apple-login' onClick={() => {
          console.log('signing into apple')
        // appleAuthHelpers.signIn({
        //   authOptions: {
        //     clientId: 'com.sequence.dungeon-minter',
        //     scope: 'email',
        //     redirectURI: 'https://dungeon-minter.vercel.app/',
        //   },
        //   onSuccess: (response: any) => console.log(response),
        //   onError: (error: any) => console.log(error),
        // });
     }}>
      {/* @ts-ignore */}
      <AppleSignin
      key={sessionHash}
     authOptions={{
       clientId: 'com.sequence.dungeon-minter',
       scope: 'openid email',
       redirectURI: 'https://dungeon-minter.vercel.app/',
       usePopup: true,
       nonce: sessionHash
     }}
     onError={(error: any) => console.error(error)}
     onSuccess={handleAppleLogin}
    //  render={(props: any) => <button style={{width: '150px', position: 'absolute', color: 'transparent'}}>&nbsp;</button>}
   />Apple
   </span>
     
         {appleHover && <img src={playImage} alt="Play" className="play-image-apple" />}
     </p>
     </div>
   </div>
      </>
  );
}

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
let exploring: boolean = false

function App() {
  const [color, setColor] = useState<any>(null)
  const [isLoggingIn, setIsLoggingIn] = useState<any>(false)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const {setTheme} = useTheme()
  // const [exploring, setExploring] = useState(false)
  const [mintLoading, setMintLoading] = useState(false);
  const [progressStep, setProgressStep] = useState(1);
  const [progressValue, setProgressValue] = useState(0);
  const [progressDescription, setProgressDescription] = useState('SCENARIO.GG AI GENERATION...');
  const [__, setDailyMax] = useState(false)
  const [___, setIsMobile] = useState(false);
  const [collectibleViewable, setCollectibleViewable] = useState<any>(null)
  const [controller, setController] = useState<any>(null);
  const [increment, setIncrement] = useState(0)
  setTheme('dark')

  const [items, setItems] = useState<any>([])
  const [loaded, setLoaded] = useState(false);
  const [loadingTreasure, setLoadingTreasure] = useState(false);

  useEffect(() =>{

  }, [controller, isConnected, isLoggingIn, progressStep, progressValue, progressDescription, items, loaded, exploring, loadingTreasure, mintLoading, txHash])

  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, [isConnected])


  useEffect(() => {
    window.addEventListener('message', (event) => {

      // if (event.origin !== 'https://maze-inky.vercel.app') {
      //     // Security check: Ensure that the message is from a trusted source
      //     return;
      // }

      if(event.data.portal == 'loot' && count == 0 && isConnected){
        console.log(event.data.color)
        setColor(event.data.color)
        // setExploring(false)
        exploring = false;
        generate()
        count++
      }
    });
  }, [isConnected])

  // const handleScroll = () => {
  //   const scrollPosition = window.scrollY;
  //   const windowHeight = window.innerHeight;
  //   const documentHeight = document.documentElement.scrollHeight;
    
  //   // Calculate if the scroll is below 90% of the page
  //   if ((scrollPosition + windowHeight) / documentHeight > 0.9) {
  //     setShowElement(false);
  //   } else {
  //     setShowElement(true);
  //   }
  // };

  // useEffect(() => {
  //   window.addEventListener('scroll', handleScroll);

  //   // Clean up the event listener
  //   return () => {
  //     window.removeEventListener('scroll', handleScroll);
  //   };
  // }, []);

  const triggerProgressBar = async () => {
    const wait = (ms: any) => new Promise((res) => setTimeout(res, ms));
    const times = [17000, 18000, 2000, 5000];
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
    console.log('generating')
    cancelled = false
    setIncrement(increment+1)
    triggerProgressBar()

    // setLoadingTreasure(true)

    // loadingTreasure = true
    setLoadingTreasure(true)
    console.log(loadingTreasure)
    // alert(loadingTreasure)
    console.log(address)

    const newController = new AbortController();
    setController(newController);

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
      signal: newController.signal,
    })

    if(res.status == 400){
      console.log('reached daily max')
      setDailyMax(true)
    } else if(res.status == 200){
      const json = await res.json()
      console.log(json)
      setLoaded(true)
      // loadingTreasure = false
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

  useEffect(() => {
    console.log(`2px dashed ${color} !important`)
  }, [color])

  useEffect(() => {
    setTimeout(async () => {
      console.log(await sequence.isSignedIn())
      if(await sequence.isSignedIn()){
        address = await sequence.getAddress()
        // setExploring(true)
        exploring = true
        setIsConnected(true)
      }
    }, 0)
  }, [ isLoggingIn, setIsConnected, loaded])

  useEffect(()=> {

  },[exploring])

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

  }, [increment, transferLoading, loadingTreasure, exploring, count, progressValue])

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
          <div style={{position: 'fixed', bottom: '22px', left: '50%', transform: 'translateX(-50%)', width: '63%'}}>
             {
              !isMobileDevice() ? 
              <p style={{fontSize: '15px', color: '#555555ba'}} className="content">NETWORK POWERED BY <span style={{color: 'white',opacity: 0.7}}>ARBITRUM NOVA</span> / EMBEDDED WALLET POWERED BY <span style={{color: 'white'}}>SEQUENCE</span> / ARTWORK GENERATION WITH <span style={{color: 'white'}}>SCENARIO.GG</span></p>
              : <p style={{fontSize: '15px', color: '#555555ba'}} className="content">NETWORK POWERED BY <span style={{color: 'white',opacity: 0.7}}>ARBITRUM NOVA</span> /<br/> EMBEDDED WALLET POWERED BY <span style={{color: 'white'}}>SEQUENCE</span> /<br/> ARTWORK GENERATION WITH <span style={{color: 'white'}}>SCENARIO.GG</span></p>
             }
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
            <div style={{textAlign: 'center', width: '100%', margin: 'auto'}}>
              <h1 style={{margin: '-4px'}}>Dungeon Minter</h1>
              <p className='content'>DISCOVER LOOT BOXES TO MINT A UNIQUE COLLECTIBLE</p>
            </div>
            
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

            </div>
            <div style={{position: 'fixed', bottom: '22px', left: '50%', transform: 'translateX(-50%)', width: '63%'}}>
            {
              !isMobileDevice() ? 
              <p style={{fontSize: '15px', color: '#555555ba'}} className="content">NETWORK POWERED BY <span style={{color: 'white',opacity: 0.7}}>ARBITRUM NOVA</span> / EMBEDDED WALLET POWERED BY <span style={{color: 'white'}}>SEQUENCE</span> / ARTWORK GENERATION WITH <span style={{color: 'white'}}>SCENARIO.GG</span></p>
              : <p style={{fontSize: '15px', color: '#555555ba'}} className="content">NETWORK POWERED BY <span style={{color: 'white',opacity: 0.7}}>ARBITRUM NOVA</span> / <br/>EMBEDDED WALLET POWERED BY <span style={{color: 'white'}}>SEQUENCE</span> / <br/> ARTWORK GENERATION WITH <span style={{color: 'white'}}>SCENARIO.GG</span></p>
             }
            </div>
          </>
        :
          <>
          {
            <div>
             <div style={{color: 'white', position:'fixed', cursor: 'pointer', top: '15px', left: '30px'}} onClick={async () => {
                // setExploring(false)
                exploring = false
                setLoaded(false)
                setMintLoading(false)
                // loadingTreasure = false
                setLoadingTreasure(false)

                count = 0
                setItems([]);
                txHash = '';
                live= false
                setDailyMax(false)
                setIsConnected(false)
                setIsLoggingIn(false)
                address = null
                setProgressValue(0)
                setProgressDescription('SCENARIO.GG AI GENERATION...')
                setProgressStep(1)
                try {
                  console.log('signing out')
                  const sessions = await sequence.listSessions()
                  console.log(sessions)
                  await sequence.dropSession({ sessionId: sessions[0].id })
                location.reload()
                }catch(err){
                  console.log(err)
                }
                }}>
              <button className='logout-button'>
                sign out
              </button>
              </div>
              <div style={{height: '100vh'}}>
                {/* <iframe id='maze' src={`https://maze-inky.vercel.app/${ live ? '?refresh=true' : ''}`} width={window.innerWidth*.988} height={window.innerHeight*.995} ></iframe> */}
                <iframe id='maze' src={`http://localhost:8002/${ live ? '?refresh=true' : ''}`} width={window.innerWidth*.988} height={window.innerHeight*.995} ></iframe>
              </div>
              <div style={{zIndex: 10, width: '70vw', color: 'white', cursor: 'pointer', position:'fixed', bottom: isMobileDevice() ? '150px' : '30px', left: isMobileDevice() ? '30px' : '50%', transform: isMobileDevice() ? '0' : 'translateX(-50%)'}}>
                <div className={ isMobileDevice() ? "dashed-greeting-mobile":'dashed-greeting'}>
                  <p className='content' style={{fontSize: isMobileDevice() &&'15px' as any}}>Welcome to Dungeon Minter!
                    Walk around to discover loot boxes and click on a loot box to generate a unique collectible to mint to your Embedded Wallet.</p>
                </div>
              </div> 
              <div style={{zIndex: 10, color: 'white', cursor: 'pointer', position:'fixed', bottom: '25px', right: isMobileDevice() ? '30px' : '30px'}}>
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
                      padding: '60px',
                      borderWidth: `3px`,
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
                        {collectibleViewable.attributes.map((item_attributes: any) => {
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
            <div className="box-generation"
              style={{
                backgroundSize: '150%',
                backgroundPosition: 'center',
                backgroundImage: `radial-gradient(circle at 50% 50%, ${color}B3 0%, transparent 70%)`,
              }}
            >
              <div style={{
                width: '340px',
                marginTop: '-155px',
                paddingTop: '20px',
                backgroundColor: 'black',
                display: 'flex', /* Use flexbox to align children side by side */
                justifyContent: 'center', /* Align items to the center */
                alignItems: 'center', /* Center items vertically */
                flexDirection: 'column', /* Align children vertically for better control */
                padding: '10px',
                borderWidth: `3px`,
                borderStyle: `dashed`,
                borderColor: `${color}`}}>
                  <br/>
                <p style={{textAlign: 'center', fontSize: '40px', margin: '0px'}}>Loot box </p><p style={{textAlign: 'center', fontSize: '40px', marginTop: '-10px',marginBottom: '0px'}}>discovered!</p>
                <br/>
                <br/>
                {/* <Box justifyContent={'center'} paddingRight={'16'} paddingLeft={'16'}> */}
                <ProgressBar completed={progressValue*100} bgcolor={color} />

                  {/* <ProgressBar value={progressValue*100} maxValue={100} color={color} /> */}
                {/* </Box> */}
                <Box>
                  <p style={{color: color}}>{progressDescription}</p>
                </Box>
                <Box>
                  <p style={{color: color}}>{progressStep}/2 steps</p>
                </Box>
                <p className='content' style={{position:'relative'}} onClick={() => {
                  setProgressValue(0)
                  setProgressDescription('SCENARIO.GG AI GENERATION...')
                  setProgressStep(1)
                  count = 0
                  cancelled= true;
                  // loadingTreasure = false
                  setLoadingTreasure(false)

                  controller?.abort()
                  // setExploring(true)
                  exploring = true;
                  }}>
                    <span className='cancel-generation'>Cancel</span>
                    <img src={playImage} alt="Play" className="play-image-cancel" />
                </p>
              </div>
            </div>
            </>}
            {
              loaded && 
              <div className="box-generation"
              style={{
                backgroundSize: '150%',
                backgroundPosition: 'center',
                backgroundImage: `radial-gradient(circle, ${color}B3 0%, transparent 70%)`,
              }}
              >
              <div style={{
                width: '340px',
                height: '550px',
                paddingTop: '20px',
                backgroundColor: 'black',
                display: 'flex', /* Use flexbox to align children side by side */
                justifyContent: 'center', /* Align items to the center */
                alignItems: 'center', /* Center items vertically */
                flexDirection: 'column', /* Align children vertically for better control */
                padding: '10px',
                boxShadow: `0px 0px 450px 450px ${color}70`,
                borderWidth: `3px`,
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
                <p className='content' style={{position:'relative', marginTop: '-17px'}} onClick={() => {
                  setProgressValue(0)
                  setProgressDescription('SCENARIO.GG AI GENERATION...')
                  setProgressStep(1)
                  setLoaded(false)
                  txHash = ''
                  count = 0
                  cancelled= true;
                  // setExploring(true)
                  exploring = true;
                }}
                  >
                    <span className='cancel-generation'>{txHash != '' ? 'Close' : 'Cancel'}</span>
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