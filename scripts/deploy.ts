import { ethers } from 'ethers';
import artifact from '../artifacts/contracts/sbt.sol/SBT.json';
import 'dotenv/config';
import { Command } from 'commander';
import hre from 'hardhat';
import { HttpNetworkConfig } from 'hardhat/types';

async function deploy(
    name: string,
    symbol: string,
    baseURI: string,
    mintPrice: string,
    network: string
) {
    let networkConfig = network ? hre.config.networks[network] : undefined;
    if (networkConfig) {
        console.log(`Deploying a contract on ${network}`);
    } else {
        networkConfig = hre.config.networks[hre.config.defaultNetwork];
        console.log(
            `Deploying a contract on the default network, ${hre.config.defaultNetwork}`
        );
    }

    const httpNetworkConfig = networkConfig as HttpNetworkConfig;
    const provider = new ethers.JsonRpcProvider(httpNetworkConfig.url);
    const account = (httpNetworkConfig.accounts as string[])[0];
    const signer = new ethers.Wallet(account, provider);
    const factory = new ethers.ContractFactory(
        artifact.abi,
        artifact.bytecode,
        signer
    );

    const contract = await factory.deploy(
        name,
        symbol,
        baseURI,
        ethers.parseEther(mintPrice)
    );
    await contract.waitForDeployment();
    console.log('Contract deployment completed');
}

const program = new Command();
program
    .option('-n --name <string>', 'name of token')
    .option('-s --symbol <string>', 'symbol of token')
    .option('-u --baseUri <string>', "Token's base URI")
    .option('-p --mintPrice <string>', 'Mint price (in ETH)')
    .option('-nw --network <string>', 'Network')
    .parse(process.argv);
const options = program.opts();

deploy(
    options.name,
    options.symbol,
    options.baseUri,
    options.mintPrice,
    options.network
).catch((err) => {
    console.error(err.reason, err.body);
    process.exitCode = 1;
});
