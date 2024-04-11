import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import { ThemeProvider } from '@0xsequence/design-system'
import { KitProvider } from '@0xsequence/kit'
import { getDefaultConnectors } from '@0xsequence/kit-connectors'
import { KitWalletProvider } from '@0xsequence/kit-wallet'

import { createConfig, WagmiConfig} from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { arbitrumNova} from 'wagmi/chains'
const PROJECT_ACCESS_KEY = import.meta.env.VITE_PROJECT_ACCESS_KEY!
const WALLET_CONNECT_ID = import.meta.env.VITE_WALLET_CONNECT_ID!

const queryClient = new QueryClient()

function Dapp() {
	const chains = [arbitrumNova] as any
  
	const projectAccessKey = PROJECT_ACCESS_KEY

	const connectors = getDefaultConnectors({
		walletConnectProjectId: WALLET_CONNECT_ID,
		defaultChainId: 42170,
		//@ts-ignore
		appName: 'Dungeon Crawler Lootbox Demo app',
		projectAccessKey
	  })
	
	  const transports: any = {}
	
	  const config = createConfig({
		// @ts-ignore
		transports,
		connectors,
		chains
	  })
  	const kitConfig: any = {
		projectAccessKey: PROJECT_ACCESS_KEY,
		position: 'center',
		defaultTheme: 'dark',
		displayedAssets: [
			{
				contractAddress: '0xaf8a08bf8b2945c2779ae507dade15985ea11fbc',
				chainId: 42170
			}
		],
		signIn: {
			projectName: 'Demo Dungeon Crawler Lootbox',
			showEmailInput: true,
			socialAuthOptions: ['google', 'apple'],
			walletAuthOptions: []
		}
	}

  return (
    <WagmiConfig config={config}>
	  <QueryClientProvider client={queryClient}> 
		<KitProvider config={kitConfig}>
			
			<KitWalletProvider>
				<ThemeProvider>
					<App />
				</ThemeProvider>
			</KitWalletProvider>
		</KitProvider>
	  </QueryClientProvider>
    </WagmiConfig>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Dapp />
  </React.StrictMode>,
)