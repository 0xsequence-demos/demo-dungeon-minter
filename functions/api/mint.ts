import {
  networks,
  findSupportedNetwork,
  NetworkConfig,
} from "@0xsequence/network";
import { ethers } from "ethers";
import { Session, SessionSettings } from "@0xsequence/auth";

export interface IEnv {
  CHAIN_HANDLE: string;
  EOA_WALLET_PKEY: string;
  CONTRACT_ADDRESS: string;
  BUILDER_PROJECT_ACCESS_KEY: string;
}

const callContract = async (
  env: IEnv,
  collectibleAddress: string,
  address: string,
  tokenID: number,
): Promise<ethers.providers.TransactionResponse> => {
  const chainConfig: NetworkConfig = findSupportedNetwork(env.CHAIN_HANDLE)!;

  const provider = new ethers.providers.StaticJsonRpcProvider({
    url: chainConfig.rpcUrl,
    skipFetchSetup: true, // Required for ethers.js Cloudflare Worker support
  });

  const walletEOA = new ethers.Wallet(env.EOA_WALLET_PKEY, provider);
  const relayerUrl = `https://${chainConfig.name}-relayer.sequence.app`;

  // Open a Sequence session, this will find or create
  // a Sequence wallet controlled by your server EOA
  const settings: Partial<SessionSettings> = {
    networks: [
      {
        ...networks[chainConfig.chainId],
        rpcUrl: chainConfig.rpcUrl,
        provider: provider, // NOTE: must pass the provider here
        relayer: {
          url: relayerUrl,
          provider: {
            url: chainConfig.rpcUrl,
          },
        },
      },
    ],
  };

  // Create a single signer sequence wallet session
  const session = await Session.singleSigner({
    settings: settings,
    signer: walletEOA,
    projectAccessKey: env.BUILDER_PROJECT_ACCESS_KEY,
  });

  const signer = session.account.getSigner(chainConfig.chainId);

  // Standard interface for ERC1155 contract deployed via Sequence Builder
  const collectibleInterface = new ethers.utils.Interface([
    "function mint(address to, uint256 tokenId, uint256 amount, bytes data)",
  ]);

  const data = collectibleInterface.encodeFunctionData("mint", [
    `${address}`,
    `${tokenID}`,
    "1",
    "0x00",
  ]);

  const txn = {
    to: collectibleAddress,
    data: data,
  };

  try {
    return await signer.sendTransaction(txn);
  } catch (err) {
    console.error(`ERROR: ${err}`);
    throw err;
  }
};

export const onRequest: PagesFunction<IEnv> = async (ctx) => {
  if (ctx.request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        // Allow requests from any origin - adjust this as necessary
        "Access-Control-Allow-Origin": "*",

        // Allows the headers Content-Type, your-custom-header
        "Access-Control-Allow-Headers": "Content-Type, your-custom-header",

        // Allow POST method - add any other methods you need to support
        "Access-Control-Allow-Methods": "POST",

        // Optional: allow credentials
        "Access-Control-Allow-Credentials": "true",

        // Preflight cache period
        "Access-Control-Max-Age": "86400", // 24 hours
      },
    });
  }

  let response: Response;

  const payload = (await ctx.request.json()) as {
    address: string;
    tokenID: string;
  };
  const { address, tokenID } = payload;

  try {
    const txn = await callContract(
      ctx.env,
      ctx.env.CONTRACT_ADDRESS,
      address,
      parseInt(tokenID),
    );
    response = new Response(JSON.stringify({ txnHash: txn.hash }), {
      status: 200,
    });
  } catch (error: unknown) {
    console.log(error);
    response = new Response(JSON.stringify(error), { status: 400 });
  }

  // Set CORS headers
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");

  // return response
  return response;
};
