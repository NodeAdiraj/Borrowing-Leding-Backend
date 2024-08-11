require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("dotenv").config()
require("solidity-coverage")
require("hardhat-deploy")
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            forking: {
                url: MAINNET_RPC_URL
            }
        },
        localhost: {
            chainId: 31337
        }
    },
    solidity: {
        compilers: [
            {
                version: "0.8.8"
            },
            {
                version: "0.6.12"
            },
            {
                version: "0.4.19"
            }
        ]
    },

    namedAccounts: {
        deployer: {
            default: 0
        }
    }
}
