import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'dotenv/config';

const privateKey = process.env.PRIVATE_KEY!;

const config: HardhatUserConfig = {
    solidity: {
        version: '0.8.19',
        settings: {
            optimizer: {
                enabled: true,
                runs: 300,
            },
        },
    },
    networks: {
        optimisticEthereum: {
            url: 'https://optimism.publicnode.com',
            accounts: [privateKey],
        },
        optimisticGoerli: {
            url: 'https://optimism-goerli.publicnode.com',
            accounts: [privateKey],
        },
    },
    etherscan: {
        apiKey: {
            optimisticEthereum: process.env.OPTIMISM_EXPLORER_API_KEY!,
            optimisticGoerli: process.env.OPTIMISM_EXPLORER_API_KEY!,
        },
    },
};

export default config;
