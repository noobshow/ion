// Copyright (c) 2016-2018 Clearmatics Technologies Ltd
// SPDX-License-Identifier: LGPL-3.0+

const Web3Utils = require('web3-utils');
const utils = require('./helpers/utils.js');
const BN = require('bignumber.js')
const encoder = require('./helpers/encoder.js')
const rlp = require('rlp');
const async = require('async')
const sha3 = require('js-sha3').keccak_256

// Connect to the Test RPC running
const Web3 = require('web3');
const web3 = new Web3();
const rinkeby = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
rinkeby.setProvider(new web3.providers.HttpProvider('https://rinkeby.infura.io/v3/430e7d9d2b104879aee73ced56f0b8ba'));

const Ion = artifacts.require("Ion");
const Clique = artifacts.require("Clique");
const EthereumStore = artifacts.require("EthereumStore");

const TriggerEventVerifier = artifacts.require("TriggerEventVerifier");
const FunctionEvent = artifacts.require("Function");

require('chai')
 .use(require('chai-as-promised'))
 .should();

const DEPLOYEDCHAINID = "0xab830ae0774cb20180c8b463202659184033a9f30a21550b89a2b406c3ac8075"
const TESTCHAINID = "0x22b55e8a4f7c03e1689da845dd463b09299cb3a574e64c68eafc4e99077a7254"

/*
TESTRPC TEST DATA
*/

const TESTBLOCK = {
    difficulty: 2,
    extraData: '0xd68301080d846765746886676f312e3130856c696e7578000000000000000000583a78dd245604e57368cb2688e42816ebc86eff73ee219dd96b8a56ea6392f75507e703203bc2cc624ce6820987cf9e8324dd1f9f67575502fe6060d723d0e100',
    gasLimit: 7509409,
    gasUsed: 2883490,
    hash: '0x694752333dd1bd0f806cc6ef1063162f4f330c88f9dcd9e61174fcf5e4927eb7',
    logsBloom: '0x22440000020000090000000000000000041000080000008000088000080000000200000400000800000000000000400000000000000000000010000008020102000000000000080000000008800000000000022000000004000000010000000000080000000620400440100010200400082000000000000080040010000100020020000000000000080080000001000000000100000400480000000002000000002000080018000008108000100000000000000000020000050010001004000000000102000040004000000000000000000000004400000000000000000000000208000000000400008200020000004022400000000004000200848000000000',
    miner: '0x0000000000000000000000000000000000000000',
    mixHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    nonce: '0x0000000000000000',
    number: 2657422,
    parentHash: '0x3471555ab9a99528f02f9cdd8f0017fe2f56e01116acc4fe7f78aee900442f35',
    receiptsRoot: '0x907121bec78b40e8256fac47867d955c560b321e93fc9f046f919ffb5e3823ff',
    sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
    size: 4848,
    stateRoot: '0xf526f481ffb6c3c56956d596f2b23e1f7ff17c810ba59efb579d9334a1765444',
    timestamp: 1531931421,
    totalDifficulty: 5023706,
    transactions:
     [ '0x7adbc5ee3712552a1e85962c3ea3d82394cfed7960d60c12d60ebafe67445450',
       '0x6be870e6dfb11894b64371560ec39e563cef91642afd193bfa67874f3508a282',
       '0x5ba6422455cb7127958df15c453bfe60d92921b647879864b531fd6589e36af4',
       '0xa2597e6fe6882626e12055b1378025aa64a85a03dd23f5dc66034f2ef3746810',
       '0x7ffb940740050ae3604f99a4eef07c83de5d75076cae42cb1561c370cba3a0a3',
       '0x4d6326a6d4cf606c7e44a4ae6710acd3876363bcaabd1b1b59d29fff4da223c5',
       '0x10b3360ef00cd7c4faf826365fddbd33938292c98c55a4cdb37194a142626f63',
       '0x655290cb44be2e64d3b1825a86d5647579015c5cffb03ede7f67eb34cea6b97f',
       '0x6b5e025ea558f4872112a39539ce9a819bfbb795b04eefcc45e1cf5ea947614c',
       '0xefd68b516babcf8a4ca74a358cfca925d9d2d5177ef7b859f3d9183ff522efe8',
       '0xa056eeeeb098fd5adb283e12e77a239797c96860c21712963f183937613d3391',
       '0xa5d1adf694e3442975a13685a9c7d9013c05a4fdcea5bc827566a331b2fead2b',
       '0x95a47360f89c48f0b1a484cbeee8816b6a0e2fc321bdb9db48082bd7272b4ebc',
       '0x896d29a87393c6607844fa545d38eb96056d5310a6b4e056dc00adde67c24be2',
       '0xef3ce2ad9259920094f7fd5ad00453b35888662696ae9b85a393e55cde3ec28d',
       '0x2de8af9b4e84b3ac93adfce81964cc69bafd0a2dbcac3a5f7628ee9e56fd1c8a',
       '0x2790cdb3377f556e8f5bc8eaaf9c6c0d36d0f242c2e4226af2aac0203f43019b',
       '0x98ae65246249785bd1ac8157900f7e1a2c69d5c3b3ffc97d55b9eacab3e212f0',
       '0x7d4f090c58880761eaaab1399864d4a52631db8f0b21bfb7051f9a214ad07993',
       '0xafc3ab60059ed38e71c7f6bea036822abe16b2c02fcf770a4f4b5fffcbfe6e7e',
       '0x2af8f6c49d1123077f1efd13764cb2a50ff922fbaf49327efc44c6048c38c968',
       '0x6d5e1753dc91dae7d528ab9b02350e726e006a5591a5d315a34a46e2a951b3fb',
       '0xdc864827159c7fde6bbd1672ed9a90ce5d69f5d0c81761bf689775d19a90387e',
       '0x22fb4d90a7125988b2857c50709e544483f898cb1e8036477f9ddd94b177bf93',
       '0x999c2e2ba342bed4ccedea01d638db3bbd1abd6d10784c317843880841db6dec',
       '0x11355abb5fe745ed458b2a78e116f4a8c2fe046a131eafe08f30d23bd9d10394' ],
    transactionsRoot: '0x07f36c7ad26564fa65daebda75a23dfa95d660199092510743f6c8527dd72586',
    uncles: []
}

const VALIDATORS_B2657422 = [
    "0x42eb768f2244c8811c63729a21a3569731535f06",
    "0x6635f83421bf059cd8111f180f0727128685bae4",
    "0x7ffc57839b00206d1ad20c69a1981b489f772031",
    "0xb279182d99e65703f0076e4812653aab85fca0f0",
    "0xd6ae8250b8348c94847280928c79fb3b63ca453e",
    "0xda35dee8eddeaa556e4c26268463e26fb91ff74f",
    "0xfc18cbc391de84dbd87db83b20935d3e89f5dd91"]

const signedHeader = [
    TESTBLOCK.parentHash,
    TESTBLOCK.sha3Uncles,
    TESTBLOCK.miner,
    TESTBLOCK.stateRoot,
    TESTBLOCK.transactionsRoot,
    TESTBLOCK.receiptsRoot,
    TESTBLOCK.logsBloom,
    Web3Utils.toBN(TESTBLOCK.difficulty),
    Web3Utils.toBN(TESTBLOCK.number),
    TESTBLOCK.gasLimit,
    TESTBLOCK.gasUsed,
    Web3Utils.toBN(TESTBLOCK.timestamp),
    TESTBLOCK.extraData,
    TESTBLOCK.mixHash,
    TESTBLOCK.nonce
    ];

// Remove last 65 Bytes of extraData
const extraBytes = utils.hexToBytes(TESTBLOCK.extraData);
const extraBytesShort = extraBytes.splice(1, extraBytes.length-66);
const extraDataSignature = '0x' + utils.bytesToHex(extraBytes.splice(extraBytes.length-65));
const extraDataShort = '0x' + utils.bytesToHex(extraBytesShort);

const unsignedHeader = [
    TESTBLOCK.parentHash,
    TESTBLOCK.sha3Uncles,
    TESTBLOCK.miner,
    TESTBLOCK.stateRoot,
    TESTBLOCK.transactionsRoot,
    TESTBLOCK.receiptsRoot,
    TESTBLOCK.logsBloom,
    Web3Utils.toBN(TESTBLOCK.difficulty),
    Web3Utils.toBN(TESTBLOCK.number),
    TESTBLOCK.gasLimit,
    TESTBLOCK.gasUsed,
    Web3Utils.toBN(TESTBLOCK.timestamp),
    extraDataShort, // extraData minus the signature
    TESTBLOCK.mixHash,
    TESTBLOCK.nonce
    ];

const TEST_SIGNED_HEADER = '0x' + rlp.encode(signedHeader).toString('hex');
const signedHeaderHash = Web3Utils.sha3(TEST_SIGNED_HEADER);

const TEST_UNSIGNED_HEADER = '0x' + rlp.encode(unsignedHeader).toString('hex');
const unsignedHeaderHash = Web3Utils.sha3(TEST_UNSIGNED_HEADER);

const TESTRLPENCODING = "0xf9025ca03471555ab9a99528f02f9cdd8f0017fe2f56e01116acc4fe7f78aee900442f35a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347940000000000000000000000000000000000000000a0f526f481ffb6c3c56956d596f2b23e1f7ff17c810ba59efb579d9334a1765444a007f36c7ad26564fa65daebda75a23dfa95d660199092510743f6c8527dd72586a0907121bec78b40e8256fac47867d955c560b321e93fc9f046f919ffb5e3823ffb90100224400000200000900000000000000000410000800000080000880000800000002000004000008000000000000004000000000000000000000100000080201020000000000000800000000088000000000000220000000040000000100000000000800000006204004401000102004000820000000000000800400100001000200200000000000000800800000010000000001000004004800000000020000000020000800180000081080001000000000000000000200000500100010040000000001020000400040000000000000000000000044000000000000000000000002080000000004000082000200000040224000000000040002008480000000000283288c8e837295a1832bffa2845b4f6b1db861d68301080d846765746886676f312e3130856c696e7578000000000000000000583a78dd245604e57368cb2688e42816ebc86eff73ee219dd96b8a56ea6392f75507e703203bc2cc624ce6820987cf9e8324dd1f9f67575502fe6060d723d0e100a00000000000000000000000000000000000000000000000000000000000000000880000000000000000"
const TEST_PATH = "0x13"

const TEST_TX_VALUE = "0xf86707843b9aca008257c39461621bcf02914668f8404c1f860e92fc1893f74c8084457094cc1ba07e2ebe15f4ece2fd8ffc9a49d7e9e4e71a30534023ca6b24ab4000567709ad53a013a61e910eb7145aa93e865664c54846f26e09a74bd577eaf66b5dd00d334288"
const TEST_TX_NODES = "0xf90235f871a0804f9c841a6a1d3361d79980581c84e5b4d3e4c9bf33951346775542d0ee0728a0edadb5e660118ea4323654191131b62c81fc00203a15a21c925f9f50d0e4b3e4808080808080a03eda2d64b94c5ed45026a29c75c99677d44c561ea5efea30c1db6299871d5c2e8080808080808080f90151a0bc285699e68d2fe18e7af2cdf7e7e6456e91a3fd31e3c9935bc5bef92e94bf4ba06eb963b2c3a3b6c07a7221aa6f6f86f7cb8ddb45ab1ff1a9dc781f34da1f081fa0deea5b5566e7a5634d91c5fb56e25f4370e3531e2fd71ee17ed6c4ad0be2ced3a0b4e9d14555f162e811cfbcbff9b98a271a197b75271565f693912c2ff75e2131a03b0bc2d764fbefd76848ee2da7b211eb230ede08d8c54e6a868be9f5e42122c1a0b6dd488ad4fb82b0a98dff81ac6766d1dec26b29dc06174de1d315b0ab0bdf0ca066c20ff06dc33777f53eec32b0b9a8d99872bec24bb3998bb520ae6897c21d7ea02db2a399f611ba7993efb4768938a6f61b4add8959ce4c89f201f41e882ff375a02e31051a9f938b9b342b8070db3dd829f62da8d0c83a6dff91a4e3b4cb2adb9ea090e75708e7dbf856b75ed126a960085419fcde0e6a0129a92dffc0cb83ac089680808080808080f86c20b869f86707843b9aca008257c39461621bcf02914668f8404c1f860e92fc1893f74c8084457094cc1ba07e2ebe15f4ece2fd8ffc9a49d7e9e4e71a30534023ca6b24ab4000567709ad53a013a61e910eb7145aa93e865664c54846f26e09a74bd577eaf66b5dd00d334288"

const TEST_RECEIPT_VALUE = "0xf901640183252867b9010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000010000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000f85af8589461621bcf02914668f8404c1f860e92fc1893f74ce1a027a9902e06885f7c187501d61990eae923b37634a8d6dda55a04dc7078395340a0000000000000000000000000279884e133f9346f2fad9cc158222068221b613e"
const TEST_RECEIPT_NODES = "0xf90335f871a012d378fe6800bc18f22e715a31971ef7e73ac5d1d85384f4b66ac32036ae43dea004d6e2678656a957ac776dbef512a04d266c1af3e2c5587fd233261a3d423213808080808080a05fac317a4d6d78181319fbc7e2cae4a9260f1a6afb5c6fea066e2308eed416818080808080808080f90151a03da235c6dd0fbdaf208c60cbdca0d609dee2ba107495aa7adaa658362616c8aaa09ebf378a9064aa4da0512c55c790a5e007ac79d2713e4533771cd2c95be47a4da0c06fed36ffe1f2ec164ba88f73b353960448d2decbb65355c5298a33555de742a0e057afe423ee17e5499c570a56880b0f5b5c1884b90ff9b9b5baa827f72fc816a093e06093cd2fdb67e0f87cfcc35ded2f445cc1309a0ff178e59f932aeadb6d73a0193e4e939fbc5d34a570bea3fff7c6d54adcb1c3ab7ef07510e7bd5fcef2d4b3a0a17a0c71c0118092367220f65b67f2ba2eb9068ff5270baeabe8184a01a37f14a03479a38e63123d497588ad5c31d781276ec8c11352dd3895c8add34f9a2b786ba042254728bb9ab94b58adeb75d2238da6f30382969c00c65e55d4cc4aa474c0a6a03c088484aa1c73b8fb291354f80e9557ab75a01c65d046c2471d19bd7f2543d880808080808080f9016b20b90167f901640183252867b9010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000010000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000f85af8589461621bcf02914668f8404c1f860e92fc1893f74ce1a027a9902e06885f7c187501d61990eae923b37634a8d6dda55a04dc7078395340a0000000000000000000000000279884e133f9346f2fad9cc158222068221b613e"

const TRIG_DEPLOYED_RINKEBY_ADDR = "0x61621bcf02914668f8404c1f860e92fc1893f74c";
const TRIG_FIRED_RINKEBY_TXHASH = "0xafc3ab60059ed38e71c7f6bea036822abe16b2c02fcf770a4f4b5fffcbfe6e7e"
const TRIG_FIRED_RINKEBY_BLOCKNO = 2657422
const TRIG_CALLED_BY = "0x279884e133f9346f2fad9cc158222068221b613e";

const TRIG_GENESIS_HASH = TESTBLOCK.parentHash;


contract('Clique-Ethereum Integration', async (accounts) => {
    let genesisBlock;
    let VALIDATORS;
    let GENESIS_HASH;

    let ion;
    let clique;
    let storage;

    before("Get genesis and validator from rinkeby once", async () => {
        genesisBlock = await rinkeby.eth.getBlock(0)
        VALIDATORS = encoder.extractValidators(genesisBlock.extraData);
        GENESIS_HASH = genesisBlock.hash;
    })

    beforeEach('setup contract for each test', async function () {
        ion = await Ion.new(DEPLOYEDCHAINID);
        clique = await Clique.new(ion.address);
        storage = await EthereumStore.new(ion.address);
    
    })

    describe('Register Clique Module', () => {
        it('Successful Register', async () => {
            await clique.register();
        })

        it('Fail Register Twice', async () => {
            await clique.register();
            await clique.register().should.be.rejected;
        })
    })

    describe('Register Chain', () => {
        it('Successful Register Chain', async () => {
            await clique.register();

            let tx = await clique.RegisterChain(TESTCHAINID, VALIDATORS, GENESIS_HASH, storage.address);
            console.log("\tGas used to register chain = " + tx.receipt.gasUsed.toString() + " gas");
            let chain = await clique.chains(TESTCHAINID);

            assert(chain);
        })

        it('Fail Register Twice', async () => {
            await clique.register();

            let tx = await clique.RegisterChain(TESTCHAINID, VALIDATORS, GENESIS_HASH, storage.address);
            console.log("\tGas used to register chain = " + tx.receipt.gasUsed.toString() + " gas");
            let chain = await clique.chains(TESTCHAINID);

            assert(chain);

            await clique.RegisterChain(TESTCHAINID, VALIDATORS, GENESIS_HASH, storage.address).should.be.rejected;
        })

        it('Fail Register Deployment Chain', async () => {
            await clique.register();
            let tx = await clique.RegisterChain(storage.address, DEPLOYEDCHAINID, VALIDATORS, GENESIS_HASH).should.be.rejected;
        })

        it('Fail Register Chain without registering clique module', async () => {
            let tx = await clique.RegisterChain(TESTCHAINID, VALIDATORS, GENESIS_HASH, storage.address).should.be.rejected;
        })
    })

    describe('Add Block', () => {
        it('Successful Add Block', async () => {
            await clique.register();
            await clique.RegisterChain(TESTCHAINID, VALIDATORS, GENESIS_HASH, storage.address);

            // Fetch block 1 from rinkeby
            const block = await rinkeby.eth.getBlock(1);

            const rlpHeaders = encoder.encodeBlockHeader(block);
            const signedHeaderHash = Web3Utils.sha3(rlpHeaders.signed);
            assert.equal(block.hash, signedHeaderHash);

            let tx = await clique.SubmitBlock(TESTCHAINID, rlpHeaders.unsigned, rlpHeaders.signed, storage.address);
            let event = tx.receipt.rawLogs.some(l => { return l.topics[0] == '0x' + sha3("BlockAdded(bytes32,bytes32)") });
            assert.ok(event, "BlockAdded event not emitted");

            let submittedEvent = tx.logs.find(l => { return l.event == 'BlockSubmitted' });
            let blockHash = submittedEvent.args.blockHash;

            assert.equal(signedHeaderHash, blockHash);
        })

        it('Successful Add Block from different genesis', async () => {
            await clique.register();
            await clique.RegisterChain(TESTCHAINID, VALIDATORS_B2657422, TRIG_GENESIS_HASH, storage.address);

            // Fetch block 2657422 from rinkeby
            const block = await rinkeby.eth.getBlock(TESTBLOCK.number);

            const rlpHeaders = encoder.encodeBlockHeader(block);
            const signedHeaderHash = Web3Utils.sha3(rlpHeaders.signed);
            assert.equal(block.hash, signedHeaderHash);

            let tx = await clique.SubmitBlock(TESTCHAINID, rlpHeaders.unsigned, rlpHeaders.signed, storage.address);
            let event = tx.receipt.rawLogs.some(l => { return l.topics[0] == '0x' + sha3("BlockAdded(bytes32,bytes32)") });
            assert.ok(event, "BlockAdded event not emitted");

            let submittedEvent = tx.logs.find(l => { return l.event == 'BlockSubmitted' });
            let blockHash = submittedEvent.args.blockHash;

            assert.equal(signedHeaderHash, blockHash);
        })

        it('Fail Add Block with unregistered chain id', async () => {
            await clique.register();
//            await clique.RegisterChain(TESTCHAINID, VALIDATORS, GENESIS_HASH, storage.address);

            // Fetch block 1 from rinkeby
            const block = await rinkeby.eth.getBlock(1);

            const rlpHeaders = encoder.encodeBlockHeader(block);
            const signedHeaderHash = Web3Utils.sha3(rlpHeaders.signed);
            assert.equal(block.hash, signedHeaderHash);

            await clique.SubmitBlock(TESTCHAINID, rlpHeaders.unsigned, rlpHeaders.signed, storage.address).should.be.rejected;
        })

        it('Fail Add Block with non-sequential block', async () => {
            await clique.register();
            await clique.RegisterChain(TESTCHAINID, VALIDATORS, GENESIS_HASH, storage.address);

            // Fetch block 2 from rinkeby instead of block 1
            const block = await rinkeby.eth.getBlock(2);

            const rlpHeaders = encoder.encodeBlockHeader(block);
            const signedHeaderHash = Web3Utils.sha3(rlpHeaders.signed);
            assert.equal(block.hash, signedHeaderHash);

            await clique.SubmitBlock(TESTCHAINID, rlpHeaders.unsigned, rlpHeaders.signed, storage.address).should.be.rejected;
        })

        it('Fail Add Block from non-clique', async () => {
            // Fetch block 1 from rinkeby
            const block = await rinkeby.eth.getBlock(1);

            const rlpHeaders = encoder.encodeBlockHeader(block);
            const signedHeaderHash = Web3Utils.sha3(rlpHeaders.signed);
            assert.equal(block.hash, signedHeaderHash);

            // Fail direct adding of block to storage
            await storage.addBlock(TESTCHAINID, block.hash, rlpHeaders.unsigned).should.be.rejected;
        })
    })

    describe('Proof Decoding', () => {
        it('Successful Proof Decoding', async () => {
            compressedProof = generateProof();
            CLIGeneratedProof = "0xf9074113f86707843b9aca008257c39461621bcf02914668f8404c1f860e92fc1893f74c8084457094cc1ba07e2ebe15f4ece2fd8ffc9a49d7e9e4e71a30534023ca6b24ab4000567709ad53a013a61e910eb7145aa93e865664c54846f26e09a74bd577eaf66b5dd00d334288f90235f871a0804f9c841a6a1d3361d79980581c84e5b4d3e4c9bf33951346775542d0ee0728a0edadb5e660118ea4323654191131b62c81fc00203a15a21c925f9f50d0e4b3e4808080808080a03eda2d64b94c5ed45026a29c75c99677d44c561ea5efea30c1db6299871d5c2e8080808080808080f90151a0bc285699e68d2fe18e7af2cdf7e7e6456e91a3fd31e3c9935bc5bef92e94bf4ba06eb963b2c3a3b6c07a7221aa6f6f86f7cb8ddb45ab1ff1a9dc781f34da1f081fa0deea5b5566e7a5634d91c5fb56e25f4370e3531e2fd71ee17ed6c4ad0be2ced3a0b4e9d14555f162e811cfbcbff9b98a271a197b75271565f693912c2ff75e2131a03b0bc2d764fbefd76848ee2da7b211eb230ede08d8c54e6a868be9f5e42122c1a0b6dd488ad4fb82b0a98dff81ac6766d1dec26b29dc06174de1d315b0ab0bdf0ca066c20ff06dc33777f53eec32b0b9a8d99872bec24bb3998bb520ae6897c21d7ea02db2a399f611ba7993efb4768938a6f61b4add8959ce4c89f201f41e882ff375a02e31051a9f938b9b342b8070db3dd829f62da8d0c83a6dff91a4e3b4cb2adb9ea090e75708e7dbf856b75ed126a960085419fcde0e6a0129a92dffc0cb83ac089680808080808080f86c20b869f86707843b9aca008257c39461621bcf02914668f8404c1f860e92fc1893f74c8084457094cc1ba07e2ebe15f4ece2fd8ffc9a49d7e9e4e71a30534023ca6b24ab4000567709ad53a013a61e910eb7145aa93e865664c54846f26e09a74bd577eaf66b5dd00d334288f901640183252867b9010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000010000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000f85af8589461621bcf02914668f8404c1f860e92fc1893f74ce1a027a9902e06885f7c187501d61990eae923b37634a8d6dda55a04dc7078395340a0000000000000000000000000279884e133f9346f2fad9cc158222068221b613ef90335f871a012d378fe6800bc18f22e715a31971ef7e73ac5d1d85384f4b66ac32036ae43dea004d6e2678656a957ac776dbef512a04d266c1af3e2c5587fd233261a3d423213808080808080a05fac317a4d6d78181319fbc7e2cae4a9260f1a6afb5c6fea066e2308eed416818080808080808080f90151a03da235c6dd0fbdaf208c60cbdca0d609dee2ba107495aa7adaa658362616c8aaa09ebf378a9064aa4da0512c55c790a5e007ac79d2713e4533771cd2c95be47a4da0c06fed36ffe1f2ec164ba88f73b353960448d2decbb65355c5298a33555de742a0e057afe423ee17e5499c570a56880b0f5b5c1884b90ff9b9b5baa827f72fc816a093e06093cd2fdb67e0f87cfcc35ded2f445cc1309a0ff178e59f932aeadb6d73a0193e4e939fbc5d34a570bea3fff7c6d54adcb1c3ab7ef07510e7bd5fcef2d4b3a0a17a0c71c0118092367220f65b67f2ba2eb9068ff5270baeabe8184a01a37f14a03479a38e63123d497588ad5c31d781276ec8c11352dd3895c8add34f9a2b786ba042254728bb9ab94b58adeb75d2238da6f30382969c00c65e55d4cc4aa474c0a6a03c088484aa1c73b8fb291354f80e9557ab75a01c65d046c2471d19bd7f2543d880808080808080f9016b20b90167f901640183252867b9010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000010000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000f85af8589461621bcf02914668f8404c1f860e92fc1893f74ce1a027a9902e06885f7c187501d61990eae923b37634a8d6dda55a04dc7078395340a0000000000000000000000000279884e133f9346f2fad9cc158222068221b613e"
            assert.equal("0x" + compressedProof.toString('hex'), CLIGeneratedProof);
        })
    })

    describe('Check All Proofs of Tx 0xafc3ab60059ed38e71c7f6bea036822abe16b2c02fcf770a4f4b5fffcbfe6e7e on Rinkeby', () => {
        it('Successful Check Proofs', async () => {
            await clique.register();
            await clique.RegisterChain(TESTCHAINID, VALIDATORS_B2657422, TRIG_GENESIS_HASH, storage.address);

            // Fetch block 2657422 from rinkeby
            const block = await rinkeby.eth.getBlock(TESTBLOCK.number);

            const rlpHeaders = encoder.encodeBlockHeader(block);
            const signedHeaderHash = Web3Utils.sha3(rlpHeaders.signed);
            assert.equal(block.hash, signedHeaderHash);

            let tx = await clique.SubmitBlock(TESTCHAINID, rlpHeaders.unsigned, rlpHeaders.signed, storage.address);
            let event = tx.receipt.rawLogs.some(l => { return l.topics[0] == '0x' + sha3("BlockAdded(bytes32,bytes32)") });
            assert.ok(event, "BlockAdded event not emitted");

            let submittedEvent = tx.logs.find(l => l.event == 'BlockSubmitted' );
            let blockHash = submittedEvent.args.blockHash;
            assert.equal(signedHeaderHash, blockHash);

            compressedProof = generateProof();

            tx = await storage.CheckProofs(TESTCHAINID, TESTBLOCK.hash, "0x" + compressedProof.toString('hex'));
            console.log("\tGas used to submit check proofs = " + tx.receipt.gasUsed.toString() + " gas");
        })

        it('Fail Proofs with wrong proofs value', async () => {
            await clique.register();
            await clique.RegisterChain(TESTCHAINID, VALIDATORS_B2657422, TRIG_GENESIS_HASH, storage.address);

            // Fetch block 2657422 from rinkeby
            const block = await rinkeby.eth.getBlock(TESTBLOCK.number);

            const rlpHeaders = encoder.encodeBlockHeader(block);
            const signedHeaderHash = Web3Utils.sha3(rlpHeaders.signed);
            assert.equal(block.hash, signedHeaderHash);

            let tx = await clique.SubmitBlock(TESTCHAINID, rlpHeaders.unsigned, rlpHeaders.signed, storage.address);
            let event = tx.receipt.rawLogs.some(l => { return l.topics[0] == '0x' + sha3("BlockAdded(bytes32,bytes32)") });
            assert.ok(event, "BlockAdded event not emitted");

            let submittedEvent = tx.logs.find(l => { return l.event == 'BlockSubmitted' });
            let blockHash = submittedEvent.args.blockHash;
            assert.equal(signedHeaderHash, blockHash);

            compressedProof = generateCorruptedProof();

            await storage.CheckProofs(TESTCHAINID, TESTBLOCK.hash, "0x" + compressedProof.toString('hex')).should.be.rejected;
        })

        it('Fail Proofs with malformed proof', async () => {
            await clique.register();
            await clique.RegisterChain(TESTCHAINID, VALIDATORS_B2657422, TRIG_GENESIS_HASH, storage.address);

            // Fetch block 2657422 from rinkeby
            const block = await rinkeby.eth.getBlock(TESTBLOCK.number);

            const rlpHeaders = encoder.encodeBlockHeader(block);
            const signedHeaderHash = Web3Utils.sha3(rlpHeaders.signed);
            assert.equal(block.hash, signedHeaderHash);

            let tx = await clique.SubmitBlock(TESTCHAINID, rlpHeaders.unsigned, rlpHeaders.signed, storage.address);
            let event = tx.receipt.rawLogs.some(l => { return l.topics[0] == '0x' + sha3("BlockAdded(bytes32,bytes32)") });
            assert.ok(event, "BlockAdded event not emitted");

            let submittedEvent = tx.logs.find(l => { return l.event == 'BlockSubmitted' });
            let blockHash = submittedEvent.args.blockHash;
            assert.equal(signedHeaderHash, blockHash);

            compressedProof = generateMalformedProof();

            await storage.CheckProofs(TESTCHAINID, TESTBLOCK.hash, "0x" + compressedProof.toString('hex')).should.be.rejected;
        })
    })

    describe('Event Consumption Contract', () => {
        it('Deploy Function Contract', async () => {
            const verifier = await TriggerEventVerifier.new();
            const functionContract = await FunctionEvent.new(storage.address, verifier.address);
        })

        it('Submit Block, verify tx and event, and execute', async () => {
            const verifier = await TriggerEventVerifier.new();
            const functionContract = await FunctionEvent.new(storage.address, verifier.address);

            await clique.register();
            await clique.RegisterChain(TESTCHAINID, VALIDATORS_B2657422, TRIG_GENESIS_HASH, storage.address);

            // Fetch block 2657422 from rinkeby
            const block = await rinkeby.eth.getBlock(TESTBLOCK.number);

            const rlpHeaders = encoder.encodeBlockHeader(block);
            const signedHeaderHash = Web3Utils.sha3(rlpHeaders.signed);
            assert.equal(block.hash, signedHeaderHash);

            let tx = await clique.SubmitBlock(TESTCHAINID, rlpHeaders.unsigned, rlpHeaders.signed, storage.address);
            let event = tx.receipt.rawLogs.some(l => { return l.topics[0] == '0x' + sha3("BlockAdded(bytes32,bytes32)") });
            assert.ok(event, "BlockAdded event not emitted");

            let submittedEvent = tx.logs.find(l => { return l.event == 'BlockSubmitted' });
            let blockHash = submittedEvent.args.blockHash;
            assert.equal(signedHeaderHash, blockHash);

            compressedProof = generateProof();

            tx = await functionContract.verifyAndExecute(TESTCHAINID, TESTBLOCK.hash, TRIG_DEPLOYED_RINKEBY_ADDR, "0x" + compressedProof.toString('hex'), TRIG_CALLED_BY);
            event = tx.receipt.rawLogs.some(l => { return l.topics[0] == '0x' + sha3("Executed()") });
            assert.ok(event, "Executed event not emitted");

            console.log("\tGas used to verify all proofs against ion, verify logs against the verifier and execute the function = " + tx.receipt.gasUsed.toString() + " gas");
        })

        it('Fail Function Execution', async () => {
            const verifier = await TriggerEventVerifier.new();
            const functionContract = await FunctionEvent.new(storage.address, verifier.address);

            await clique.register();
            await clique.RegisterChain(TESTCHAINID, VALIDATORS_B2657422, TRIG_GENESIS_HASH, storage.address);

            // Fetch block 2657422 from rinkeby
            const block = await rinkeby.eth.getBlock(TESTBLOCK.number);

            const rlpHeaders = encoder.encodeBlockHeader(block);
            const signedHeaderHash = Web3Utils.sha3(rlpHeaders.signed);
            assert.equal(block.hash, signedHeaderHash);

            let tx = await clique.SubmitBlock(TESTCHAINID, rlpHeaders.unsigned, rlpHeaders.signed, storage.address);
            let event = tx.receipt.rawLogs.some(l => { return l.topics[0] == '0x' + sha3("BlockAdded(bytes32,bytes32)") });
            assert.ok(event, "BlockAdded event not emitted");

            let submittedEvent = tx.logs.find(l => { return l.event == 'BlockSubmitted' });
            let blockHash = submittedEvent.args.blockHash;
            assert.equal(signedHeaderHash, blockHash);

            compressedProof = generateProof();

            // Fail with wrong chain ID
            await functionContract.verifyAndExecute(DEPLOYEDCHAINID, TESTBLOCK.hash, TRIG_DEPLOYED_RINKEBY_ADDR, "0x" + compressedProof.toString('hex'), TRIG_CALLED_BY).should.be.rejected;

            // Fail with wrong block hash
            await functionContract.verifyAndExecute(TESTCHAINID, TESTBLOCK.hash.substring(0, 30) + "ff", TRIG_DEPLOYED_RINKEBY_ADDR, "0x" + compressedProof.toString('hex'), TRIG_CALLED_BY).should.be.rejected;

            // Fail with wrong deployed contract address
            await functionContract.verifyAndExecute(TESTCHAINID, TESTBLOCK.hash, TRIG_CALLED_BY, "0x" + compressedProof.toString('hex'), TRIG_CALLED_BY).should.be.rejected;

            // Fail with malformed/corrupted proofs
            await functionContract.verifyAndExecute(TESTCHAINID, TESTBLOCK.hash, TRIG_DEPLOYED_RINKEBY_ADDR, "0x" + generateMalformedProof().toString('hex'), TRIG_CALLED_BY).should.be.rejected;
            await functionContract.verifyAndExecute(TESTCHAINID, TESTBLOCK.hash, TRIG_DEPLOYED_RINKEBY_ADDR, "0x" + generateCorruptedProof().toString('hex'), TRIG_CALLED_BY).should.be.rejected;

            // Fail with wrong expected event parameter
            await functionContract.verifyAndExecute(TESTCHAINID, TESTBLOCK.hash, TRIG_DEPLOYED_RINKEBY_ADDR, "0x" + compressedProof.toString('hex'), TRIG_DEPLOYED_RINKEBY_ADDR).should.be.rejected;
        })
    })


// The below succeeds but manual registering with the same values fail
//  const DEPLOYEDCHAINID = "0xab830ae0774cb20180c8b463202659184033a9f30a21550b89a2b406c3ac8075"
//
//  const testid = "0x6341fd3daf94b748c72ced5a5b26028f2474f5f00d824504e4fa37a75767e177";
//  const testval = ["0x42eb768f2244c8811c63729a21a3569731535f06", "0x6635f83421bf059cd8111f180f0727128685bae4", "0x7ffc57839b00206d1ad20c69a1981b489f772031", "0xb279182d99e65703f0076e4812653aab85fca0f0", "0xd6ae8250b8348c94847280928c79fb3b63ca453e", "0xda35dee8eddeaa556e4c26268463e26fb91ff74f", "0xfc18cbc391de84dbd87db83b20935d3e89f5dd91"];
//  const testgen = "0x3f09591cb976beecd52d7dbe5fb869bbfc76b9022883c0cfbd5813a6eeec973e";
//  const teststore = "0xec7601E406A998898DE9A784a634f68E038E19D2"
//
//  it('Rinkeby Register Chain', async () => {
//    // Successfully add id of another chain
//
//    await clique.register();
//    let tx = await clique.RegisterChain(testid, testval, testgen, storage.address);
//    console.log("\tGas used to register chain = " + tx.receipt.gasUsed.toString() + " gas");
//    let chainExists = await clique.chains(testid);
//
//    assert(chainExists);
//
//    // Fail adding id of this chain
//    await clique.RegisterChain(DEPLOYEDCHAINID, testval, testgen, teststore).should.be.rejected;
//
//    // Fail adding id of chain already initialised
//    await clique.RegisterChain(testid, testval, testgen, teststore).should.be.rejected;
//  })
})

async function verifyReceipts(eP, txHash) {
    await eP.getReceiptTrieRoot(txHash).then( (root) => {
        console.log("EP RECEIPT Root hash = 0x" + root.toString('hex'))
    })

    var verified;
    await eP.getReceiptProof(txHash).then( (proof) => {
        verified = EP.receipt(proof.path, proof.value, proof.parentNodes, proof.header, proof.blockHash);
    })
    return verified;
}

function generateTestReceiptRLPNodes() {
    let root = Buffer.from("f871a012d378fe6800bc18f22e715a31971ef7e73ac5d1d85384f4b66ac32036ae43dea004d6e2678656a957ac776dbef512a04d266c1af3e2c5587fd233261a3d423213808080808080a05fac317a4d6d78181319fbc7e2cae4a9260f1a6afb5c6fea066e2308eed416818080808080808080", 'hex');
    second = Buffer.from("f90151a03da235c6dd0fbdaf208c60cbdca0d609dee2ba107495aa7adaa658362616c8aaa09ebf378a9064aa4da0512c55c790a5e007ac79d2713e4533771cd2c95be47a4da0c06fed36ffe1f2ec164ba88f73b353960448d2decbb65355c5298a33555de742a0e057afe423ee17e5499c570a56880b0f5b5c1884b90ff9b9b5baa827f72fc816a093e06093cd2fdb67e0f87cfcc35ded2f445cc1309a0ff178e59f932aeadb6d73a0193e4e939fbc5d34a570bea3fff7c6d54adcb1c3ab7ef07510e7bd5fcef2d4b3a0a17a0c71c0118092367220f65b67f2ba2eb9068ff5270baeabe8184a01a37f14a03479a38e63123d497588ad5c31d781276ec8c11352dd3895c8add34f9a2b786ba042254728bb9ab94b58adeb75d2238da6f30382969c00c65e55d4cc4aa474c0a6a03c088484aa1c73b8fb291354f80e9557ab75a01c65d046c2471d19bd7f2543d880808080808080", 'hex');
    leaf = Buffer.from("f9016b20b90167f901640183252867b9010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000010000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000f85af8589461621bcf02914668f8404c1f860e92fc1893f74ce1a027a9902e06885f7c187501d61990eae923b37634a8d6dda55a04dc7078395340a0000000000000000000000000279884e133f9346f2fad9cc158222068221b613e", 'hex');

    decodedRoot = rlp.decode(root);
    decodedSecond = rlp.decode(second);
    decodedLeaf = rlp.decode(leaf);

    nodes = rlp.encode([decodedRoot, decodedSecond, decodedLeaf]);
    return nodes;
}

function generateProof() {
    decodedPath = rlp.decode(Buffer.from(TEST_PATH.slice(2), 'hex'));
    decodedTx = rlp.decode(Buffer.from(TEST_TX_VALUE.slice(2), 'hex'));
    decodedTxNodes = rlp.decode(Buffer.from(TEST_TX_NODES.slice(2), 'hex'));
    decodedReceipt = rlp.decode(Buffer.from(TEST_RECEIPT_VALUE.slice(2), 'hex'));
    decodedReceiptNodes = rlp.decode(Buffer.from(TEST_RECEIPT_NODES.slice(2), 'hex'));

    proof = rlp.encode([decodedPath, decodedTx, decodedTxNodes, decodedReceipt, decodedReceiptNodes]);
    return proof;
}

function generateMalformedProof() {
    decodedPath = rlp.decode(Buffer.from(TEST_PATH.slice(2), 'hex'));
    decodedTx = rlp.decode(Buffer.from(TEST_TX_VALUE.slice(2), 'hex'));
    decodedTxNodes = rlp.decode(Buffer.from(TEST_TX_NODES.slice(2), 'hex'));
    decodedReceipt = rlp.decode(Buffer.from(TEST_RECEIPT_VALUE.slice(2), 'hex'));
    // Exclude receipt nodes
//    decodedReceiptNodes = rlp.decode(Buffer.from(TEST_RECEIPT_NODES.slice(2), 'hex'));

    proof = rlp.encode([decodedPath, decodedTx, decodedTxNodes, decodedReceipt]);
    return proof;
}

function generateCorruptedProof() {
    decodedPath = rlp.decode(Buffer.from(TEST_PATH.slice(2), 'hex'));
    decodedTx = rlp.decode(Buffer.from(TEST_TX_VALUE.slice(2), 'hex'));
    decodedTxNodes = rlp.decode(Buffer.from(TEST_TX_NODES.slice(2), 'hex'));
    decodedReceipt = rlp.decode(Buffer.from(TEST_RECEIPT_VALUE.slice(2), 'hex'));
    decodedReceiptNodes = rlp.decode(Buffer.from(TEST_RECEIPT_NODES.slice(2), 'hex'));

    proof = rlp.encode([decodedPath, sha3(decodedTx), decodedTxNodes, decodedReceipt, decodedReceiptNodes]);
    return proof;
}