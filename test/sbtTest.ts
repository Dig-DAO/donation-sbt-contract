import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('SBT Test', function () {
    async function deploySBTFixture() {
        const Contract = await ethers.getContractFactory('SBT');
        const [owner, address1, address2] = await ethers.getSigners();
        const contract = await Contract.deploy(
            'Donation SBT',
            'DSBT',
            'ipfs://example.com/token/',
            ethers.parseEther('0.1')
        );

        await contract.connect(owner).mint({
            value: ethers.parseEther('0.1'),
        });

        return { contract, owner, address1, address2 };
    }

    describe('mint function', () => {
        it('should mint a token to the owner', async () => {
            const { contract, owner } = await loadFixture(deploySBTFixture);
            expect(await contract.ownerOf(1)).to.equal(owner.address);
        });

        it('should not mint another token to the owner', async () => {
            const { contract, owner } = await loadFixture(deploySBTFixture);
            await expect(
                contract.connect(owner).mint({
                    value: ethers.parseEther('0.1'),
                })
            ).to.be.rejectedWith('Only one token is allowed');
        });

        it('should not mint a token without enough payment', async () => {
            const { contract, address1 } = await loadFixture(deploySBTFixture);
            await expect(
                contract.connect(address1).mint({
                    value: ethers.parseEther('0.01'),
                })
            ).to.be.revertedWith('Insufficient payment for minting');
        });

        it('should be able to mint a token with more than enough payment', async () => {
            const { contract, address1 } = await loadFixture(deploySBTFixture);
            await contract.connect(address1).mint({
                value: ethers.parseEther('0.2'),
            });
            expect(await contract.ownerOf(2)).to.equal(address1.address);
        });
    });

    describe('mintByOwner function', () => {
        it('should mint a token to an address', async () => {
            const { contract, owner, address1 } = await loadFixture(
                deploySBTFixture
            );
            await contract.connect(owner).mintByOwner(address1.address);
            expect(await contract.ownerOf(2)).to.equal(address1.address);
        });

        it("should not mint a token to an address if it's not by the owner", async () => {
            const { contract, owner, address1 } = await loadFixture(
                deploySBTFixture
            );
            await expect(
                contract.connect(address1).mintByOwner(address1.address)
            ).to.be.revertedWith('Ownable: caller is not the owner');
        });
    });

    describe('burn function', () => {
        it("should burn a token if it's the contract owner", async () => {
            const { contract, owner, address1 } = await loadFixture(
                deploySBTFixture
            );
            await contract.mintByOwner(address1.address);
            await expect(contract.burn(2)).to.emit(contract, 'Transfer');
            expect(await contract.balanceOf(address1.address)).to.equal(0);
        });

        it("should burn a token if it's the token owner", async () => {
            const { contract, address1 } = await loadFixture(deploySBTFixture);
            await contract.mintByOwner(address1.address);
            await expect(contract.connect(address1).burn(2)).to.emit(
                contract,
                'Transfer'
            );
            expect(await contract.balanceOf(address1.address)).to.equal(0);
        });

        it("should not burn a token that you don't own if it's not by the owner", async () => {
            const { contract, address1 } = await loadFixture(deploySBTFixture);
            await contract.mintByOwner(address1.address);
            await expect(contract.connect(address1).burn(1)).to.be.revertedWith(
                'Only contract owner or token owner can burn the token'
            );
        });
    });

    describe('setBaseUri function', () => {
        const anotherBaseUri = 'https://example.com/metadata/';

        it("should set a base URI if it's the contract owner", async () => {
            const { contract } = await loadFixture(deploySBTFixture);
            await contract.setBaseURI(anotherBaseUri);
            expect(await contract.tokenURI(1)).to.equal(
                'https://example.com/metadata/1.json'
            );
        });

        it("should not set a base URI if it's not the contract owner", async () => {
            const { contract, address1 } = await loadFixture(deploySBTFixture);
            await expect(
                contract.connect(address1).setBaseURI(anotherBaseUri)
            ).to.be.revertedWith('Ownable: caller is not the owner');
        });
    });

    describe('setMintPrice function', () => {
        const newMintPrice = ethers.parseEther('0.2');

        it("should set a new mint price if it's the contract owner", async () => {
            const { contract } = await loadFixture(deploySBTFixture);
            await contract.setMintPrice(newMintPrice);
            expect(await contract.mintPrice()).to.equal(newMintPrice);
        });

        it("should not set a new mint price if it's not the contract owner", async () => {
            const { contract, address1 } = await loadFixture(deploySBTFixture);
            await expect(
                contract.connect(address1).setMintPrice(newMintPrice)
            ).to.be.revertedWith('Ownable: caller is not the owner');
        });
    });
});
