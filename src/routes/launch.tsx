import { createFileRoute } from "@tanstack/react-router";
import { BondingCurve, BondingCurveFactory, MemeFactory } from "../sway-api";
import {
  arrayify,
  createAssetId,
  hexlify,
  BytesLike,
  chunkAndPadBytes,
} from "fuels";
import { calcRoot } from "@fuel-ts/merkle";
import { useState } from "react";
import { Link } from "../components/Link";
import { Button } from "../components/Button";
import toast from "react-hot-toast";
import { B256_ZERO, TESTNET_MEME_FACTORY_CONTRACT_ID } from "../lib";
import { Input } from "../components/Input";
import { useActiveWallet } from "../hooks/useActiveWallet";
import { Textarea } from "../components/Textarea"; // Import the functions you need from the SDKs you need
import firebase from "firebase/app";
import "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const _storageRef = firebase.storage().ref();

// const storage = firebase.storage();

export const Route = createFileRoute("/launch")({
  component: Launch,
});

const memeFactoryContractId = TESTNET_MEME_FACTORY_CONTRACT_ID; // Testnet Contract ID

export const getContractRoot = (bytecode: BytesLike): string => {
  const chunkSize = 16 * 1024;
  const bytes = arrayify(bytecode);
  const chunks = chunkAndPadBytes(bytes, chunkSize);

  return calcRoot(chunks.map((c) => hexlify(c)));
};

function Launch() {
  const [newCurve, setNewCurve] = useState<BondingCurve>();
  const [name, setName] = useState<string>();
  const [symbol, setSymbol] = useState<string>();
  const [description, setDescription] = useState<string>();
  const [image, setImage] = useState<string>();
  const [twitter, setTwitter] = useState<string>();
  const [telegram, setTelegram] = useState<string>();
  const [website, setWebsite] = useState<string>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [moreOptions, setMoreOptions] = useState(false);
  const [assetId, setAssetId] = useState<string>();
  const { wallet } = useActiveWallet();
  const memeFactorycontract =
    wallet && new MemeFactory(memeFactoryContractId, wallet);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files;
    if (uploadedFile?.length) {
      setSelectedFile(uploadedFile[0]);
      if (!uploadedFile[0].type.includes("image")) {
        toast.error("Invalid image format. Please upload a valid image format");
        return;
      } else {
        setSelectedFile(uploadedFile[0]);
      }
    }
  };

  const onLaunchPress = async () => {
    if (!!newCurve) {
      return toast.error("Launch already started");
    }

    if (!wallet) {
      return toast.error("Wallet not connected");
    }

    if (!name || !symbol) {
      return toast.error("Name, Symbol, description and image required");
    }

    if (!memeFactorycontract) {
      return toast.error("Contract not loaded");
    }

    if (selectedFile) {
      const storageRef = _storageRef;
      const fileRef = storageRef.child(`uploads/${selectedFile.name}`);

      const uploadTask = fileRef.put(selectedFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        },
        (error) => {
          console.error("Error uploading file:", error);
        },
        async () => {
          // Upload complete
          const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
          setImage(downloadURL);
          console.log("File available at:", downloadURL);
          const { waitForResult, contractId } =
            await BondingCurveFactory.deploy(wallet, {
              storageSlots: BondingCurve.storageSlots,
            });
          await waitForResult();
          const newBondingCurve = new BondingCurve(contractId, wallet);
          setNewCurve(newBondingCurve);
          try {
            await memeFactorycontract.functions
              .set_bytecode_root({ bits: contractId })
              .call();
            toast.success("bytecoderoot set");
          } catch (error) {}
        }
      );
    }
  };

  const onFinishLaunchPress = async () => {
    if (!wallet) {
      return toast.error("Wallet not connected");
    }

    if (!newCurve || !memeFactorycontract) {
      return toast.error("Contract not loaded");
    }
    if (!name || !symbol || !description || !image) {
      return toast.error("Name, Symbol, description, imagerequired");
    }
    try {
      const assetId = createAssetId(newCurve.id.toHexString(), B256_ZERO).bits;
      await memeFactorycontract.functions
        .register_contract(
          { bits: newCurve.id.toB256() },
          name,
          symbol,
          description,
          image,
          twitter || "",
          telegram || "",
          website || ""
        )
        .addContracts([newCurve])
        .call();
      setAssetId(assetId);
    } catch (error) {
      console.log(error);
      // @ts-ignore
      const message: string = error.message;
      if (message.includes('"RegisteredToken"')) {
        toast.error("Token Already Registered");
        setAssetId(assetId);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 items-stretch max-w-[400px] mx-auto">
      <h3 className="text-2xl font-semibold mb-2">Launch A Coin</h3>

      <div className="flex flex-col justify-center">
        <label htmlFor="token-name" className="text-gray-400">
          Name:
        </label>
        <Input
          className="w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ETHEREUM"
          id="token-name"
          readOnly={!!newCurve}
        />
      </div>

      <div className="flex flex-col justify-center">
        <label htmlFor="token-symbol" className="text-gray-400">
          Symbol:
        </label>
        <Input
          className="w-full"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="ETH"
          id="token-symbol"
          readOnly={!!newCurve}
        />
      </div>

      <div className="flex flex-col justify-center">
        <label htmlFor="token-description" className="text-gray-400">
          Description:
        </label>
        <Textarea
          className="w-full"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          id="token-description"
          readOnly={!!newCurve}
        ></Textarea>
      </div>

      <div className="flex flex-col justify-center">
        <label htmlFor="token-image" className="text-gray-400">
          Image:
        </label>
        <Input
          className="w-full"
          onChange={handleFileChange}
          placeholder="ETH"
          id="token-image"
          readOnly={!!newCurve}
          type="file"
          accept="image/*"
        />
      </div>

      <button
        onClick={() => {
          setMoreOptions(!moreOptions);
        }}
        className="text-base text-fuel-green self-start hover:underline transition-all"
      >
        {moreOptions ? "Less Options ↑" : "More options ↓"}
      </button>

      {moreOptions ? (
        <>
          <div className="flex flex-col justify-center">
            <label htmlFor="twitter-socials" className="text-gray-400">
              Twitter:
            </label>
            <Input
              className="w-full"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="optional"
              id="twitter-socials"
              readOnly={!!newCurve}
            />
          </div>
          <div className="flex flex-col justify-center">
            <label htmlFor="telegram-socials" className="text-gray-400">
              Telegram:
            </label>
            <Input
              className="w-full"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              placeholder="optional"
              id="telegram-socials"
              readOnly={!!newCurve}
            />
          </div>
          <div className="flex flex-col justify-center">
            <label htmlFor="website-socials" className="text-gray-400">
              Webiste:
            </label>
            <Input
              className="w-full"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="optional"
              id="website-socials"
              readOnly={!!newCurve}
            />
          </div>
        </>
      ) : null}

      <Button onClick={onLaunchPress} className="mt-4">
        &gt;&gt; Launch &lt;&lt;
      </Button>

      {!!newCurve && (
        <>
          <div className="flex flex-col gap-2 items-center">
            <div>Asset deployed at</div>
            <div>
              {createAssetId(newCurve.id.toHexString(), B256_ZERO).bits}
            </div>
          </div>
          <Button onClick={onFinishLaunchPress} className="mt-6">
            &gt;&gt; Finalize Launch &lt;&lt;
          </Button>
        </>
      )}
      {!!assetId && (
        <>
          <Link href={`/${assetId}`}>View Asset</Link>
        </>
      )}
    </div>
  );
}
