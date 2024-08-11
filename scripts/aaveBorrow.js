const { getNamedAccounts, ethers } = require("hardhat")
const { getWeth, AMOUNT } = require("../scripts/getWeth")

async function main() {
    await getWeth()
    const { deployer } = await getNamedAccounts()
    const lendingPool = await getLendingPool(deployer)
    const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"

    try {
        await approveErc20(wethTokenAddress, lendingPool.address, AMOUNT, deployer)
        console.log("ERC20 approval successful")

        const depositTx = await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0)
        await depositTx.wait(1)
        console.log("Deposited successfully")

        const { totalDebtETH, availableBorrowsETH } = await getBorrowUserData(lendingPool, deployer)
        const price = await convert()
        const amountDaiToBorrow = availableBorrowsETH.toString() * 0.95 * (1 / price.toNumber())
        const amountDaiToBorrowWei = ethers.utils.parseEther(amountDaiToBorrow.toString())

        const diaAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
        await borrowDai(diaAddress, lendingPool, amountDaiToBorrowWei, deployer)
        console.log("Borrowed DAI successfully")

        await getBorrowUserData(lendingPool, deployer)
    } catch (error) {
        console.error("Transaction failed:", error)
    }
}

async function getLendingPool(account) {
    const lendingPoolAddressProvider = await ethers.getContractAt(
        "@aave/protocol-v2/contracts/interfaces/ILendingPoolAddressesProvider.sol:ILendingPoolAddressesProvider",
        "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        account
    )

    const lendingPoolAddress = await lendingPoolAddressProvider.getLendingPool()
    const lendingPool = await ethers.getContractAt("ILendingPool", lendingPoolAddress, account)
    return lendingPool
}

async function approveErc20(contractAddress, spenderAddress, amountToSpend, account) {
    const erc20Token = await ethers.getContractAt("IERC20", contractAddress, account)
    try {
        const tx = await erc20Token.approve(spenderAddress, amountToSpend)
        await tx.wait(1)
        console.log("ERC20 approval successful")
    } catch (error) {
        console.error("ERC20 approval failed:", error)
    }
}

async function getBorrowUserData(lendingPool, account) {
    try {
        const {
            totalCollateralETH,
            totalDebtETH,
            availableBorrowsETH
        } = await lendingPool.getUserAccountData(account)
        console.log("Total Collateral ETH:", ethers.utils.formatEther(totalCollateralETH))
        console.log("Total Debt ETH:", ethers.utils.formatEther(totalDebtETH))
        console.log("Available Borrows ETH:", ethers.utils.formatEther(availableBorrowsETH))
        return { totalDebtETH, availableBorrowsETH }
    } catch (error) {
        console.error("Failed to get user data:", error)
    }
}

async function convert() {
    const conversion = await ethers.getContractAt(
        "AggregatorV3Interface",
        "0x773616E4d11A78F511299002da57A0a94577F1f4"
    )
    try {
        const [, price] = await conversion.latestRoundData()
        console.log("ETH/USD Price:", ethers.utils.formatUnits(price, 8))
        return price
    } catch (error) {
        console.error("Price conversion failed:", error)
    }
}

async function borrowDai(daiAddress, lendingPool, amountDaiToBorrow, account) {
    const borrowTx = await lendingPool.borrow(daiAddress, amountDaiToBorrow, 1, 0, account)
    await borrowTx.wait(1)
    console.log("You've borrowed!")
}
async function repay(amount, daiAddress, lendingPool, account) {
    await approveErc20(daiAddress, lendingPool.address, amount, account)
    const repayTx = await lendingPool.repay(daiAddress, amount, BORROW_MODE, account)
    await repayTx.wait(1)
    console.log("Repaid!")
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error("Failed:", error)
        process.exit(1)
    })
