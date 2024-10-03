import { ethers } from "ethers";
import { SequenceCollections, TokenMetadata } from "@0xsequence/metadata";
import { generateItem } from "./lootDataGenerator/database";
export interface IEnv {
  SCENARIO_MODEL_ID: string;
  SCENARIO_API_KEY: string;
  BUILDER_PROJECT_ID: number;
  COLLECTION_ID: string;
  JWT_ACCESS_KEY: string;
}

const uploadAsset = async (
  env: IEnv,
  projectID: string,
  collectionID: string,
  assetID: string,
  tokenID: string,
  url: string,
) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch file from ${url}: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const blob = new Blob([arrayBuffer]);
  const formData = new FormData();

  formData.append("file", blob, `image.png`); // You might want to dynamically determine the filename

  // Construct the endpoint URL
  const endpointURL = `https://metadata.sequence.app/projects/${projectID}/collections/${collectionID}/tokens/${tokenID}/upload/${assetID}`;

  try {
    // Use fetch to make the request
    const fetchResponse = await fetch(endpointURL, {
      method: "PUT",
      body: formData,
      headers: {
        Authorization: `Bearer ${env.JWT_ACCESS_KEY}`, // Put your token here
      },
    });

    // Assuming the response is JSON
    const data = (await fetchResponse.json()) as { url: string };
    return data;
  } catch (err) {
    console.log("error uploading image");
    console.log(err);
  }
};

const upload = async (
  env: IEnv,
  name: string,
  attributes: TokenMetadata["attributes"],
  imageUrl: string,
) => {
  const collectionsService = new SequenceCollections(
    "https://metadata.sequence.app",
    env.JWT_ACCESS_KEY,
  );

  const collectionID = Number(env.COLLECTION_ID);
  const projectId = env.BUILDER_PROJECT_ID;

  // tokenID
  const randomTokenIDSpace = ethers.BigNumber.from(
    ethers.utils.hexlify(ethers.utils.randomBytes(20)),
  );

  try {
    await collectionsService.createToken({
      projectId,
      collectionId: collectionID,
      token: {
        tokenId: String(randomTokenIDSpace),
        name,
        description: "A free AI treasure chest mini-game",
        decimals: 0,
        attributes,
      },
    });
  } catch (err) {
    console.log("error creating token");
    console.log(err);
  }

  let res2;

  try {
    res2 = await collectionsService.createAsset({
      projectId,
      asset: {
        id: Number(String(randomTokenIDSpace).slice(0, 10)),
        collectionId: collectionID,
        tokenId: String(randomTokenIDSpace),
        metadataField: "image",
      },
    });
  } catch (err) {
    console.log("error creating asset");
    console.log(err);
  }

  try {
    // upload asset
    const uploadAssetRes = await uploadAsset(
      env,
      projectId.toString(),
      collectionID.toString(),
      res2!.asset.id,
      String(randomTokenIDSpace),
      imageUrl,
    );

    return { url: uploadAssetRes.url, tokenID: String(randomTokenIDSpace) };
  } catch (err) {
    console.log(err);
    throw new Error("Sequence Metadata Service Fail");
  }
};

interface InferenceData {
  inferenceId: number;
  err?: string;
}

interface InferenceResultsData {
  inferenceId: number;
  inference: {
    status: string;
    images: Array<{ url: string }>;
  };
  err?: string;
}

const getInferenceWithItem = async (
  env: IEnv,
  prompt: string,
): Promise<InferenceData> => {
  console.log(
    `url: https://api.cloud.scenario.com/v1/models/${env.SCENARIO_MODEL_ID}/inferences`,
    `Authorization:Basic ${env.SCENARIO_API_KEY}`,
  );
  try {
    const res = await fetch(
      `https://api.cloud.scenario.com/v1/models/${env.SCENARIO_MODEL_ID}/inferences`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${env.SCENARIO_API_KEY}`,
          accept: "application/json",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          parameters: {
            numSamples: 1,
            qualityBoostScale: 4,
            qualityBoost: false,
            type: "txt2img",
            disableMerging: false,
            hideResults: false,
            referenceAdain: false,
            intermediateImages: false,
            scheduler: "EulerDiscreteScheduler",
            referenceAttn: false,
            prompt: prompt + " single object on black background no people",
          },
        }),
      },
    );

    const data = (await res.json()) as { inference: { id: number } };
    console.log(data);
    return { inferenceId: data.inference.id };
  } catch (err) {
    console.log(err);
    return { inferenceId: null, err: "ERROR" };
  }
};

const getInferenceObjectWithPolling = async (env: IEnv, id: InferenceData) => {
  console.log("getting inference status for: ", id.inferenceId);

  const headers = {
    Authorization: `Basic ${env.SCENARIO_API_KEY}`,
    accept: "application/json",
    "content-type": "application/json",
  };

  // Function to poll the inference status
  const pollInferenceStatus = async () => {
    let status = "";
    let inferenceData: InferenceResultsData = null;
    while (!["succeeded", "failed"].includes(status)) {
      // Fetch the inference details
      try {
        const inferenceResponse = await fetch(
          `https://api.cloud.scenario.com/v1/models/${env.SCENARIO_MODEL_ID}/inferences/${id.inferenceId}`,
          {
            method: "GET",
            headers,
          },
        );
        if (inferenceResponse.ok) {
          console.log(inferenceResponse.statusText);
          inferenceData =
            (await inferenceResponse.json()) as InferenceResultsData;
        }
      } catch (err) {
        console.log(err);
      }
      status = inferenceData.inference.status;
      console.log(`Inference status: ${status}`);

      // Wait for a certain interval before polling again
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Polling every 5 seconds
    }
    // Handle the final status
    if (status === "succeeded") {
      console.log("Inference succeeded!");
      console.log(inferenceData); // Print inference data
      return inferenceData;
    } else {
      console.log("Inference failed!");
      console.log(inferenceData); // Print inference data
      throw new Error("Scenario API Failed");
    }
  };

  // Start polling the inference status
  return await pollInferenceStatus();
};

export const onRequest: PagesFunction<IEnv> = async (ctx) => {
  console.log(JSON.stringify(ctx.env))
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

  // OPTIONAL
  // if(address.toLowerCase() != env.ADMIN.toLowerCase()){
  // 	if(!await hasDailyMintAllowance(env, address)){
  // 		return new Response(JSON.stringify({limitExceeded: true}), { status: 400 })
  // 	}
  // }

  let response: Response;
  try {
    console.log("generate");
    const loot = generateItem(Math.random() > 0.5 ? "Armor" : "Weapons");
    console.log("getInference");
    const prompt = `${loot.name}. ${loot.description}`;
    console.log(prompt);
    const id = await getInferenceWithItem(ctx.env, prompt);
    console.log("wait for inference");
    const inferenceObject = await getInferenceObjectWithPolling(ctx.env, id);
    console.log("upload");
    const uploadResponse = await upload(
      ctx.env,
      loot.name + " " + loot.type,
      // loot.attributes,
      [{ test: "a" }],
      inferenceObject.inference.images[0].url,
    );
    response = new Response(
      JSON.stringify({
        loot: loot,
        image: response.url,
        name: loot.name,
        tokenID: uploadResponse.tokenID,
      }),
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    response = new Response(JSON.stringify(error), { status: 500 }); // Handle errors
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
