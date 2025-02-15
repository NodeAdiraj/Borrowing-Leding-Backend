const { ethers, getNamedAccounts } = require("hardhat")
const AMOUNT = ethers.utils.parseEther("0.02")
async function getWeth() {
    const { deployer } = await getNamedAccounts()
    const weth = await ethers.getContractAt(
        "IWeth",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        deployer
    )
    const tx = await weth.deposit({ value: AMOUNT })
    await tx.wait(1)
    const balance = await weth.balanceOf(deployer)
    console.log(`The Balance is ${balance.toString()}`)
}
module.exports = { getWeth, AMOUNT }
