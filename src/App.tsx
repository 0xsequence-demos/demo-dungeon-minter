import React, { useState, useEffect } from 'react'
import { Button, Box, Spinner, useTheme, Progress } from '@0xsequence/design-system'
import { useOpenConnectModal } from '@0xsequence/kit'
import { useDisconnect, useAccount } from 'wagmi'
import maze from './assets/maze.png'
import { useOpenWalletModal } from '@0xsequence/kit-wallet'

import './lootExpanse/styles.css'

// const ENDPOINT = "http://localhost:8787/"; 
const ENDPOINT = "https://proud-darkness-022a.yellow-shadow-d7ff.workers.dev"; 

let count = 0
let live = false;
let txHash: any = ''

function App() {
  const { setOpenConnectModal } = useOpenConnectModal()
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()
  const {setTheme} = useTheme()
  const [loadingTreasure, setLoadingTreasure] = useState(false)
  const [inDungeon, setInDungeon] = useState(true)
  const { setOpenWalletModal } = useOpenWalletModal()
  const [_, setShowElement] = useState(true);
  const [mintLoading, setMintLoading] = useState(false);
  const [progressStep, setProgressStep] = useState(1);
  const [progressValue, setProgressValue] = useState(0);
  const [progressDescription, setProgressDescription] = useState('Secenario.gg AI Generation');
  
  setTheme('dark')

  const [items, setItems] = useState<any>([])
  const [loaded, setLoaded] = useState(false);
  const [space, setSpace] = useState(false);

  useEffect(() =>{

  }, [progressStep, progressValue, progressDescription, items, loaded, inDungeon, loadingTreasure, mintLoading, txHash])

  const [loadCount, setLoadCount] = useState(0);

  const handleImageLoaded = () => {
    setLoadCount(prevCount => prevCount + 1);
  };

  useEffect(() => {
    setInDungeon(true)
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

      if (event.origin !== 'https://maze-inky.vercel.app') {
          // Security check: Ensure that the message is from a trusted source
          return;
      }
    
      if(event.data.portal == 'loot' && count == 0 && isConnected){
        setInDungeon(false)
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
    const json = await res.json()
    setLoaded(true)
    setLoadingTreasure(false)
    json.loot.loot.url = json.image
    json.loot.loot.tokenID = json.tokenID
    setItems([json.loot.loot])
    txHash=''
  }

  return (
    <>
      {
        !
          isConnected 
        ? 
          <>
            <div style={{
              justifyContent: 'center',
              width: '100vw',
              }}
            >
              <Box justifyContent={'center'}>
              <h1 style={{margin: '-4px'}}>d u n g e o n<br/> c r a w l e r</h1>
            </Box>
            <Box justifyContent={'center'}>
              <h1>l o o t b o x</h1>
            </Box>
            <Box justifyContent={'center'}>
              <img src={maze} width={225}/>
            </Box>
            <br/>
            <Box justifyContent={'center'}>
            <p className='homepage-description'>
              ... you've made your way through
              the internet & you've found
              yourself here
              <br/>
              <br/>
              search for lootboxes & unlock AI generation via <span><a href='https://www.scenario.com/' target='_blank'>Scenario.gg </a></span>
              minted to your wallet ...
            </p>
            </Box>
            <Box justifyContent={'center'} marginTop={'4'}>
              <Button label="connect" onClick={() => onClick()}/>
            </Box>
            <div style={{zIndex: 10, width: '300px',color: 'grey', position:'fixed', bottom: '15px', left: '30px'}}>
                <h2 className='network-powered-by'><a href='https://arbitrum.io/anytrust' target='_blank'><img width="200px" src="https://nova.arbiscan.io/images/logo-Arbiscan.svg?v=0.0.5"/></a></h2>
              </div> 
            </div>
          </>
        :
          <>
          {
            inDungeon 
            ? 
            <div>
            <div style={{color: 'white', position:'fixed', cursor: 'pointer', top: '15px', right: '30px'}} onClick={() => {setInDungeon(true);
                setInDungeon(false)
                setLoaded(false)
                setMintLoading(false)
                setLoadingTreasure(false)
                count = 0
                setItems([]);
                txHash = '';
                live= false
                disconnect()}}>
              <h1>sign out</h1>
              </div>
              <div className="black-bar"></div>

              <div className='container'>
                <iframe id='maze' src={`https://maze-inky.vercel.app/${ live ? '?refresh=true' : ''}`} width={window.innerWidth} height={window.innerHeight*.76} ></iframe>
                {/* <iframe id='maze' src={`http://localhost:8002/${ live ? '?refresh=true' : ''}`} width={window.innerWidth} height={window.innerHeight*.76} ></iframe> */}
              </div>
              <div style={{zIndex: 10, width: '220px',color: 'grey', position:'fixed', bottom: '15px', left: '30px'}}>
                <h2 className='click-instructions'>click on a lootbox to generate an item</h2>
              </div> 
              <div style={{zIndex: 10, color: 'white', cursor: 'pointer', position:'fixed', bottom: '30px', right: '30px'}}>
                <Button label='open wallet' onClick={() => setOpenWalletModal(true)}/>
              </div> 
            </div>
            :
            <>
            <br/>
            <div style={{color: 'white', position:'fixed', cursor: 'pointer', top: '30px', right: '30px'}} onClick={() => disconnect()}>
              <h1>sign out</h1>
            </div>
            { 
            !loadingTreasure
            // true 
            ? <div style={{zIndex: 10, color: 'white', cursor: 'pointer', position:'fixed', bottom: '30px', left: '30px'}} onClick={() => {txHash = '';live=true;setInDungeon(true);count=0;setItems([])}}>
              <Button label='back to maze?'/>
            </div> : null}
            <br/>
            {
                loadingTreasure 
              ? 
                <div style={{
                  position: 'fixed', 
                  top: '40%',       
                  left: '47%',   
                  transform: 'translate(-40%, -40%)',
                  zIndex: 1000,
                }}
                >
                  {/* @ts-ignore */}
                  <div className="frame" tier={'Rare'} style={{textAlign: 'center'}}>
                    <h1 className="name_Rare devils-note">
                    <br/>
                      loot that combines elements from diablo
                      <br/>
                      <br/>
                      it might tell you about your past and what you might need for the future
                      <br/>
                      <br/>

                      take a pass <br/>on items
                      <br/>
                      <br/>

                      or unlock what you want in this world
                    </h1>
                    <br/>
                    <Box justifyContent={'center'} padding={'2'} paddingRight={'16'} paddingLeft={'16'}>
                      <Progress value={progressValue}/>
                    </Box>
                    <Box paddingTop={'8'}>
                      <p>{progressDescription}</p>
                    </Box>
                    <Box paddingBottom={'8'}>
                      <p>{progressStep}/2 steps</p>
                    </Box>
                  </div>
                </div>
              : 
                null
            }
            <div className='doesnt-work' style={{
                  display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100vw',
              }}
               >
                <br/>
                <br/>
                {loaded ? <div className={`items-container fade-in`} style={{width: '100vw', marginTop: '20px', overflow: 'auto'}}>
                { !loadingTreasure ? <div style={{zIndex: 10, color: 'white', cursor: 'pointer', position:'fixed', top: '30px'}}>
                { mintLoading ? <div style={{
                  position: 'fixed', 
                  left: '50%',      
                  zIndex: 1000,
                }}
                >
                  <Spinner/>
                </div> : txHash != '' ? <div style={{
                  zIndex: 1000,
                }}
                ><p style={{color: 'orange'}}><a style={{color: 'orange'}} href={`https://nova.arbiscan.io/tx/${txHash}`} target='_blank'>&nbsp;Minted Tx Hash: {txHash.slice(0, 4)}...</a></p></div>: <div style={{margin: 'auto', textAlign: 'center'}}><Box justifyContent={'center'}> <p>would you like to mint this item?</p></Box><br/><Button label='mint' onClick={() => mint()}/></div> }
                {/* ><p style={{color: 'orange'}}><a style={{color: 'orange'}} href={`https://nova.arbiscan.io/tx/${txHash}`} target='_blank'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Tx Hash: {txHash.slice(0, 4)}...</a></p></div>: <Button label='mint' onClick={() => mint()}/> } */}
                </div> : null }
                <br/>
                <br/>
                <br/>
                <br/>
                {items.map((item: any, index: any) => (
                  //@ts-ignore
                  <div key={index} className="frame" tier={item.tier}>
                    {/*@ts-ignore*/}
                    <div className="view" tier={item.tier}>
                      <img
                        style={{ width: '296px' }}
                        src={item.url}
                        onLoad={handleImageLoaded}
                      />
                      <div className='standin' style={{ width: '266px', height: '266px'}} ></div>
                    </div>
                    <h1 className={`name_${item.tier}`}>
                      {item.name}
                    </h1>
                    <h2 className={`name_${item.tier}`}>
                      {item.tier} {item.type}
                    </h2>
                    <hr className="half" />
                    <ul>
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
                ))}
                  { !loadingTreasure ? 
                  <div style={{zIndex: 10, color: 'white', cursor: 'pointer', position:'fixed', bottom: '30px', right: '30px'}}>
                    <Button label='open wallet' onClick={() => setOpenWalletModal(true)}/>
                  </div> 
                  : null }
              </div> : null }
            </div>
            </>
          }
          </>
      }
  </>
  );
}

export default App;